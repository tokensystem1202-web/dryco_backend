"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SubscriptionsService = void 0;
const common_1 = require("@nestjs/common");
const crypto_1 = require("crypto");
const washflow_entity_1 = require("../database/entities/washflow.entity");
const PLANS = {
    [washflow_entity_1.SubscriptionPlan.SILVER]: {
        planName: washflow_entity_1.SubscriptionPlan.SILVER,
        pricePerMonth: 799,
        itemsLimit: 30,
        discountPercentage: 20,
    },
    [washflow_entity_1.SubscriptionPlan.GOLD]: {
        planName: washflow_entity_1.SubscriptionPlan.GOLD,
        pricePerMonth: 1499,
        itemsLimit: 60,
        discountPercentage: 30,
    },
    [washflow_entity_1.SubscriptionPlan.PLATINUM]: {
        planName: washflow_entity_1.SubscriptionPlan.PLATINUM,
        pricePerMonth: 2499,
        itemsLimit: null,
        discountPercentage: 40,
    },
};
let SubscriptionsService = class SubscriptionsService {
    subscribe(user, dto) {
        return {
            id: (0, crypto_1.randomUUID)(),
            customerId: user.userId,
            businessId: dto.businessId,
            ...PLANS[dto.planName],
            autoRenew: dto.autoRenew,
            startDate: new Date().toISOString(),
            endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
            isActive: true,
        };
    }
    getMySubscription(user) {
        return {
            customerId: user.userId,
            ...PLANS[washflow_entity_1.SubscriptionPlan.GOLD],
            isActive: true,
        };
    }
    cancel(id) {
        return { id, cancelled: true };
    }
    listPlans() {
        return Object.values(PLANS);
    }
};
exports.SubscriptionsService = SubscriptionsService;
exports.SubscriptionsService = SubscriptionsService = __decorate([
    (0, common_1.Injectable)()
], SubscriptionsService);
//# sourceMappingURL=subscriptions.service.js.map