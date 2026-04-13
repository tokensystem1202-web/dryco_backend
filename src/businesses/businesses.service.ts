import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { hash } from 'bcryptjs';
import { randomBytes } from 'crypto';
import { Repository } from 'typeorm';
import { AuthenticatedUser } from '../auth/auth.types';
import { UserRole } from '../auth/roles.enum';
import {
  BusinessEntity,
  BusinessRegistrationEntity,
  BusinessRegistrationStatus,
  OrderEntity,
  RiderEntity,
  ServiceEntity,
  UserEntity,
} from '../database/entities';
import {
  ApprovalDto,
  CreateBusinessDto,
  PublicBusinessRegistrationDto,
  ToggleBusinessStatusDto,
  UpdateBusinessDto,
  UpdateCommissionDto,
} from './dto/business.dto';

@Injectable()
export class BusinessesService {
  constructor(
    @InjectRepository(BusinessEntity)
    private readonly businessesRepository: Repository<BusinessEntity>,
    @InjectRepository(BusinessRegistrationEntity)
    private readonly businessRegistrationsRepository: Repository<BusinessRegistrationEntity>,
    @InjectRepository(UserEntity)
    private readonly usersRepository: Repository<UserEntity>,
    @InjectRepository(ServiceEntity)
    private readonly servicesRepository: Repository<ServiceEntity>,
    @InjectRepository(OrderEntity)
    private readonly ordersRepository: Repository<OrderEntity>,
    @InjectRepository(RiderEntity)
    private readonly ridersRepository: Repository<RiderEntity>,
  ) {}

  async submitPublicRegistration(
    dto: PublicBusinessRegistrationDto,
    files: { idProof?: Array<{ filename: string }>; shopImage?: Array<{ filename: string }> },
  ) {
    const normalizedPhone = dto.phone.trim();
    const existingPending = await this.businessRegistrationsRepository.findOne({
      where: {
        phone: normalizedPhone,
        status: BusinessRegistrationStatus.PENDING,
      },
    });

    if (existingPending) {
      throw new BadRequestException('A pending business registration already exists for this phone number');
    }

    const registration = this.businessRegistrationsRepository.create({
      businessName: dto.businessName.trim(),
      ownerName: dto.ownerName.trim(),
      phone: normalizedPhone,
      address: dto.address.trim(),
      serviceArea: dto.serviceArea.trim(),
      businessType: dto.businessType,
      idProofPath: files.idProof?.[0]?.filename,
      shopImagePath: files.shopImage?.[0]?.filename,
      status: BusinessRegistrationStatus.PENDING,
    });

    const saved = await this.businessRegistrationsRepository.save(registration);

    return {
      id: saved.id,
      name: saved.businessName,
      owner: saved.ownerName,
      phone: saved.phone,
      status: saved.status,
    };
  }

  async registerBusiness(user: AuthenticatedUser, dto: CreateBusinessDto) {
    const existingBusiness = await this.businessesRepository.findOne({
      where: { userId: user.userId },
    });

    if (existingBusiness) {
      throw new ForbiddenException('Business already registered for this user');
    }

    const business = this.businessesRepository.create({
      userId: user.userId,
      ...dto,
      isApproved: false,
      isActive: true,
      commissionRate: 15,
      totalOrders: 0,
      rating: 0,
    });

    return this.businessesRepository.save(business);
  }

  async listApprovedBusinesses(filters: Record<string, string | undefined>) {
    const query = this.businessesRepository.createQueryBuilder('business');

    query.where('business.isApproved = :isApproved', { isApproved: true });
    query.andWhere('business.isActive = :isActive', { isActive: true });

    if (filters.city) {
      query.andWhere('LOWER(business.city) = LOWER(:city)', { city: filters.city });
    }

    if (filters.rating) {
      query.andWhere('business.rating >= :rating', { rating: Number(filters.rating) });
    }

    return {
      filters,
      items: await query.orderBy('business.createdAt', 'DESC').getMany(),
    };
  }

