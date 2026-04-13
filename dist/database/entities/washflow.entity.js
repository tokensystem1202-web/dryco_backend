"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OtpVerificationEntity = exports.NotificationEntity = exports.CommissionEntity = exports.ReviewEntity = exports.CouponEntity = exports.RiderEntity = exports.SubscriptionEntity = exports.OrderItemEntity = exports.OrderEntity = exports.ServiceEntity = exports.BusinessEntity = exports.UserEntity = exports.NotificationType = exports.DiscountType = exports.SubscriptionPlan = exports.PaymentStatus = exports.OrderStatus = exports.ServiceCategory = void 0;
const typeorm_1 = require("typeorm");
var ServiceCategory;
(function (ServiceCategory) {
    ServiceCategory["WASH"] = "wash";
    ServiceCategory["DRY_CLEAN"] = "dry_clean";
    ServiceCategory["IRON"] = "iron";
    ServiceCategory["WASH_IRON"] = "wash_iron";
})(ServiceCategory || (exports.ServiceCategory = ServiceCategory = {}));
var OrderStatus;
(function (OrderStatus) {
    OrderStatus["REQUESTED"] = "requested";
    OrderStatus["ACCEPTED"] = "accepted";
    OrderStatus["PICKED_UP"] = "picked_up";
    OrderStatus["CLEANING"] = "cleaning";
    OrderStatus["OUT_FOR_DELIVERY"] = "out_for_delivery";
    OrderStatus["DELIVERED"] = "delivered";
    OrderStatus["CANCELLED"] = "cancelled";
})(OrderStatus || (exports.OrderStatus = OrderStatus = {}));
var PaymentStatus;
(function (PaymentStatus) {
    PaymentStatus["PENDING"] = "pending";
    PaymentStatus["PAID"] = "paid";
    PaymentStatus["REFUNDED"] = "refunded";
})(PaymentStatus || (exports.PaymentStatus = PaymentStatus = {}));
var SubscriptionPlan;
(function (SubscriptionPlan) {
    SubscriptionPlan["SILVER"] = "silver";
    SubscriptionPlan["GOLD"] = "gold";
    SubscriptionPlan["PLATINUM"] = "platinum";
})(SubscriptionPlan || (exports.SubscriptionPlan = SubscriptionPlan = {}));
var DiscountType;
(function (DiscountType) {
    DiscountType["PERCENTAGE"] = "percentage";
    DiscountType["FLAT"] = "flat";
})(DiscountType || (exports.DiscountType = DiscountType = {}));
var NotificationType;
(function (NotificationType) {
    NotificationType["ORDER"] = "order";
    NotificationType["PROMO"] = "promo";
    NotificationType["SYSTEM"] = "system";
})(NotificationType || (exports.NotificationType = NotificationType = {}));
class BaseEntityFields {
}
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], BaseEntityFields.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], BaseEntityFields.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at', nullable: true }),
    __metadata("design:type", Date)
], BaseEntityFields.prototype, "updatedAt", void 0);
let UserEntity = class UserEntity extends BaseEntityFields {
};
exports.UserEntity = UserEntity;
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], UserEntity.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)({ unique: true }),
    __metadata("design:type", String)
], UserEntity.prototype, "email", void 0);
__decorate([
    (0, typeorm_1.Column)({ unique: true }),
    __metadata("design:type", String)
], UserEntity.prototype, "phone", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'password_hash' }),
    __metadata("design:type", String)
], UserEntity.prototype, "passwordHash", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'enum', enum: ['customer', 'business', 'admin'] }),
    __metadata("design:type", String)
], UserEntity.prototype, "role", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'profile_image', nullable: true }),
    __metadata("design:type", String)
], UserEntity.prototype, "profileImage", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], UserEntity.prototype, "address", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], UserEntity.prototype, "city", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], UserEntity.prototype, "pincode", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'is_active', default: true }),
    __metadata("design:type", Boolean)
], UserEntity.prototype, "isActive", void 0);
exports.UserEntity = UserEntity = __decorate([
    (0, typeorm_1.Entity)('users')
], UserEntity);
let BusinessEntity = class BusinessEntity extends BaseEntityFields {
};
exports.BusinessEntity = BusinessEntity;
__decorate([
    (0, typeorm_1.Column)({ name: 'user_id' }),
    __metadata("design:type", String)
], BusinessEntity.prototype, "userId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'business_name' }),
    __metadata("design:type", String)
], BusinessEntity.prototype, "businessName", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], BusinessEntity.prototype, "logo", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], BusinessEntity.prototype, "address", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], BusinessEntity.prototype, "city", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], BusinessEntity.prototype, "pincode", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'gst_number', nullable: true }),
    __metadata("design:type", String)
], BusinessEntity.prototype, "gstNumber", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'is_approved', default: false }),
    __metadata("design:type", Boolean)
], BusinessEntity.prototype, "isApproved", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'is_active', default: true }),
    __metadata("design:type", Boolean)
], BusinessEntity.prototype, "isActive", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'commission_rate', type: 'decimal', precision: 5, scale: 2, default: 15 }),
    __metadata("design:type", Number)
], BusinessEntity.prototype, "commissionRate", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 3, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], BusinessEntity.prototype, "rating", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'total_orders', default: 0 }),
    __metadata("design:type", Number)
], BusinessEntity.prototype, "totalOrders", void 0);
exports.BusinessEntity = BusinessEntity = __decorate([
    (0, typeorm_1.Entity)('businesses')
], BusinessEntity);
let ServiceEntity = class ServiceEntity extends BaseEntityFields {
};
exports.ServiceEntity = ServiceEntity;
__decorate([
    (0, typeorm_1.Column)({ name: 'business_id' }),
    __metadata("design:type", String)
], ServiceEntity.prototype, "businessId", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], ServiceEntity.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'enum', enum: ServiceCategory }),
    __metadata("design:type", String)
], ServiceEntity.prototype, "category", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'price_per_unit', type: 'decimal', precision: 10, scale: 2 }),
    __metadata("design:type", Number)
], ServiceEntity.prototype, "pricePerUnit", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], ServiceEntity.prototype, "unit", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], ServiceEntity.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'is_active', default: true }),
    __metadata("design:type", Boolean)
], ServiceEntity.prototype, "isActive", void 0);
exports.ServiceEntity = ServiceEntity = __decorate([
    (0, typeorm_1.Entity)('services')
], ServiceEntity);
let OrderEntity = class OrderEntity extends BaseEntityFields {
};
exports.OrderEntity = OrderEntity;
__decorate([
    (0, typeorm_1.Column)({ name: 'order_number', unique: true }),
    __metadata("design:type", String)
], OrderEntity.prototype, "orderNumber", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'customer_id' }),
    __metadata("design:type", String)
], OrderEntity.prototype, "customerId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'business_id' }),
    __metadata("design:type", String)
], OrderEntity.prototype, "businessId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'rider_id', nullable: true }),
    __metadata("design:type", String)
], OrderEntity.prototype, "riderId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'enum', enum: OrderStatus, default: OrderStatus.REQUESTED }),
    __metadata("design:type", String)
], OrderEntity.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'pickup_slot' }),
    __metadata("design:type", String)
], OrderEntity.prototype, "pickupSlot", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'delivery_slot' }),
    __metadata("design:type", String)
], OrderEntity.prototype, "deliverySlot", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'pickup_date', type: 'date' }),
    __metadata("design:type", String)
], OrderEntity.prototype, "pickupDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'delivery_date', type: 'date' }),
    __metadata("design:type", String)
], OrderEntity.prototype, "deliveryDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 10, scale: 2 }),
    __metadata("design:type", Number)
], OrderEntity.prototype, "subtotal", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'discount_amount', type: 'decimal', precision: 10, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], OrderEntity.prototype, "discountAmount", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'coupon_code', nullable: true }),
    __metadata("design:type", String)
], OrderEntity.prototype, "couponCode", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'tax_amount', type: 'decimal', precision: 10, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], OrderEntity.prototype, "taxAmount", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'total_amount', type: 'decimal', precision: 10, scale: 2 }),
    __metadata("design:type", Number)
], OrderEntity.prototype, "totalAmount", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'payment_status', type: 'enum', enum: PaymentStatus, default: PaymentStatus.PENDING }),
    __metadata("design:type", String)
], OrderEntity.prototype, "paymentStatus", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'payment_method', nullable: true }),
    __metadata("design:type", String)
], OrderEntity.prototype, "paymentMethod", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'payment_id', nullable: true }),
    __metadata("design:type", String)
], OrderEntity.prototype, "paymentId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'special_instructions', nullable: true }),
    __metadata("design:type", String)
], OrderEntity.prototype, "specialInstructions", void 0);
exports.OrderEntity = OrderEntity = __decorate([
    (0, typeorm_1.Entity)('orders')
], OrderEntity);
let OrderItemEntity = class OrderItemEntity {
};
exports.OrderItemEntity = OrderItemEntity;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], OrderItemEntity.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'order_id' }),
    __metadata("design:type", String)
], OrderItemEntity.prototype, "orderId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'service_id' }),
    __metadata("design:type", String)
], OrderItemEntity.prototype, "serviceId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'item_name' }),
    __metadata("design:type", String)
], OrderItemEntity.prototype, "itemName", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'enum', enum: ServiceCategory }),
    __metadata("design:type", String)
], OrderItemEntity.prototype, "category", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int' }),
    __metadata("design:type", Number)
], OrderItemEntity.prototype, "quantity", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'price_per_unit', type: 'decimal', precision: 10, scale: 2 }),
    __metadata("design:type", Number)
], OrderItemEntity.prototype, "pricePerUnit", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'total_price', type: 'decimal', precision: 10, scale: 2 }),
    __metadata("design:type", Number)
], OrderItemEntity.prototype, "totalPrice", void 0);
exports.OrderItemEntity = OrderItemEntity = __decorate([
    (0, typeorm_1.Entity)('order_items')
], OrderItemEntity);
let SubscriptionEntity = class SubscriptionEntity extends BaseEntityFields {
};
exports.SubscriptionEntity = SubscriptionEntity;
__decorate([
    (0, typeorm_1.Column)({ name: 'customer_id' }),
    __metadata("design:type", String)
], SubscriptionEntity.prototype, "customerId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'business_id' }),
    __metadata("design:type", String)
], SubscriptionEntity.prototype, "businessId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'plan_name', type: 'enum', enum: SubscriptionPlan }),
    __metadata("design:type", String)
], SubscriptionEntity.prototype, "planName", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'price_per_month', type: 'decimal', precision: 10, scale: 2 }),
    __metadata("design:type", Number)
], SubscriptionEntity.prototype, "pricePerMonth", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'items_limit', nullable: true }),
    __metadata("design:type", Number)
], SubscriptionEntity.prototype, "itemsLimit", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'discount_percentage', type: 'decimal', precision: 5, scale: 2 }),
    __metadata("design:type", Number)
], SubscriptionEntity.prototype, "discountPercentage", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'start_date', type: 'date' }),
    __metadata("design:type", String)
], SubscriptionEntity.prototype, "startDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'end_date', type: 'date' }),
    __metadata("design:type", String)
], SubscriptionEntity.prototype, "endDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'is_active', default: true }),
    __metadata("design:type", Boolean)
], SubscriptionEntity.prototype, "isActive", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'auto_renew', default: false }),
    __metadata("design:type", Boolean)
], SubscriptionEntity.prototype, "autoRenew", void 0);
exports.SubscriptionEntity = SubscriptionEntity = __decorate([
    (0, typeorm_1.Entity)('subscriptions')
], SubscriptionEntity);
let RiderEntity = class RiderEntity extends BaseEntityFields {
};
exports.RiderEntity = RiderEntity;
__decorate([
    (0, typeorm_1.Column)({ name: 'business_id' }),
    __metadata("design:type", String)
], RiderEntity.prototype, "businessId", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], RiderEntity.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], RiderEntity.prototype, "phone", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], RiderEntity.prototype, "email", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'vehicle_type' }),
    __metadata("design:type", String)
], RiderEntity.prototype, "vehicleType", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'vehicle_number' }),
    __metadata("design:type", String)
], RiderEntity.prototype, "vehicleNumber", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'license_number' }),
    __metadata("design:type", String)
], RiderEntity.prototype, "licenseNumber", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'profile_image', nullable: true }),
    __metadata("design:type", String)
], RiderEntity.prototype, "profileImage", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'is_available', default: true }),
    __metadata("design:type", Boolean)
], RiderEntity.prototype, "isAvailable", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'is_active', default: true }),
    __metadata("design:type", Boolean)
], RiderEntity.prototype, "isActive", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'total_deliveries', default: 0 }),
    __metadata("design:type", Number)
], RiderEntity.prototype, "totalDeliveries", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 3, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], RiderEntity.prototype, "rating", void 0);
exports.RiderEntity = RiderEntity = __decorate([
    (0, typeorm_1.Entity)('riders')
], RiderEntity);
let CouponEntity = class CouponEntity {
};
exports.CouponEntity = CouponEntity;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], CouponEntity.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'business_id', nullable: true }),
    __metadata("design:type", String)
], CouponEntity.prototype, "businessId", void 0);
__decorate([
    (0, typeorm_1.Column)({ unique: true }),
    __metadata("design:type", String)
], CouponEntity.prototype, "code", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'discount_type', type: 'enum', enum: DiscountType }),
    __metadata("design:type", String)
], CouponEntity.prototype, "discountType", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'discount_value', type: 'decimal', precision: 10, scale: 2 }),
    __metadata("design:type", Number)
], CouponEntity.prototype, "discountValue", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'min_order_value', type: 'decimal', precision: 10, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], CouponEntity.prototype, "minOrderValue", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'max_discount', type: 'decimal', precision: 10, scale: 2, nullable: true }),
    __metadata("design:type", Number)
], CouponEntity.prototype, "maxDiscount", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'usage_limit', type: 'int', nullable: true }),
    __metadata("design:type", Number)
], CouponEntity.prototype, "usageLimit", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'used_count', type: 'int', default: 0 }),
    __metadata("design:type", Number)
], CouponEntity.prototype, "usedCount", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'valid_from', type: 'timestamp' }),
    __metadata("design:type", Date)
], CouponEntity.prototype, "validFrom", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'valid_till', type: 'timestamp' }),
    __metadata("design:type", Date)
], CouponEntity.prototype, "validTill", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'is_active', default: true }),
    __metadata("design:type", Boolean)
], CouponEntity.prototype, "isActive", void 0);
exports.CouponEntity = CouponEntity = __decorate([
    (0, typeorm_1.Entity)('coupons')
], CouponEntity);
let ReviewEntity = class ReviewEntity {
};
exports.ReviewEntity = ReviewEntity;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], ReviewEntity.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'order_id' }),
    __metadata("design:type", String)
], ReviewEntity.prototype, "orderId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'customer_id' }),
    __metadata("design:type", String)
], ReviewEntity.prototype, "customerId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'business_id' }),
    __metadata("design:type", String)
], ReviewEntity.prototype, "businessId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int' }),
    __metadata("design:type", Number)
], ReviewEntity.prototype, "rating", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], ReviewEntity.prototype, "comment", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], ReviewEntity.prototype, "createdAt", void 0);
exports.ReviewEntity = ReviewEntity = __decorate([
    (0, typeorm_1.Entity)('reviews')
], ReviewEntity);
let CommissionEntity = class CommissionEntity {
};
exports.CommissionEntity = CommissionEntity;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], CommissionEntity.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'order_id' }),
    __metadata("design:type", String)
], CommissionEntity.prototype, "orderId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'business_id' }),
    __metadata("design:type", String)
], CommissionEntity.prototype, "businessId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'order_amount', type: 'decimal', precision: 10, scale: 2 }),
    __metadata("design:type", Number)
], CommissionEntity.prototype, "orderAmount", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'commission_rate', type: 'decimal', precision: 5, scale: 2 }),
    __metadata("design:type", Number)
], CommissionEntity.prototype, "commissionRate", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'commission_amount', type: 'decimal', precision: 10, scale: 2 }),
    __metadata("design:type", Number)
], CommissionEntity.prototype, "commissionAmount", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'platform_earning', type: 'decimal', precision: 10, scale: 2 }),
    __metadata("design:type", Number)
], CommissionEntity.prototype, "platformEarning", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: false }),
    __metadata("design:type", Boolean)
], CommissionEntity.prototype, "settled", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'settlement_date', type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], CommissionEntity.prototype, "settlementDate", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], CommissionEntity.prototype, "createdAt", void 0);
exports.CommissionEntity = CommissionEntity = __decorate([
    (0, typeorm_1.Entity)('commissions')
], CommissionEntity);
let NotificationEntity = class NotificationEntity {
};
exports.NotificationEntity = NotificationEntity;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], NotificationEntity.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'user_id' }),
    __metadata("design:type", String)
], NotificationEntity.prototype, "userId", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], NotificationEntity.prototype, "title", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], NotificationEntity.prototype, "message", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'enum', enum: NotificationType }),
    __metadata("design:type", String)
], NotificationEntity.prototype, "type", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'is_read', default: false }),
    __metadata("design:type", Boolean)
], NotificationEntity.prototype, "isRead", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], NotificationEntity.prototype, "createdAt", void 0);
exports.NotificationEntity = NotificationEntity = __decorate([
    (0, typeorm_1.Entity)('notifications')
], NotificationEntity);
let OtpVerificationEntity = class OtpVerificationEntity {
};
exports.OtpVerificationEntity = OtpVerificationEntity;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], OtpVerificationEntity.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], OtpVerificationEntity.prototype, "recipient", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], OtpVerificationEntity.prototype, "otp", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'expires_at', type: 'timestamp' }),
    __metadata("design:type", Date)
], OtpVerificationEntity.prototype, "expiresAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'is_used', default: false }),
    __metadata("design:type", Boolean)
], OtpVerificationEntity.prototype, "isUsed", void 0);
exports.OtpVerificationEntity = OtpVerificationEntity = __decorate([
    (0, typeorm_1.Entity)('otp_verifications')
], OtpVerificationEntity);
//# sourceMappingURL=washflow.entity.js.map