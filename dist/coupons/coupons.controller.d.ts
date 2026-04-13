import { AuthenticatedUser } from '../auth/auth.types';
import { CouponsService } from './coupons.service';
import { CreateCouponDto, UpdateCouponDto, ValidateCouponDto } from './dto/coupon.dto';
export declare class CouponsController {
    private readonly couponsService;
    constructor(couponsService: CouponsService);
    create(user: AuthenticatedUser, dto: CreateCouponDto): Promise<import("../database/entities").CouponEntity>;
    list(user: AuthenticatedUser): Promise<import("../database/entities").CouponEntity[]>;
    update(user: AuthenticatedUser, id: string, dto: UpdateCouponDto): Promise<import("../database/entities").CouponEntity>;
    remove(user: AuthenticatedUser, id: string): Promise<{
        id: string;
        deleted: boolean;
    }>;
    validate(dto: ValidateCouponDto): Promise<{
        code: string;
        valid: boolean;
        discountAmount: number;
    }>;
}