  async getBusinessDetails(id: string) {
    const business = await this.businessesRepository.findOne({ where: { id } });

    if (!business) {
      throw new NotFoundException('Business not found');
    }

    return {
      ...business,
      services: await this.servicesRepository.find({
        where: { businessId: id, isActive: true },
        order: { createdAt: 'DESC' },
      }),
    };
  }

  async updateBusiness(user: AuthenticatedUser, id: string, dto: UpdateBusinessDto) {
    const business = await this.businessesRepository.findOne({ where: { id } });

    if (!business) {
      throw new NotFoundException('Business not found');
    }

    if (user.role !== UserRole.ADMIN && business.userId !== user.userId) {
      throw new ForbiddenException('You can update only your own business');
    }

    Object.assign(business, dto);
    return this.businessesRepository.save(business);
  }

  async getMyBusiness(user: AuthenticatedUser) {
    return this.businessesRepository.findOne({ where: { userId: user.userId } });
  }

  async getBusinessStats(user: AuthenticatedUser, id: string) {
    const business = await this.businessesRepository.findOne({ where: { id } });

    if (!business) {
      throw new NotFoundException('Business not found');
    }

    if (user.role !== UserRole.ADMIN && business.userId !== user.userId) {
      throw new ForbiddenException('You can view only your own business stats');
    }

    const [totalOrders, deliveredTotals, pendingOrders, activeRiders] = await Promise.all([
      this.ordersRepository.count({ where: { businessId: id } }),
      this.ordersRepository
        .createQueryBuilder('order')
        .select('COALESCE(SUM(order.totalAmount), 0)', 'revenue')
        .where('order.businessId = :businessId', { businessId: id })
        .andWhere('order.status = :status', { status: 'delivered' })
        .getRawOne<{ revenue: string }>(),
      this.ordersRepository
        .createQueryBuilder('order')
        .where('order.businessId = :businessId', { businessId: id })
        .andWhere('order.status IN (:...statuses)', {
          statuses: ['requested', 'accepted', 'picked_up', 'cleaning', 'out_for_delivery'],
        })
        .getCount(),
      this.ridersRepository.count({ where: { businessId: id, isActive: true } }),
    ]);

    return {
      businessId: id,
      totalOrders,
      revenue: Number(deliveredTotals?.revenue ?? 0),
      pendingOrders,
      activeRiders,
    };
  }

  async adminListBusinesses() {
    return this.businessesRepository.find({ order: { createdAt: 'DESC' } });
  }

  async adminListBusinessRegistrations() {
    const registrations = await this.businessRegistrationsRepository.find({
      order: { createdAt: 'DESC' },
    });

    return registrations.map((registration) => this.toAdminRegistrationView(registration));
  }

  async getBusinessRegistrationDetails(id: string) {
    const registration = await this.businessRegistrationsRepository.findOne({ where: { id } });

    if (!registration) {
      throw new NotFoundException('Business registration not found');
    }

    return this.toAdminRegistrationView(registration);
  }

