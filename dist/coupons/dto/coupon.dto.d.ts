import { DiscountType } from '../../database/entities/washflow.entity';
export declare class CreateCouponDto {
    businessId?: string;
    code: string;
    discountType: DiscountType;
    discountValue: number;
    minOrderValue: number;
    maxDiscount?: number;
    usageLimit?: number;
    validFrom: string;
    validTill: string;
}
export declare class UpdateCouponDto extends CreateCouponDto {
}
export declare class ValidateCouponDto {
    code: string;
    orderAmount: number;
}
