import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { AuthenticatedUser } from '../auth/auth.types';
import {
  BusinessEntity,
  CouponEntity,
  NotificationEntity,
  OrderEntity,
  OrderItemEntity,
  RiderEntity,
  ServiceEntity,
  SubscriptionEntity,
} from '../database/entities';
import {
  DiscountType,
  NotificationType,
  OrderStatus,
  PaymentStatus,
} from '../database/entities/washflow.entity';
import { AssignRiderDto, CreateOrderDto, UpdateOrderStatusDto } from './dto/order.dto';
import { OrdersGateway } from './orders.gateway';

const SLOT_ORDER = ['Morning (8AM-11AM)', 'Afternoon (12PM-3PM)', 'Evening (4PM-7PM)'];

const STATUS_FLOW: Record<OrderStatus, OrderStatus[]> = {
  [OrderStatus.REQUESTED]: [OrderStatus.ACCEPTED, OrderStatus.CANCELLED],
  [OrderStatus.ACCEPTED]: [OrderStatus.PICKED_UP, OrderStatus.CANCELLED],
  [OrderStatus.PICKED_UP]: [OrderStatus.CLEANING],
  [OrderStatus.CLEANING]: [OrderStatus.OUT_FOR_DELIVERY],
  [OrderStatus.OUT_FOR_DELIVERY]: [OrderStatus.DELIVERED],
  [OrderStatus.DELIVERED]: [],
  [OrderStatus.CANCELLED]: [],
};

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(OrderEntity)
    private readonly ordersRepository: Repository<OrderEntity>,
    @InjectRepository(OrderItemEntity)
    private readonly orderItemsRepository: Repository<OrderItemEntity>,
    @InjectRepository(ServiceEntity)
    private readonly servicesRepository: Repository<ServiceEntity>,
    @InjectRepository(BusinessEntity)
    private readonly businessesRepository: Repository<BusinessEntity>,
    @InjectRepository(RiderEntity)
    private readonly ridersRepository: Repository<RiderEntity>,
    @InjectRepository(SubscriptionEntity)
    private readonly subscriptionsRepository: Repository<SubscriptionEntity>,
    @InjectRepository(CouponEntity)
    private readonly couponsRepository: Repository<CouponEntity>,
    @InjectRepository(NotificationEntity)
    private readonly notificationsRepository: Repository<NotificationEntity>,
    private readonly ordersGateway: OrdersGateway,
  ) {}

  async createOrder(user: AuthenticatedUser, dto: CreateOrderDto) {
    this.validateSlots(dto.pickupDate, dto.deliveryDate, dto.pickupSlot, dto.deliverySlot);

    const business = await this.businessesRepository.findOne({
      where: { id: dto.businessId, isApproved: true, isActive: true },
    });

    if (!business) {
      throw new NotFoundException('Business not found or unavailable');
    }

    const services = await this.servicesRepository.find({
      where: {
        id: In(dto.items.map((item) => item.serviceId)),
        businessId: dto.businessId,
        isActive: true,
      },
    });

    if (services.length !== dto.items.length) {
      throw new BadRequestException('One or more services are invalid for this business');
    }

    const servicesById = new Map(services.map((service) => [service.id, service]));
    const items = dto.items.map((item) => {
      const service = servicesById.get(item.serviceId);
      if (!service) {
        throw new BadRequestException('Invalid service item');
      }

      const pricePerUnit = Number(service.pricePerUnit);

      return {
        serviceId: service.id,
        itemName: item.itemName,
        category: item.category,
        quantity: item.quantity,
        pricePerUnit,
        totalPrice: pricePerUnit * item.quantity,
      };
    });

    const subtotal = items.reduce((sum, item) => sum + item.totalPrice, 0);
    const subscriptionDiscount = await this.calculateSubscriptionDiscount(
      user.userId,
      dto.businessId,
      subtotal,
    );
    const couponDiscount = dto.couponCode
      ? await this.calculateCouponDiscount(dto.businessId, dto.couponCode, subtotal)
      : 0;
    const discountAmount = Number((subscriptionDiscount + couponDiscount).toFixed(2));
    const taxAmount = Number(((subtotal - discountAmount) * 0.05).toFixed(2));
    const totalAmount = Number((subtotal - discountAmount + taxAmount).toFixed(2));

    const order = await this.ordersRepository.save(
      this.ordersRepository.create({
        orderNumber: this.generateOrderNumber(),
        customerId: user.userId,
        businessId: dto.businessId,
        status: OrderStatus.REQUESTED,
        pickupSlot: dto.pickupSlot,
        deliverySlot: dto.deliverySlot,
        pickupDate: dto.pickupDate,
        deliveryDate: dto.deliveryDate,
        subtotal,
        discountAmount,
        couponCode: dto.couponCode,
        taxAmount,
        totalAmount,
        paymentStatus: PaymentStatus.PENDING,
        specialInstructions: dto.specialInstructions,
      }),
    );

    await this.orderItemsRepository.save(
      items.map((item) =>
        this.orderItemsRepository.create({
          orderId: order.id,
          ...item,
        }),
      ),
    );

    await this.notificationsRepository.save(
      this.notificationsRepository.create({
        userId: business.userId,
        title: 'New order received',
        message: `New order ${order.orderNumber} has been placed.`,
        type: NotificationType.ORDER,
        isRead: false,
      }),
    );

    const payload = { ...order, items };
    this.ordersGateway.emitNewOrder(payload);
    return payload;
  }

  async getCustomerOrders(user: AuthenticatedUser) {
    return {
      customerId: user.userId,
      items: await this.ordersRepository.find({
        where: { customerId: user.userId },
        order: { createdAt: 'DESC' },
      }),
    };
  }

  async getOrderDetails(user: AuthenticatedUser, id: string) {
    const order = await this.ordersRepository.findOne({ where: { id } });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    if (order.customerId !== user.userId) {
      throw new ForbiddenException('You can view only your own orders');
    }

    const items = await this.orderItemsRepository.find({ where: { orderId: id } });

    return {
      ...order,
      items,
      timeline: [
        { label: 'Order placed', status: OrderStatus.REQUESTED, at: order.createdAt },
        { label: 'Current status', status: order.status, at: order.updatedAt ?? order.createdAt },
      ],
    };
  }

  async cancelOrder(user: AuthenticatedUser, id: string) {
    const order = await this.ordersRepository.findOne({ where: { id } });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    if (order.customerId !== user.userId) {
      throw new ForbiddenException('You can cancel only your own orders');
    }

    if (![OrderStatus.REQUESTED, OrderStatus.ACCEPTED].includes(order.status)) {
      throw new BadRequestException('This order cannot be cancelled now');
    }

    order.status = OrderStatus.CANCELLED;
    await this.ordersRepository.save(order);
    this.ordersGateway.emitOrderStatusUpdate({ orderId: id, status: OrderStatus.CANCELLED });

    return { id, status: order.status };
  }

  async reorder(user: AuthenticatedUser, id: string) {
    const sourceOrder = await this.ordersRepository.findOne({ where: { id } });

    if (!sourceOrder) {
      throw new NotFoundException('Order not found');
    }

    if (sourceOrder.customerId !== user.userId) {
      throw new ForbiddenException('You can reorder only your own orders');
    }

    const sourceItems = await this.orderItemsRepository.find({ where: { orderId: id } });
    const clonedOrder = await this.ordersRepository.save(
      this.ordersRepository.create({
        orderNumber: this.generateOrderNumber(),
        customerId: sourceOrder.customerId,
        businessId: sourceOrder.businessId,
        status: OrderStatus.REQUESTED,
        pickupSlot: sourceOrder.pickupSlot,
        deliverySlot: sourceOrder.deliverySlot,
        pickupDate: sourceOrder.pickupDate,
        deliveryDate: sourceOrder.deliveryDate,
        subtotal: sourceOrder.subtotal,
        discountAmount: sourceOrder.discountAmount,
        couponCode: sourceOrder.couponCode,
        taxAmount: sourceOrder.taxAmount,
        totalAmount: sourceOrder.totalAmount,
        paymentStatus: PaymentStatus.PENDING,
        specialInstructions: sourceOrder.specialInstructions,
      }),
    );

    await this.orderItemsRepository.save(
      sourceItems.map((item) =>
        this.orderItemsRepository.create({
          orderId: clonedOrder.id,
          serviceId: item.serviceId,
          itemName: item.itemName,
          category: item.category,
          quantity: item.quantity,
          pricePerUnit: item.pricePerUnit,
          totalPrice: item.totalPrice,
        }),
      ),
    );

    return { sourceOrderId: id, orderId: clonedOrder.id, cloned: true };
  }

  async getBusinessOrders(user: AuthenticatedUser, query: Record<string, string | undefined>) {
    const business = await this.businessesRepository.findOne({ where: { userId: user.userId } });

    if (!business) {
      throw new NotFoundException('Business not found for this user');
    }

    const builder = this.ordersRepository.createQueryBuilder('order');
    builder.where('order.businessId = :businessId', { businessId: business.id });

    if (query.status) {
      builder.andWhere('order.status = :status', { status: query.status });
    }

    if (query.paymentStatus) {
      builder.andWhere('order.paymentStatus = :paymentStatus', { paymentStatus: query.paymentStatus });
    }

    return {
      filters: query,
      items: await builder.orderBy('order.createdAt', 'DESC').getMany(),
    };
  }

  async updateOrderStatus(user: AuthenticatedUser, id: string, dto: UpdateOrderStatusDto) {
    const order = await this.ordersRepository.findOne({ where: { id } });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    await this.assertBusinessOwnership(user, order.businessId);

    if (!STATUS_FLOW[order.status].includes(dto.status)) {
      throw new BadRequestException('Invalid order status transition');
    }

    order.status = dto.status;
    await this.ordersRepository.save(order);

    const payload = { orderId: id, status: dto.status };
    this.ordersGateway.emitOrderStatusUpdate(payload);
    return payload;
  }

  async assignRider(user: AuthenticatedUser, id: string, dto: AssignRiderDto) {
    const order = await this.ordersRepository.findOne({ where: { id } });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    await this.assertBusinessOwnership(user, order.businessId);

    const rider = await this.ridersRepository.findOne({
      where: { id: dto.riderId, businessId: order.businessId, isActive: true },
    });

    if (!rider) {
      throw new NotFoundException('Rider not found for this business');
    }

    order.riderId = rider.id;
    await this.ordersRepository.save(order);

    return { orderId: id, riderId: dto.riderId, assigned: true };
  }

  async adminListOrders(query: Record<string, string | undefined>) {
    const builder = this.ordersRepository.createQueryBuilder('order');

    if (query.status) {
      builder.andWhere('order.status = :status', { status: query.status });
    }

    if (query.businessId) {
      builder.andWhere('order.businessId = :businessId', { businessId: query.businessId });
    }

    return {
      filters: query,
      items: await builder.orderBy('order.createdAt', 'DESC').getMany(),
    };
  }

  private async calculateSubscriptionDiscount(
    customerId: string,
    businessId: string,
    subtotal: number,
  ) {
    const today = new Date().toISOString().slice(0, 10);
    const subscription = await this.subscriptionsRepository
      .createQueryBuilder('subscription')
      .where('subscription.customerId = :customerId', { customerId })
      .andWhere('subscription.businessId = :businessId', { businessId })
      .andWhere('subscription.isActive = :isActive', { isActive: true })
      .andWhere('subscription.startDate <= :today', { today })
      .andWhere('subscription.endDate >= :today', { today })
      .orderBy('subscription.createdAt', 'DESC')
      .getOne();

    if (!subscription) {
      return 0;
    }

    return Number(((subtotal * Number(subscription.discountPercentage)) / 100).toFixed(2));
  }

  private async calculateCouponDiscount(
    businessId: string,
    couponCode: string,
    subtotal: number,
  ) {
    const coupon = await this.couponsRepository.findOne({
      where: { code: couponCode.toUpperCase(), isActive: true },
    });

    if (!coupon) {
      throw new BadRequestException('Invalid coupon code');
    }

    if (coupon.businessId && coupon.businessId !== businessId) {
      throw new BadRequestException('Coupon is not valid for this business');
    }

    const now = new Date();
    if (coupon.validFrom > now || coupon.validTill < now) {
      throw new BadRequestException('Coupon has expired');
    }

    if (subtotal < Number(coupon.minOrderValue)) {
      throw new BadRequestException('Coupon minimum order value not met');
    }

    let discount = 0;
    if (coupon.discountType === DiscountType.FLAT) {
      discount = Number(coupon.discountValue);
    } else {
      discount = (subtotal * Number(coupon.discountValue)) / 100;
    }

    if (coupon.maxDiscount) {
      discount = Math.min(discount, Number(coupon.maxDiscount));
    }

    return Number(discount.toFixed(2));
  }

  private async assertBusinessOwnership(user: AuthenticatedUser, businessId: string) {
    const business = await this.businessesRepository.findOne({ where: { id: businessId } });

    if (!business) {
      throw new NotFoundException('Business not found');
    }

    if (business.userId !== user.userId) {
      throw new ForbiddenException('You can manage only your own business orders');
    }
  }

  private generateOrderNumber() {
    return `WF-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  }

  private validateSlots(
    pickupDate: string,
    deliveryDate: string,
    pickupSlot: string,
    deliverySlot: string,
  ) {
    if (!SLOT_ORDER.includes(pickupSlot) || !SLOT_ORDER.includes(deliverySlot)) {
      throw new BadRequestException('Invalid slot selected');
    }

    if (pickupDate === deliveryDate && pickupSlot === deliverySlot) {
      throw new BadRequestException('Pickup and delivery slots cannot be same-day same-slot');
    }
  }
}
