import { ServiceCategory } from '../../database/entities/washflow.entity';
export declare class CreateServiceDto {
    businessId: string;
    name: string;
    category: ServiceCategory;
    pricePerUnit: number;
    unit: string;
    description?: string;
}
export declare class UpdateServiceDto {
    name?: string;
    category?: ServiceCategory;
    pricePerUnit?: number;
    unit?: string;
    description?: string;
    isActive?: boolean;
}
