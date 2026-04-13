import { DiscountType } from '../database/entities/washflow.entity';
import { CreateCouponDto, UpdateCouponDto, ValidateCouponDto } from './dto/coupon.dto';
export declare class CouponsService {
    private readonly sampleCoupon;
    create(dto: CreateCouponDto): {
        isActive: boolean;
        usedCount: number;
        businessId?: string;
        code: string;
        discountType: DiscountType;
        discountValue: number;
        minOrderValue: number;
        maxDiscount?: number;
        usageLimit?: number;
        validFrom: string;
        validTill: string;
        id: `${string}-${string}-${string}-${string}-${string}`;
    };
    list(): {
        code: string;
        discountType: DiscountType;
        discountValue: number;
        minOrderValue: number;
        maxDiscount: number;
        usageLimit: number;
        usedCount: number;
        validFrom: string;
        validTill: string;
        isActive: boolean;
    }[];
    update(id: string, dto: UpdateCouponDto): {
        businessId?: string;
        code: string;
        discountType: DiscountType;
        discountValue: number;
        minOrderValue: number;
        maxDiscount?: number;
        usageLimit?: number;
        validFrom: string;
        validTill: string;
        id: string;
    };
    remove(id: string): {
        id: string;
        deleted: boolean;
    };
    validate(dto: ValidateCouponDto): {
        code: string;
        valid: boolean;
        discountAmount: number;
    };
}
