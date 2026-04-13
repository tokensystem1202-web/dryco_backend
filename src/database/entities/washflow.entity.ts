import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum ServiceCategory {
  WASH = 'wash',
  DRY_CLEAN = 'dry_clean',
  IRON = 'iron',
  WASH_IRON = 'wash_iron',
}

export enum OrderStatus {
  REQUESTED = 'requested',
  ACCEPTED = 'accepted',
  PICKED_UP = 'picked_up',
  CLEANING = 'cleaning',
  OUT_FOR_DELIVERY = 'out_for_delivery',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled',
}

export enum PaymentStatus {
  PENDING = 'pending',
  PAID = 'paid',
  REFUNDED = 'refunded',
}

export enum SubscriptionPlan {
  SILVER = 'silver',
  GOLD = 'gold',
  PLATINUM = 'platinum',
}

export enum DiscountType {
  PERCENTAGE = 'percentage',
  FLAT = 'flat',
}

export enum NotificationType {
  ORDER = 'order',
  PROMO = 'promo',
  SYSTEM = 'system',
}

export enum BusinessRegistrationType {
  LAUNDRY = 'laundry',
  DRY_CLEAN = 'dry_clean',
}

export enum BusinessRegistrationStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

abstract class BaseEntityFields {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', nullable: true })
  updatedAt?: Date;
}

@Entity('users')
export class UserEntity extends BaseEntityFields {
  @Column()
  name: string;

  @Column({ unique: true })
  email: string;

  @Column({ unique: true })
  phone: string;

  @Column({ name: 'password_hash' })
  passwordHash: string;

  @Column({ type: 'enum', enum: ['customer', 'business', 'admin'] })
  role: 'customer' | 'business' | 'admin';

  @Column({ name: 'profile_image', nullable: true })
  profileImage?: string;

  @Column({ nullable: true })
  address?: string;

  @Column({ nullable: true })
  city?: string;

  @Column({ nullable: true })
  pincode?: string;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;
}

@Entity('businesses')
export class BusinessEntity extends BaseEntityFields {
  @Column({ name: 'user_id' })
  userId: string;

  @Column({ name: 'business_name' })
  businessName: string;

  @Column({ nullable: true })
  logo?: string;

  @Column()
  address: string;

  @Column()
  city: string;

  @Column()
  pincode: string;

  @Column({ name: 'gst_number', nullable: true })
  gstNumber?: string;

  @Column({ name: 'is_approved', default: false })
  isApproved: boolean;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @Column({ name: 'commission_rate', type: 'decimal', precision: 5, scale: 2, default: 15 })
  commissionRate: number;

  @Column({ type: 'decimal', precision: 3, scale: 2, default: 0 })
  rating: number;

  @Column({ name: 'total_orders', default: 0 })
  totalOrders: number;
}

@Entity('business_registrations')
export class BusinessRegistrationEntity extends BaseEntityFields {
  @Column({ name: 'business_name' })
  businessName: string;

  @Column({ name: 'owner_name' })
  ownerName: string;

  @Column()
  phone: string;

  @Column()
  address: string;

  @Column({ name: 'service_area' })
  serviceArea: string;

  @Column({ name: 'business_type', type: 'enum', enum: BusinessRegistrationType })
  businessType: BusinessRegistrationType;

  @Column({ name: 'id_proof_path', nullable: true })
  idProofPath?: string;

  @Column({ name: 'shop_image_path', nullable: true })
  shopImagePath?: string;

  @Column({ type: 'enum', enum: BusinessRegistrationStatus, default: BusinessRegistrationStatus.PENDING })
  status: BusinessRegistrationStatus;
}

@Entity('services')
export class ServiceEntity extends BaseEntityFields {
  @Column({ name: 'business_id' })
  businessId: string;

  @Column()
  name: string;

  @Column({ type: 'enum', enum: ServiceCategory })
  category: ServiceCategory;

  @Column({ name: 'price_per_unit', type: 'decimal', precision: 10, scale: 2 })
  pricePerUnit: number;

  @Column()
  unit: string;

  @Column({ nullable: true })
  description?: string;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;
}

@Entity('orders')
export class OrderEntity extends BaseEntityFields {
  @Column({ name: 'order_number', unique: true })
  orderNumber: string;

  @Column({ name: 'customer_id' })
  customerId: string;

  @Column({ name: 'business_id' })
  businessId: string;

  @Column({ name: 'rider_id', nullable: true })
  riderId?: string;

  @Column({ type: 'enum', enum: OrderStatus, default: OrderStatus.REQUESTED })
  status: OrderStatus;

  @Column({ name: 'pickup_slot' })
  pickupSlot: string;

  @Column({ name: 'delivery_slot' })
  deliverySlot: string;

  @Column({ name: 'pickup_date', type: 'date' })
  pickupDate: string;

  @Column({ name: 'delivery_date', type: 'date' })
  deliveryDate: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  subtotal: number;

  @Column({ name: 'discount_amount', type: 'decimal', precision: 10, scale: 2, default: 0 })
  discountAmount: number;

  @Column({ name: 'coupon_code', nullable: true })
  couponCode?: string;

  @Column({ name: 'tax_amount', type: 'decimal', precision: 10, scale: 2, default: 0 })
  taxAmount: number;

  @Column({ name: 'total_amount', type: 'decimal', precision: 10, scale: 2 })
  totalAmount: number;

