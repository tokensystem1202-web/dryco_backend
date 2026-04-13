import { Repository } from 'typeorm';
import { AuthenticatedUser } from '../auth/auth.types';
import { BusinessEntity, BusinessRegistrationEntity, BusinessRegistrationStatus, OrderEntity, RiderEntity, ServiceEntity, UserEntity } from '../database/entities';
import { ApprovalDto, CreateBusinessDto, PublicBusinessRegistrationDto, ToggleBusinessStatusDto, UpdateBusinessDto, UpdateCommissionDto } from './dto/business.dto';
export declare class BusinessesService {
    private readonly businessesRepository;
    private readonly businessRegistrationsRepository;
    private readonly usersRepository;
    private readonly servicesRepository;
    private readonly ordersRepository;
    private readonly ridersRepository;
    constructor(businessesRepository: Repository<BusinessEntity>, businessRegistrationsRepository: Repository<BusinessRegistrationEntity>, usersRepository: Repository<UserEntity>, servicesRepository: Repository<ServiceEntity>, ordersRepository: Repository<OrderEntity>, ridersRepository: Repository<RiderEntity>);
    submitPublicRegistration(dto: PublicBusinessRegistrationDto, files: {
        idProof?: Array<{
            filename: string;
        }>;
        shopImage?: Array<{
            filename: string;
        }>;
    }): Promise<{
        id: string;
        name: string;
        owner: string;
        phone: string;
        status: BusinessRegistrationStatus;
    }>;
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
    adminListBusinessRegistrations(): Promise<{
        id: string;
        businessName: string;
        ownerName: string;
        phone: string;
        address: string;
        serviceArea: string;
        businessType: import("../database/entities").BusinessRegistrationType;
        status: BusinessRegistrationStatus;
        createdAt: Date;
        documents: {
            idProofUrl: string;
            shopImageUrl: string;
        };
    }[]>;
    getBusinessRegistrationDetails(id: string): Promise<{
        id: string;
        businessName: string;
        ownerName: string;
        phone: string;
        address: string;
        serviceArea: string;
        businessType: import("../database/entities").BusinessRegistrationType;
        status: BusinessRegistrationStatus;
        createdAt: Date;
        documents: {
            idProofUrl: string;
            shopImageUrl: string;
        };
    }>;
    approveBusinessRegistration(id: string): Promise<{
        registrationId: string;
        status: BusinessRegistrationStatus.APPROVED;
        businessId: string;
        loginPhone: string;
        loginMode: string;
        businessPortalEnabled: boolean;
    }>;
    rejectBusinessRegistration(id: string): Promise<{
        registrationId: string;
        status: BusinessRegistrationStatus.REJECTED;
    }>;
    approveBusiness(id: string, dto: ApprovalDto): Promise<BusinessEntity>;
    toggleBusinessStatus(id: string, dto: ToggleBusinessStatusDto): Promise<BusinessEntity>;
    updateCommission(id: string, dto: UpdateCommissionDto): Promise<BusinessEntity>;
    private toAdminRegistrationView;
    private extractCity;
    private extractPincode;
}