  async approveBusinessRegistration(id: string) {
    const registration = await this.businessRegistrationsRepository.findOne({ where: { id } });

    if (!registration) {
      throw new NotFoundException('Business registration not found');
    }

    if (registration.status === BusinessRegistrationStatus.REJECTED) {
      throw new BadRequestException('Rejected registration cannot be approved directly');
    }

    const existingPhoneUser = await this.usersRepository.findOne({
      where: { phone: registration.phone },
    });

    if (existingPhoneUser && existingPhoneUser.role !== UserRole.BUSINESS) {
      throw new ConflictException('This phone number already belongs to a non-business account');
    }

    const emailSeed = `${registration.businessName}-${registration.id}`
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
    const generatedEmail = `${emailSeed || 'business'}@partners.dryco.local`;

    const user = existingPhoneUser
      ? await this.usersRepository.save({
          ...existingPhoneUser,
          name: registration.ownerName,
          role: UserRole.BUSINESS,
          address: registration.address,
          city: this.extractCity(registration),
          pincode: this.extractPincode(registration),
          isActive: true,
        })
      : await this.usersRepository.save(
          this.usersRepository.create({
            name: registration.ownerName,
            email: generatedEmail,
            phone: registration.phone,
            passwordHash: await hash(randomBytes(24).toString('hex'), 10),
            role: UserRole.BUSINESS,
            address: registration.address,
            city: this.extractCity(registration),
            pincode: this.extractPincode(registration),
            isActive: true,
          }),
        );

    const existingBusiness = await this.businessesRepository.findOne({
      where: { userId: user.id },
    });

    const business = existingBusiness
      ? existingBusiness
      : await this.businessesRepository.save(
          this.businessesRepository.create({
            userId: user.id,
            businessName: registration.businessName,
            address: registration.address,
            city: this.extractCity(registration),
            pincode: this.extractPincode(registration),
            gstNumber: null,
            isApproved: true,
            isActive: true,
            commissionRate: 15,
            rating: 0,
            totalOrders: 0,
          }),
        );

    if (existingBusiness && !existingBusiness.isApproved) {
      existingBusiness.isApproved = true;
      existingBusiness.isActive = true;
      await this.businessesRepository.save(existingBusiness);
    }

    registration.status = BusinessRegistrationStatus.APPROVED;
    await this.businessRegistrationsRepository.save(registration);

    return {
      registrationId: registration.id,
      status: registration.status,
      businessId: business.id,
      loginPhone: user.phone,
      loginMode: 'otp',
      businessPortalEnabled: true,
    };
  }

  async rejectBusinessRegistration(id: string) {
    const registration = await this.businessRegistrationsRepository.findOne({ where: { id } });

    if (!registration) {
      throw new NotFoundException('Business registration not found');
    }

    registration.status = BusinessRegistrationStatus.REJECTED;
    await this.businessRegistrationsRepository.save(registration);

    return {
      registrationId: registration.id,
      status: registration.status,
    };
  }

  async approveBusiness(id: string, dto: ApprovalDto) {
    const business = await this.businessesRepository.findOne({ where: { id } });

    if (!business) {
      throw new NotFoundException('Business not found');
    }

    business.isApproved = dto.approved;
    return this.businessesRepository.save(business);
  }

  async toggleBusinessStatus(id: string, dto: ToggleBusinessStatusDto) {
    const business = await this.businessesRepository.findOne({ where: { id } });

    if (!business) {
      throw new NotFoundException('Business not found');
    }

    business.isActive = dto.isActive;
    return this.businessesRepository.save(business);
  }

  async updateCommission(id: string, dto: UpdateCommissionDto) {
    const business = await this.businessesRepository.findOne({ where: { id } });

    if (!business) {
      throw new NotFoundException('Business not found');
    }

    business.commissionRate = dto.commissionRate;
    return this.businessesRepository.save(business);
  }

  private toAdminRegistrationView(registration: BusinessRegistrationEntity) {
    return {
      id: registration.id,
      businessName: registration.businessName,
      ownerName: registration.ownerName,
      phone: registration.phone,
      address: registration.address,
      serviceArea: registration.serviceArea,
      businessType: registration.businessType,
      status: registration.status,
      createdAt: registration.createdAt,
      documents: {
        idProofUrl: registration.idProofPath
          ? `/uploads/business-registrations/${registration.idProofPath}`
          : null,
        shopImageUrl: registration.shopImagePath
          ? `/uploads/business-registrations/${registration.shopImagePath}`
          : null,
      },
    };
  }

  private extractCity(registration: BusinessRegistrationEntity) {
    const serviceAreaToken = registration.serviceArea.split(',')[0]?.trim();
    const addressToken = registration.address.split(',')[1]?.trim();
    return serviceAreaToken || addressToken || 'Unknown City';
  }

  private extractPincode(registration: BusinessRegistrationEntity) {
    const match = `${registration.address} ${registration.serviceArea}`.match(/\b\d{6}\b/);
    return match?.[0] ?? '000000';
  }
}
