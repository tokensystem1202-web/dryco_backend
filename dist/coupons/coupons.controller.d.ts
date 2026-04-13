import { CouponsService } from './coupons.service';
import { CreateCouponDto, UpdateCouponDto, ValidateCouponDto } from './dto/coupon.dto';
export declare class CouponsController {
    private readonly couponsService;
    constructor(couponsService: CouponsService);
    create(dto: CreateCouponDto): {
        isActive: boolean;
        usedCount: number;
        businessId?: string;
        code: string;
        discountType: import("../database/entities/washflow.entity").DiscountType;
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
        discountType: import("../database/entities/washflow.entity").DiscountType;
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
        discountType: import("../database/entities/washflow.entity").DiscountType;
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
