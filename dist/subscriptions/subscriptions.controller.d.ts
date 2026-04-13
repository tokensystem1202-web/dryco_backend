import { AuthenticatedUser } from '../auth/auth.types';
import { CreateSubscriptionDto } from './dto/subscription.dto';
import { SubscriptionsService } from './subscriptions.service';
export declare class SubscriptionsController {
    private readonly subscriptionsService;
    constructor(subscriptionsService: SubscriptionsService);
    subscribe(user: AuthenticatedUser, dto: CreateSubscriptionDto): {
        autoRenew: boolean;
        startDate: string;
        endDate: string;
        isActive: boolean;
        planName: import("../database/entities/washflow.entity").SubscriptionPlan;
        pricePerMonth: number;
        itemsLimit: number;
        discountPercentage: number;
        id: `${string}-${string}-${string}-${string}-${string}`;
        customerId: string;
        businessId: string;
    } | {
        autoRenew: boolean;
        startDate: string;
        endDate: string;
        isActive: boolean;
        planName: import("../database/entities/washflow.entity").SubscriptionPlan;
        pricePerMonth: number;
        itemsLimit: number;
        discountPercentage: number;
        id: `${string}-${string}-${string}-${string}-${string}`;
        customerId: string;
        businessId: string;
    } | {
        autoRenew: boolean;
        startDate: string;
        endDate: string;
        isActive: boolean;
        planName: import("../database/entities/washflow.entity").SubscriptionPlan;
        pricePerMonth: number;
        itemsLimit: any;
        discountPercentage: number;
        id: `${string}-${string}-${string}-${string}-${string}`;
        customerId: string;
        businessId: string;
    };
    getMySubscription(user: AuthenticatedUser): {
        isActive: boolean;
        planName: import("../database/entities/washflow.entity").SubscriptionPlan;
        pricePerMonth: number;
        itemsLimit: number;
        discountPercentage: number;
        customerId: string;
    };
    cancel(id: string): {
        id: string;
        cancelled: boolean;
    };
    listPlans(): ({
        planName: import("../database/entities/washflow.entity").SubscriptionPlan;
        pricePerMonth: number;
        itemsLimit: number;
        discountPercentage: number;
    } | {
        planName: import("../database/entities/washflow.entity").SubscriptionPlan;
        pricePerMonth: number;
        itemsLimit: number;
        discountPercentage: number;
    } | {
        planName: import("../database/entities/washflow.entity").SubscriptionPlan;
        pricePerMonth: number;
        itemsLimit: any;
        discountPercentage: number;
    })[];
}
