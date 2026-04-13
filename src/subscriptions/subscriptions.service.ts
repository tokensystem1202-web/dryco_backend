import { Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { AuthenticatedUser } from '../auth/auth.types';
import { SubscriptionPlan } from '../database/entities/washflow.entity';
import { CreateSubscriptionDto } from './dto/subscription.dto';

const PLANS = {
  [SubscriptionPlan.SILVER]: {
    planName: SubscriptionPlan.SILVER,
    pricePerMonth: 799,
    itemsLimit: 30,
    discountPercentage: 20,
  },
  [SubscriptionPlan.GOLD]: {
    planName: SubscriptionPlan.GOLD,
    pricePerMonth: 1499,
    itemsLimit: 60,
    discountPercentage: 30,
  },
  [SubscriptionPlan.PLATINUM]: {
    planName: SubscriptionPlan.PLATINUM,
    pricePerMonth: 2499,
    itemsLimit: null,
    discountPercentage: 40,
  },
};

@Injectable()
export class SubscriptionsService {
  subscribe(user: AuthenticatedUser, dto: CreateSubscriptionDto) {
    return {
      id: randomUUID(),
      customerId: user.userId,
      businessId: dto.businessId,
      ...PLANS[dto.planName],
      autoRenew: dto.autoRenew,
      startDate: new Date().toISOString(),
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      isActive: true,
    };
  }

  getMySubscription(user: AuthenticatedUser) {
    return {
      customerId: user.userId,
      ...PLANS[SubscriptionPlan.GOLD],
      isActive: true,
    };
  }

  cancel(id: string) {
    return { id, cancelled: true };
  }

  listPlans() {
    return Object.values(PLANS);
  }
}
