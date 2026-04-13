import { AuthenticatedUser } from '../auth/auth.types';
import { ApprovalDto, CreateBusinessDto, ToggleBusinessStatusDto, UpdateBusinessDto, UpdateCommissionDto } from './dto/business.dto';
import { BusinessesService } from './businesses.service';
export declare class BusinessesController {
    private readonly businessesService;
    constructor(businessesService: BusinessesService);
    registerBusiness(user: AuthenticatedUser, dto: CreateBusinessDto): Promise<import("../database/entities").BusinessEntity>;
    listBusinesses(query: Record<string, string | undefined>): Promise<{
        filters: Record<string, string>;
        items: import("../database/entities").BusinessEntity[];
    }>;
    getMyBusiness(user: AuthenticatedUser): Promise<import("../database/entities").BusinessEntity>;
    getBusinessDetails(id: string): Promise<{
        services: import("../database/entities").ServiceEntity[];
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
    updateBusiness(user: AuthenticatedUser, id: string, dto: UpdateBusinessDto): Promise<import("../database/entities").BusinessEntity>;
    getBusinessStats(user: AuthenticatedUser, id: string): Promise<{
        businessId: string;
        totalOrders: number;
        revenue: number;
        pendingOrders: number;
        activeRiders: number;
    }>;
    adminListBusinesses(): Promise<import("../database/entities").BusinessEntity[]>;
    approveBusiness(id: string, dto: ApprovalDto): Promise<import("../database/entities").BusinessEntity>;
    toggleBusinessStatus(id: string, dto: ToggleBusinessStatusDto): Promise<import("../database/entities").BusinessEntity>;
    updateCommission(id: string, dto: UpdateCommissionDto): Promise<import("../database/entities").BusinessEntity>;
}
