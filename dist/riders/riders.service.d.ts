import { CreateRiderDto, ToggleAvailabilityDto, UpdateRiderDto } from './dto/rider.dto';
export declare class RidersService {
    create(dto: CreateRiderDto): {
        isAvailable: boolean;
        isActive: boolean;
        totalDeliveries: number;
        rating: number;
        businessId: string;
        name: string;
        phone: string;
        email: string;
        vehicleType: string;
        vehicleNumber: string;
        licenseNumber: string;
        id: `${string}-${string}-${string}-${string}-${string}`;
    };
    findAll(): {
        id: string;
        name: string;
        isAvailable: boolean;
    }[];
    update(id: string, dto: UpdateRiderDto): {
        name?: string;
        phone?: string;
        vehicleType?: string;
        id: string;
    };
    remove(id: string): {
        id: string;
        removed: boolean;
    };
    toggleAvailability(id: string, dto: ToggleAvailabilityDto): {
        isAvailable: boolean;
        id: string;
    };
    getHistory(id: string): {
        riderId: string;
        deliveries: {
            orderNumber: string;
            deliveredAt: string;
        }[];
    };
}
