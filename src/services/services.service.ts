import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuthenticatedUser } from '../auth/auth.types';
import { BusinessEntity, ServiceEntity } from '../database/entities';
import { CreateServiceDto, UpdateServiceDto } from './dto/service.dto';

@Injectable()
export class ServicesService {
  constructor(
    @InjectRepository(ServiceEntity)
    private readonly servicesRepository: Repository<ServiceEntity>,
    @InjectRepository(BusinessEntity)
    private readonly businessesRepository: Repository<BusinessEntity>,
  ) {}

  async create(user: AuthenticatedUser, dto: CreateServiceDto) {
    const business = await this.businessesRepository.findOne({ where: { id: dto.businessId } });

    if (!business) {
      throw new NotFoundException('Business not found');
    }

    if (business.userId !== user.userId) {
      throw new ForbiddenException('You can add services only to your own business');
    }

    return this.servicesRepository.save(
      this.servicesRepository.create({
        ...dto,
        isActive: true,
      }),
    );
  }

  async findByBusiness(businessId: string) {
    return this.servicesRepository.find({
      where: { businessId, isActive: true },
      order: { createdAt: 'DESC' },
    });
  }

  async update(user: AuthenticatedUser, id: string, dto: UpdateServiceDto) {
    const service = await this.servicesRepository.findOne({ where: { id } });

    if (!service) {
      throw new NotFoundException('Service not found');
    }

    const business = await this.businessesRepository.findOne({ where: { id: service.businessId } });
    if (!business || business.userId !== user.userId) {
      throw new ForbiddenException('You can update only your own business services');
    }

    Object.assign(service, dto);
    return this.servicesRepository.save(service);
  }

  async remove(user: AuthenticatedUser, id: string) {
    const service = await this.servicesRepository.findOne({ where: { id } });

    if (!service) {
      throw new NotFoundException('Service not found');
    }

    const business = await this.businessesRepository.findOne({ where: { id: service.businessId } });
    if (!business || business.userId !== user.userId) {
      throw new ForbiddenException('You can delete only your own business services');
    }

    service.isActive = false;
    await this.servicesRepository.save(service);
    return { id, removed: true };
  }
}
