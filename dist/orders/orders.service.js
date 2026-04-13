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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrdersService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const entities_1 = require("../database/entities");
const washflow_entity_1 = require("../database/entities/washflow.entity");
const orders_gateway_1 = require("./orders.gateway");
const SLOT_ORDER = ['Morning (8AM-11AM)', 'Afternoon (12PM-3PM)', 'Evening (4PM-7PM)'];
const STATUS_FLOW = {
    [washflow_entity_1.OrderStatus.REQUESTED]: [washflow_entity_1.OrderStatus.ACCEPTED, washflow_entity_1.OrderStatus.CANCELLED],
    [washflow_entity_1.OrderStatus.ACCEPTED]: [washflow_entity_1.OrderStatus.PICKED_UP, washflow_entity_1.OrderStatus.CANCELLED],
    [washflow_entity_1.OrderStatus.PICKED_UP]: [washflow_entity_1.OrderStatus.CLEANING],
    [washflow_entity_1.OrderStatus.CLEANING]: [washflow_entity_1.OrderStatus.OUT_FOR_DELIVERY],
    [washflow_entity_1.OrderStatus.OUT_FOR_DELIVERY]: [washflow_entity_1.OrderStatus.DELIVERED],
    [washflow_entity_1.OrderStatus.DELIVERED]: [],
    [washflow_entity_1.OrderStatus.CANCELLED]: [],
};
let OrdersService = class OrdersService {
    constructor(ordersRepository, orderItemsRepository, servicesRepository, businessesRepository, ridersRepository, subscriptionsRepository, couponsRepository, notificationsRepository, ordersGateway) {
        this.ordersRepository = ordersRepository;
        this.orderItemsRepository = orderItemsRepository;
        this.servicesRepository = servicesRepository;
        this.businessesRepository = businessesRepository;
        this.ridersRepository = ridersRepository;
        this.subscriptionsRepository = subscriptionsRepository;
        this.couponsRepository = couponsRepository;
        this.notificationsRepository = notificationsRepository;
        this.ordersGateway = ordersGateway;
    }
    async createOrder(user, dto) {
        this.validateSlots(dto.pickupDate, dto.deliveryDate, dto.pickupSlot, dto.deliverySlot);
        const business = await this.businessesRepository.findOne({
            where: { id: dto.businessId, isApproved: true, isActive: true },
        });
        if (!business) {
            throw new common_1.NotFoundException('Business not found or unavailable');
        }
        const services = await this.servicesRepository.find({
            where: {
                id: (0, typeorm_2.In)(dto.items.map((item) => item.serviceId)),
                businessId: dto.businessId,
                isActive: true,
            },
        });
        if (services.length !== dto.items.length) {
            throw new common_1.BadRequestException('One or more services are invalid for this business');
        }
        const servicesById = new Map(services.map((service) => [service.id, service]));
        const items = dto.items.map((item) => {
            const service = servicesById.get(item.serviceId);
            if (!service) {
                throw new common_1.BadRequestException('Invalid service item');
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
        const subscriptionDiscount = await this.calculateSubscriptionDiscount(user.userId, dto.businessId, subtotal);
        const couponDiscount = dto.couponCode
            ? await this.calculateCouponDiscount(dto.businessId, dto.couponCode, subtotal)
            : 0;
        const discountAmount = Number((subscriptionDiscount + couponDiscount).toFixed(2));
        const taxAmount = Number(((subtotal - discountAmount) * 0.05).toFixed(2));
        const totalAmount = Number((subtotal - discountAmount + taxAmount).toFixed(2));
        const order = await this.ordersRepository.save(this.ordersRepository.create({
            orderNumber: this.generateOrderNumber(),
            customerId: user.userId,
            businessId: dto.businessId,
            status: washflow_entity_1.OrderStatus.REQUESTED,
            pickupSlot: dto.pickupSlot,
            deliverySlot: dto.deliverySlot,
            pickupDate: dto.pickupDate,
            deliveryDate: dto.deliveryDate,
            subtotal,
            discountAmount,
            couponCode: dto.couponCode,
            taxAmount,
            totalAmount,
            paymentStatus: washflow_entity_1.PaymentStatus.PENDING,
            specialInstructions: dto.specialInstructions,
        }));
        await this.orderItemsRepository.save(items.map((item) => this.orderItemsRepository.create({
            orderId: order.id,
            ...item,
        })));
        await this.notificationsRepository.save(this.notificationsRepository.create({
            userId: business.userId,
            title: 'New order received',
            message: `New order ${order.orderNumber} has been placed.`,
            type: washflow_entity_1.NotificationType.ORDER,
            isRead: false,
        }));
        const payload = { ...order, items };
        this.ordersGateway.emitNewOrder(payload);
        return payload;
    }
    async getCustomerOrders(user) {
        return {
            customerId: user.userId,
            items: await this.ordersRepository.find({
                where: { customerId: user.userId },
                order: { createdAt: 'DESC' },
            }),
        };
    }
    async getOrderDetails(user, id) {
        const order = await this.ordersRepository.findOne({ where: { id } });
        if (!order) {
            throw new common_1.NotFoundException('Order not found');
        }
        if (order.customerId !== user.userId) {
            throw new common_1.ForbiddenException('You can view only your own orders');
        }
        const items = await this.orderItemsRepository.find({ where: { orderId: id } });
        return {
            ...order,
            items,
            timeline: [
                { label: 'Order placed', status: washflow_entity_1.OrderStatus.REQUESTED, at: order.createdAt },
                { label: 'Current status', status: order.status, at: order.updatedAt ?? order.createdAt },
            ],
        };
    }
    async cancelOrder(user, id) {
        const order = await this.ordersRepository.findOne({ where: { id } });
        if (!order) {
            throw new common_1.NotFoundException('Order not found');
        }
        if (order.customerId !== user.userId) {
            throw new common_1.ForbiddenException('You can cancel only your own orders');
        }
        if (![washflow_entity_1.OrderStatus.REQUESTED, washflow_entity_1.OrderStatus.ACCEPTED].includes(order.status)) {
            throw new common_1.BadRequestException('This order cannot be cancelled now');
        }
        order.status = washflow_entity_1.OrderStatus.CANCELLED;
        await this.ordersRepository.save(order);
        this.ordersGateway.emitOrderStatusUpdate({ orderId: id, status: washflow_entity_1.OrderStatus.CANCELLED });
        return { id, status: order.status };
    }
    async reorder(user, id) {
        const sourceOrder = await this.ordersRepository.findOne({ where: { id } });
        if (!sourceOrder) {
            throw new common_1.NotFoundException('Order not found');
        }
        if (sourceOrder.customerId !== user.userId) {
            throw new common_1.ForbiddenException('You can reorder only your own orders');
        }
        const sourceItems = await this.orderItemsRepository.find({ where: { orderId: id } });
        const clonedOrder = await this.ordersRepository.save(this.ordersRepository.create({
            orderNumber: this.generateOrderNumber(),
            customerId: sourceOrder.customerId,
            businessId: sourceOrder.businessId,
            status: washflow_entity_1.OrderStatus.REQUESTED,
            pickupSlot: sourceOrder.pickupSlot,
            deliverySlot: sourceOrder.deliverySlot,
            pickupDate: sourceOrder.pickupDate,
            deliveryDate: sourceOrder.deliveryDate,
            subtotal: sourceOrder.subtotal,
            discountAmount: sourceOrder.discountAmount,
            couponCode: sourceOrder.couponCode,
            taxAmount: sourceOrder.taxAmount,
            totalAmount: sourceOrder.totalAmount,
            paymentStatus: washflow_entity_1.PaymentStatus.PENDING,
            specialInstructions: sourceOrder.specialInstructions,
        }));
        await this.orderItemsRepository.save(sourceItems.map((item) => this.orderItemsRepository.create({
            orderId: clonedOrder.id,
            serviceId: item.serviceId,
            itemName: item.itemName,
            category: item.category,
            quantity: item.quantity,
            pricePerUnit: item.pricePerUnit,
            totalPrice: item.totalPrice,
        })));
        return { sourceOrderId: id, orderId: clonedOrder.id, cloned: true };
    }
    async getBusinessOrders(user, query) {
        const business = await this.businessesRepository.findOne({ where: { userId: user.userId } });
        if (!business) {
            throw new common_1.NotFoundException('Business not found for this user');
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
    async updateOrderStatus(user, id, dto) {
        const order = await this.ordersRepository.findOne({ where: { id } });
        if (!order) {
            throw new common_1.NotFoundException('Order not found');
        }
        await this.assertBusinessOwnership(user, order.businessId);
        if (!STATUS_FLOW[order.status].includes(dto.status)) {
            throw new common_1.BadRequestException('Invalid order status transition');
        }
        order.status = dto.status;
        await this.ordersRepository.save(order);
        const payload = { orderId: id, status: dto.status };
        this.ordersGateway.emitOrderStatusUpdate(payload);
        return payload;
    }
    async assignRider(user, id, dto) {
        const order = await this.ordersRepository.findOne({ where: { id } });
        if (!order) {
            throw new common_1.NotFoundException('Order not found');
        }
        await this.assertBusinessOwnership(user, order.businessId);
        const rider = await this.ridersRepository.findOne({
            where: { id: dto.riderId, businessId: order.businessId, isActive: true },
        });
        if (!rider) {
            throw new common_1.NotFoundException('Rider not found for this business');
        }
        order.riderId = rider.id;
        await this.ordersRepository.save(order);
        return { orderId: id, riderId: dto.riderId, assigned: true };
    }
    async adminListOrders(query) {
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
    async calculateSubscriptionDiscount(customerId, businessId, subtotal) {
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
    async calculateCouponDiscount(businessId, couponCode, subtotal) {
        const coupon = await this.couponsRepository.findOne({
            where: { code: couponCode.toUpperCase(), isActive: true },
        });
        if (!coupon) {
            throw new common_1.BadRequestException('Invalid coupon code');
        }
        if (coupon.businessId && coupon.businessId !== businessId) {
            throw new common_1.BadRequestException('Coupon is not valid for this business');
        }
        const now = new Date();
        if (coupon.validFrom > now || coupon.validTill < now) {
            throw new common_1.BadRequestException('Coupon has expired');
        }
        if (subtotal < Number(coupon.minOrderValue)) {
            throw new common_1.BadRequestException('Coupon minimum order value not met');
        }
        let discount = 0;
        if (coupon.discountType === washflow_entity_1.DiscountType.FLAT) {
            discount = Number(coupon.discountValue);
        }
        else {
            discount = (subtotal * Number(coupon.discountValue)) / 100;
        }
        if (coupon.maxDiscount) {
            discount = Math.min(discount, Number(coupon.maxDiscount));
        }
        return Number(discount.toFixed(2));
    }
    async assertBusinessOwnership(user, businessId) {
        const business = await this.businessesRepository.findOne({ where: { id: businessId } });
        if (!business) {
            throw new common_1.NotFoundException('Business not found');
        }
        if (business.userId !== user.userId) {
            throw new common_1.ForbiddenException('You can manage only your own business orders');
        }
    }
    generateOrderNumber() {
        return `WF-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    }
    validateSlots(pickupDate, deliveryDate, pickupSlot, deliverySlot) {
        if (!SLOT_ORDER.includes(pickupSlot) || !SLOT_ORDER.includes(deliverySlot)) {
            throw new common_1.BadRequestException('Invalid slot selected');
        }
        if (pickupDate === deliveryDate && pickupSlot === deliverySlot) {
            throw new common_1.BadRequestException('Pickup and delivery slots cannot be same-day same-slot');
        }
    }
};
exports.OrdersService = OrdersService;
exports.OrdersService = OrdersService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(entities_1.OrderEntity)),
    __param(1, (0, typeorm_1.InjectRepository)(entities_1.OrderItemEntity)),
    __param(2, (0, typeorm_1.InjectRepository)(entities_1.ServiceEntity)),
    __param(3, (0, typeorm_1.InjectRepository)(entities_1.BusinessEntity)),
    __param(4, (0, typeorm_1.InjectRepository)(entities_1.RiderEntity)),
    __param(5, (0, typeorm_1.InjectRepository)(entities_1.SubscriptionEntity)),
    __param(6, (0, typeorm_1.InjectRepository)(entities_1.CouponEntity)),
    __param(7, (0, typeorm_1.InjectRepository)(entities_1.NotificationEntity)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        orders_gateway_1.OrdersGateway])
], OrdersService);
//# sourceMappingURL=orders.service.js.map