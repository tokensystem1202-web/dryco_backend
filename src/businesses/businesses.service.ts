import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuthenticatedUser } from '../auth/auth.types';
import { UserRole } from '../auth/roles.enum';
import { BusinessEntity, OrderEntity, RiderEntity, ServiceEntity } from '../database/entities';
import {
  ApprovalDto,
  CreateBusinessDto,
  ToggleBusinessStatusDto,
  UpdateBusinessDto,
  UpdateCommissionDto,
} from './dto/business.dto';

@Injectable()
export class BusinessesService {
  constructor(
    @InjectRepository(BusinessEntity)
    private readonly businessesRepository: Repository<BusinessEntity>,
    @InjectRepository(ServiceEntity)
    private readonly servicesRepository: Repository<ServiceEntity>,
    @InjectRepository(OrderEntity)
    private readonly ordersRepository: Repository<OrderEntity>,
    @InjectRepository(RiderEntity)
    private readonly ridersRepository: Repository<RiderEntity>,
  ) {}

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
}
