export declare class CreateRiderDto {
    businessId: string;
    name: string;
    phone: string;
    email: string;
    vehicleType: string;
    vehicleNumber: string;
    licenseNumber: string;
}
export declare class UpdateRiderDto {
    name?: string;
    phone?: string;
    vehicleType?: string;
}
export declare class ToggleAvailabilityDto {
    isAvailable: boolean;
}
