import { Repository } from 'typeorm';
import { AuthenticatedUser } from '../auth/auth.types';
import { BusinessEntity, CouponEntity, NotificationEntity, OrderEntity, OrderItemEntity, RiderEntity, ServiceEntity, SubscriptionEntity } from '../database/entities';
import { OrderStatus, PaymentStatus } from '../database/entities/washflow.entity';
import { AssignRiderDto, CreateOrderDto, UpdateOrderStatusDto } from './dto/order.dto';
import { OrdersGateway } from './orders.gateway';
export declare class OrdersService {
    private readonly ordersRepository;
    private readonly orderItemsRepository;
    private readonly servicesRepository;
    private readonly businessesRepository;
    private readonly ridersRepository;
    private readonly subscriptionsRepository;
    private readonly couponsRepository;
    private readonly notificationsRepository;
    private readonly ordersGateway;
    constructor(ordersRepository: Repository<OrderEntity>, orderItemsRepository: Repository<OrderItemEntity>, servicesRepository: Repository<ServiceEntity>, businessesRepository: Repository<BusinessEntity>, ridersRepository: Repository<RiderEntity>, subscriptionsRepository: Repository<SubscriptionEntity>, couponsRepository: Repository<CouponEntity>, notificationsRepository: Repository<NotificationEntity>, ordersGateway: OrdersGateway);
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
        status: OrderStatus;
        pickupSlot: string;
        deliverySlot: string;
        pickupDate: string;
        deliveryDate: string;
        subtotal: number;
        discountAmount: number;
        couponCode?: string;
        taxAmount: number;
        totalAmount: number;
        paymentStatus: PaymentStatus;
        paymentMethod?: string;
        paymentId?: string;
        specialInstructions?: string;
        id: string;
        createdAt: Date;
        updatedAt?: Date;
    }>;
    getCustomerOrders(user: AuthenticatedUser): Promise<{
        customerId: string;
        items: OrderEntity[];
    }>;
    getOrderDetails(user: AuthenticatedUser, id: string): Promise<{
        items: OrderItemEntity[];
        timeline: {
            label: string;
            status: OrderStatus;
            at: Date;
        }[];
        orderNumber: string;
        customerId: string;
        businessId: string;
        riderId?: string;
        status: OrderStatus;
        pickupSlot: string;
        deliverySlot: string;
        pickupDate: string;
        deliveryDate: string;
        subtotal: number;
        discountAmount: number;
        couponCode?: string;
        taxAmount: number;
        totalAmount: number;
        paymentStatus: PaymentStatus;
        paymentMethod?: string;
        paymentId?: string;
        specialInstructions?: string;
        id: string;
        createdAt: Date;
        updatedAt?: Date;
    }>;
    cancelOrder(user: AuthenticatedUser, id: string): Promise<{
        id: string;
        status: OrderStatus.CANCELLED;
    }>;
    reorder(user: AuthenticatedUser, id: string): Promise<{
        sourceOrderId: string;
        orderId: string;
        cloned: boolean;
    }>;
    getBusinessOrders(user: AuthenticatedUser, query: Record<string, string | undefined>): Promise<{
        filters: Record<string, string>;
        items: {
            items: OrderItemEntity[];
            orderNumber: string;
            customerId: string;
            businessId: string;
            riderId?: string;
            status: OrderStatus;
            pickupSlot: string;
            deliverySlot: string;
            pickupDate: string;
            deliveryDate: string;
            subtotal: number;
            discountAmount: number;
            couponCode?: string;
            taxAmount: number;
            totalAmount: number;
            paymentStatus: PaymentStatus;
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
        status: OrderStatus;
    }>;
    assignRider(user: AuthenticatedUser, id: string, dto: AssignRiderDto): Promise<{
        orderId: string;
        riderId: string;
        assigned: boolean;
    }>;
    adminListOrders(query: Record<string, string | undefined>): Promise<{
        filters: Record<string, string>;
        items: OrderEntity[];
    }>;
    private calculateSubscriptionDiscount;
    private calculateCouponDiscount;
    private assertBusinessOwnership;
    private generateOrderNumber;
    private validateSlots;
}
