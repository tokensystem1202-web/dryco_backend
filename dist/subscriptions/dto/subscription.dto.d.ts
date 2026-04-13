import { SubscriptionPlan } from '../../database/entities/washflow.entity';
export declare class CreateSubscriptionDto {
    businessId: string;
    planName: SubscriptionPlan;
    autoRenew: boolean;
}
