import { OrderStatus, ServiceCategory } from '../../database/entities/washflow.entity';
export declare class CreateOrderItemDto {
    serviceId: string;
    itemName: string;
    category: ServiceCategory;
    quantity: number;
    pricePerUnit: number;
}
export declare class CreateOrderDto {
    businessId: string;
    pickupSlot: string;
    deliverySlot: string;
    pickupDate: string;
    deliveryDate: string;
    items: CreateOrderItemDto[];
    couponCode?: string;
    specialInstructions?: string;
}
export declare class UpdateOrderStatusDto {
    status: OrderStatus;
}
export declare class AssignRiderDto {
    riderId: string;
}