  @Column({ name: 'payment_status', type: 'enum', enum: PaymentStatus, default: PaymentStatus.PENDING })
  paymentStatus: PaymentStatus;

  @Column({ name: 'payment_method', nullable: true })
  paymentMethod?: string;

  @Column({ name: 'payment_id', nullable: true })
  paymentId?: string;

  @Column({ name: 'special_instructions', nullable: true })
  specialInstructions?: string;
}

@Entity('order_items')
export class OrderItemEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'order_id' })
  orderId: string;

  @Column({ name: 'service_id' })
  serviceId: string;

  @Column({ name: 'item_name' })
  itemName: string;

  @Column({ type: 'enum', enum: ServiceCategory })
  category: ServiceCategory;

  @Column({ type: 'int' })
  quantity: number;

  @Column({ name: 'price_per_unit', type: 'decimal', precision: 10, scale: 2 })
  pricePerUnit: number;

  @Column({ name: 'total_price', type: 'decimal', precision: 10, scale: 2 })
  totalPrice: number;
}

@Entity('subscriptions')
export class SubscriptionEntity extends BaseEntityFields {
  @Column({ name: 'customer_id' })
  customerId: string;

  @Column({ name: 'business_id' })
  businessId: string;

  @Column({ name: 'plan_name', type: 'enum', enum: SubscriptionPlan })
  planName: SubscriptionPlan;

  @Column({ name: 'price_per_month', type: 'decimal', precision: 10, scale: 2 })
  pricePerMonth: number;

  @Column({ name: 'items_limit', nullable: true })
  itemsLimit?: number;

  @Column({ name: 'discount_percentage', type: 'decimal', precision: 5, scale: 2 })
  discountPercentage: number;

  @Column({ name: 'start_date', type: 'date' })
  startDate: string;

  @Column({ name: 'end_date', type: 'date' })
  endDate: string;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @Column({ name: 'auto_renew', default: false })
  autoRenew: boolean;
}

@Entity('riders')
export class RiderEntity extends BaseEntityFields {
  @Column({ name: 'business_id' })
  businessId: string;

  @Column()
  name: string;

  @Column()
  phone: string;

  @Column()
  email: string;

  @Column({ name: 'vehicle_type' })
  vehicleType: string;

  @Column({ name: 'vehicle_number' })
  vehicleNumber: string;

  @Column({ name: 'license_number' })
  licenseNumber: string;

  @Column({ name: 'profile_image', nullable: true })
  profileImage?: string;

  @Column({ name: 'is_available', default: true })
  isAvailable: boolean;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @Column({ name: 'total_deliveries', default: 0 })
  totalDeliveries: number;

  @Column({ type: 'decimal', precision: 3, scale: 2, default: 0 })
  rating: number;
}

@Entity('coupons')
export class CouponEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'business_id', nullable: true })
  businessId?: string;

  @Column({ unique: true })
  code: string;

  @Column({ name: 'discount_type', type: 'enum', enum: DiscountType })
  discountType: DiscountType;

  @Column({ name: 'discount_value', type: 'decimal', precision: 10, scale: 2 })
  discountValue: number;

  @Column({ name: 'min_order_value', type: 'decimal', precision: 10, scale: 2, default: 0 })
  minOrderValue: number;

  @Column({ name: 'max_discount', type: 'decimal', precision: 10, scale: 2, nullable: true })
  maxDiscount?: number;

  @Column({ name: 'usage_limit', type: 'int', nullable: true })
  usageLimit?: number;

  @Column({ name: 'used_count', type: 'int', default: 0 })
  usedCount: number;

  @Column({ name: 'valid_from', type: 'timestamp' })
  validFrom: Date;

  @Column({ name: 'valid_till', type: 'timestamp' })
  validTill: Date;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;
}

@Entity('reviews')
export class ReviewEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'order_id' })
  orderId: string;

  @Column({ name: 'customer_id' })
  customerId: string;

  @Column({ name: 'business_id' })
  businessId: string;

  @Column({ type: 'int' })
  rating: number;

  @Column({ nullable: true })
  comment?: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}

@Entity('commissions')
export class CommissionEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'order_id' })
  orderId: string;

  @Column({ name: 'business_id' })
  businessId: string;

  @Column({ name: 'order_amount', type: 'decimal', precision: 10, scale: 2 })
  orderAmount: number;

  @Column({ name: 'commission_rate', type: 'decimal', precision: 5, scale: 2 })
  commissionRate: number;

  @Column({ name: 'commission_amount', type: 'decimal', precision: 10, scale: 2 })
  commissionAmount: number;

  @Column({ name: 'platform_earning', type: 'decimal', precision: 10, scale: 2 })
  platformEarning: number;

  @Column({ default: false })
  settled: boolean;

  @Column({ name: 'settlement_date', type: 'timestamp', nullable: true })
  settlementDate?: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}

@Entity('notifications')
export class NotificationEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id' })
  userId: string;

  @Column()
  title: string;

  @Column()
  message: string;

  @Column({ type: 'enum', enum: NotificationType })
  type: NotificationType;

  @Column({ name: 'is_read', default: false })
  isRead: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}

@Entity('otp_verifications')
export class OtpVerificationEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  recipient: string;

  @Column()
  otp: string;

  @Column({ name: 'expires_at', type: 'timestamp' })
  expiresAt: Date;

  @Column({ name: 'is_used', default: false })
  isUsed: boolean;
}
