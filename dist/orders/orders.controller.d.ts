import { AuthenticatedUser } from '../auth/auth.types';
import { AssignRiderDto, CreateOrderDto, UpdateOrderStatusDto } from './dto/order.dto';
import { OrdersService } from './orders.service';
export declare class OrdersController {
    private readonly ordersService;
    constructor(ordersService: OrdersService);
    createOrder(user: AuthenticatedUser, dto: CreateOrderDto): Promise<{
        items: {
            serviceId: string;
            itemName: string;
            category: import("../database/entities/washflow.entity").ServiceCategory;
            quantity: number;
            pricePerUnit: number;
            totalPrice: number;
        }[];
        orderNumber: string;
        customerId: string;
        businessId: string;
        riderId?: string;
        status: import("../database/entities/washflow.entity").OrderStatus;
        pickupSlot: string;
        deliverySlot: string;
        pickupDate: string;
        deliveryDate: string;
        subtotal: number;
        discountAmount: number;
        couponCode?: string;
        taxAmount: number;
        totalAmount: number;
        paymentStatus: import("../database/entities/washflow.entity").PaymentStatus;
        paymentMethod?: string;
        paymentId?: string;
        specialInstructions?: string;
        id: string;
        createdAt: Date;
        updatedAt?: Date;
    }>;
    getCustomerOrders(user: AuthenticatedUser): Promise<{
        customerId: string;
        items: import("../database/entities").OrderEntity[];
    }>;
    getOrderDetails(user: AuthenticatedUser, id: string): Promise<{
        items: import("../database/entities").OrderItemEntity[];
        timeline: {
            label: string;
            status: import("../database/entities/washflow.entity").OrderStatus;
            at: Date;
        }[];
        orderNumber: string;
        customerId: string;
        businessId: string;
        riderId?: string;
        status: import("../database/entities/washflow.entity").OrderStatus;
        pickupSlot: string;
        deliverySlot: string;
        pickupDate: string;
        deliveryDate: string;
        subtotal: number;
        discountAmount: number;
        couponCode?: string;
        taxAmount: number;
        totalAmount: number;
        paymentStatus: import("../database/entities/washflow.entity").PaymentStatus;
        paymentMethod?: string;
        paymentId?: string;
        specialInstructions?: string;
        id: string;
        createdAt: Date;
        updatedAt?: Date;
    }>;
    cancelOrder(user: AuthenticatedUser, id: string): Promise<{
        id: string;
        status: import("../database/entities/washflow.entity").OrderStatus.CANCELLED;
    }>;
    reorder(user: AuthenticatedUser, id: string): Promise<{
        sourceOrderId: string;
        orderId: string;
        cloned: boolean;
    }>;
    getBusinessOrders(user: AuthenticatedUser, query: Record<string, string | undefined>): Promise<{
        filters: Record<string, string>;
        items: {
            items: import("../database/entities").OrderItemEntity[];
            orderNumber: string;
            customerId: string;
            businessId: string;
            riderId?: string;
            status: import("../database/entities/washflow.entity").OrderStatus;
            pickupSlot: string;
            deliverySlot: string;
            pickupDate: string;
            deliveryDate: string;
            subtotal: number;
            discountAmount: number;
            couponCode?: string;
            taxAmount: number;
            totalAmount: number;
            paymentStatus: import("../database/entities/washflow.entity").PaymentStatus;
            paymentMethod?: string;
            paymentId?: string;
            specialInstructions?: string;
            id: string;
            createdAt: Date;
            updatedAt?: Date;
        }[];
    }>;
    updateOrderStatus(user: AuthenticatedUser, id: string, dto: UpdateOrderStatusDto): Promise<{
        orderId: string;
        status: import("../database/entities/washflow.entity").OrderStatus;
    }>;
    updateOrderStatusAlias(user: AuthenticatedUser, id: string, dto: UpdateOrderStatusDto): Promise<{
        orderId: string;
        status: import("../database/entities/washflow.entity").OrderStatus;
    }>;
    assignRider(user: AuthenticatedUser, id: string, dto: AssignRiderDto): Promise<{
        orderId: string;
        riderId: string;
        assigned: boolean;
    }>;
    adminListOrders(query: Record<string, string | undefined>): Promise<{
        filters: Record<string, string>;
        items: import("../database/entities").OrderEntity[];
    }>;
}
