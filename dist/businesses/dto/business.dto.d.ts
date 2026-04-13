export declare class CreateBusinessDto {
    businessName: string;
    address: string;
    city: string;
    pincode: string;
    gstNumber?: string;
}
export declare class UpdateBusinessDto {
    businessName?: string;
    address?: string;
    city?: string;
    pincode?: string;
    gstNumber?: string;
}
export declare class UpdateCommissionDto {
    commissionRate: number;
}
export declare class ApprovalDto {
    approved: boolean;
}
export declare class ToggleBusinessStatusDto {
    isActive: boolean;
}
