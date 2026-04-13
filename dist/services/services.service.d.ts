import { Repository } from 'typeorm';
import { AuthenticatedUser } from '../auth/auth.types';
import { BusinessEntity, ServiceEntity } from '../database/entities';
import { CreateServiceDto, UpdateServiceDto } from './dto/service.dto';
export declare class ServicesService {
    private readonly servicesRepository;
    private readonly businessesRepository;
    constructor(servicesRepository: Repository<ServiceEntity>, businessesRepository: Repository<BusinessEntity>);
    create(user: AuthenticatedUser, dto: CreateServiceDto): Promise<ServiceEntity>;
    findByBusiness(businessId: string): Promise<ServiceEntity[]>;
    update(user: AuthenticatedUser, id: string, dto: UpdateServiceDto): Promise<ServiceEntity>;
    remove(user: AuthenticatedUser, id: string): Promise<{
        id: string;
        removed: boolean;
    }>;
}
