import { Repository } from 'typeorm';
import { AuthenticatedUser } from '../auth/auth.types';
import { BusinessEntity, OrderEntity, RiderEntity, ServiceEntity } from '../database/entities';
import { ApprovalDto, CreateBusinessDto, ToggleBusinessStatusDto, UpdateBusinessDto, UpdateCommissionDto } from './dto/business.dto';
export declare class BusinessesService {
    private readonly businessesRepository;
    private readonly servicesRepository;
    private readonly ordersRepository;
    private readonly ridersRepository;
    constructor(businessesRepository: Repository<BusinessEntity>, servicesRepository: Repository<ServiceEntity>, ordersRepository: Repository<OrderEntity>, ridersRepository: Repository<RiderEntity>);
    registerBusiness(user: AuthenticatedUser, dto: CreateBusinessDto): Promise<BusinessEntity>;
    listApprovedBusinesses(filters: Record<string, string | undefined>): Promise<{
        filters: Record<string, string>;
        items: BusinessEntity[];
    }>;
    getBusinessDetails(id: string): Promise<{
        services: ServiceEntity[];
        userId: string;
        businessName: string;
        logo?: string;
        address: string;
        city: string;
        pincode: string;
        gstNumber?: string;
        isApproved: boolean;
        isActive: boolean;
        commissionRate: number;
        rating: number;
        totalOrders: number;
        id: string;
        createdAt: Date;
        updatedAt?: Date;
    }>;
    updateBusiness(user: AuthenticatedUser, id: string, dto: UpdateBusinessDto): Promise<BusinessEntity>;
    getMyBusiness(user: AuthenticatedUser): Promise<BusinessEntity>;
    getBusinessStats(user: AuthenticatedUser, id: string): Promise<{
        businessId: string;
        totalOrders: number;
        revenue: number;
        pendingOrders: number;
        activeRiders: number;
    }>;
    adminListBusinesses(): Promise<BusinessEntity[]>;
    approveBusiness(id: string, dto: ApprovalDto): Promise<BusinessEntity>;
    toggleBusinessStatus(id: string, dto: ToggleBusinessStatusDto): Promise<BusinessEntity>;
    updateCommission(id: string, dto: UpdateCommissionDto): Promise<BusinessEntity>;
}
