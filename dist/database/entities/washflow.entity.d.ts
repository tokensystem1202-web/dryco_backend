export declare enum ServiceCategory {
    WASH = "wash",
    DRY_CLEAN = "dry_clean",
    IRON = "iron",
    WASH_IRON = "wash_iron"
}
export declare enum OrderStatus {
    REQUESTED = "requested",
    ACCEPTED = "accepted",
    PICKED_UP = "picked_up",
    CLEANING = "cleaning",
    OUT_FOR_DELIVERY = "out_for_delivery",
    DELIVERED = "delivered",
    CANCELLED = "cancelled"
}
export declare enum PaymentStatus {
    PENDING = "pending",
    PAID = "paid",
    REFUNDED = "refunded"
}
export declare enum SubscriptionPlan {
    SILVER = "silver",
    GOLD = "gold",
    PLATINUM = "platinum"
}
export declare enum DiscountType {
    PERCENTAGE = "percentage",
    FLAT = "flat"
}
export declare enum NotificationType {
    ORDER = "order",
    PROMO = "promo",
    SYSTEM = "system"
}
declare abstract class BaseEntityFields {
    id: string;
    createdAt: Date;
    updatedAt?: Date;
}
export declare class UserEntity extends BaseEntityFields {
    name: string;
    email: string;
    phone: string;
    passwordHash: string;
    role: 'customer' | 'business' | 'admin';
    profileImage?: string;
    address?: string;
    city?: string;
    pincode?: string;
    isActive: boolean;
}
export declare class BusinessEntity extends BaseEntityFields {
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
}
export declare class ServiceEntity extends BaseEntityFields {
    businessId: string;
    name: string;
    category: ServiceCategory;
    pricePerUnit: number;
    unit: string;
    description?: string;
    isActive: boolean;
}
export declare class OrderEntity extends BaseEntityFields {
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
}
export declare class OrderItemEntity {
    id: string;
    orderId: string;
    serviceId: string;
    itemName: string;
    category: ServiceCategory;
    quantity: number;
    pricePerUnit: number;
    totalPrice: number;
}
export declare class SubscriptionEntity extends BaseEntityFields {
    customerId: string;
    businessId: string;
    planName: SubscriptionPlan;
    pricePerMonth: number;
    itemsLimit?: number;
    discountPercentage: number;
    startDate: string;
    endDate: string;
    isActive: boolean;
    autoRenew: boolean;
}
export declare class RiderEntity extends BaseEntityFields {
    businessId: string;
    name: string;
    phone: string;
    email: string;
    vehicleType: string;
    vehicleNumber: string;
    licenseNumber: string;
    profileImage?: string;
    isAvailable: boolean;
    isActive: boolean;
    totalDeliveries: number;
    rating: number;
}
export declare class CouponEntity {
    id: string;
    businessId?: string;
    code: string;
    discountType: DiscountType;
    discountValue: number;
    minOrderValue: number;
    maxDiscount?: number;
    usageLimit?: number;
    usedCount: number;
    validFrom: Date;
    validTill: Date;
    isActive: boolean;
}
export declare class ReviewEntity {
    id: string;
    orderId: string;
    customerId: string;
    businessId: string;
    rating: number;
    comment?: string;
    createdAt: Date;
}
export declare class CommissionEntity {
    id: string;
    orderId: string;
    businessId: string;
    orderAmount: number;
    commissionRate: number;
    commissionAmount: number;
    platformEarning: number;
    settled: boolean;
    settlementDate?: Date;
    createdAt: Date;
}
export declare class NotificationEntity {
    id: string;
    userId: string;
    title: string;
    message: string;
    type: NotificationType;
    isRead: boolean;
    createdAt: Date;
}
export declare class OtpVerificationEntity {
    id: string;
    recipient: string;
    otp: string;
    expiresAt: Date;
    isUsed: boolean;
}
export {};
