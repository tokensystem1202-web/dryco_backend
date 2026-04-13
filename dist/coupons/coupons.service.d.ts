import { Repository } from 'typeorm';
import { AuthenticatedUser } from '../auth/auth.types';
import { BusinessEntity, CouponEntity } from '../database/entities';
import { CreateCouponDto, UpdateCouponDto, ValidateCouponDto } from './dto/coupon.dto';
export declare class CouponsService {
    private readonly couponsRepository;
    private readonly businessesRepository;
    constructor(couponsRepository: Repository<CouponEntity>, businessesRepository: Repository<BusinessEntity>);
    create(user: AuthenticatedUser, dto: CreateCouponDto): Promise<CouponEntity>;
    list(user: AuthenticatedUser): Promise<CouponEntity[]>;
    update(user: AuthenticatedUser, id: string, dto: UpdateCouponDto): Promise<CouponEntity>;
    remove(user: AuthenticatedUser, id: string): Promise<{
        id: string;
        deleted: boolean;
    }>;
    validate(dto: ValidateCouponDto): Promise<{
        code: string;
        valid: boolean;
        discountAmount: number;
    }>;
    private resolveBusinessId;
    private assertCouponAccess;
}
