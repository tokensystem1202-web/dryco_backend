import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuthenticatedUser } from '../auth/auth.types';
import { UserRole } from '../auth/roles.enum';
import { BusinessEntity, CouponEntity } from '../database/entities';
import { DiscountType } from '../database/entities/washflow.entity';
import { CreateCouponDto, UpdateCouponDto, ValidateCouponDto } from './dto/coupon.dto';

@Injectable()
export class CouponsService {
  constructor(
    @InjectRepository(CouponEntity)
    private readonly couponsRepository: Repository<CouponEntity>,
    @InjectRepository(BusinessEntity)
    private readonly businessesRepository: Repository<BusinessEntity>,
  ) {}

  async create(user: AuthenticatedUser, dto: CreateCouponDto) {
    const businessId = await this.resolveBusinessId(user, dto.businessId);

    const existing = await this.couponsRepository.findOne({
      where: { code: dto.code.trim().toUpperCase() },
    });

    if (existing) {
      throw new BadRequestException('Coupon code already exists');
    }

    const coupon = this.couponsRepository.create({
      businessId,
      code: dto.code.trim().toUpperCase(),
      discountType: dto.discountType,
      discountValue: dto.discountValue,
      minOrderValue: dto.minOrderValue,
      maxDiscount: dto.maxDiscount,
      usageLimit: dto.usageLimit,
      usedCount: 0,
      validFrom: new Date(dto.validFrom),
      validTill: new Date(dto.validTill),
      isActive: true,
    });

    return this.couponsRepository.save(coupon);
  }

  async list(user: AuthenticatedUser) {
    const businessId = user.role === UserRole.ADMIN ? undefined : await this.resolveBusinessId(user);

    return this.couponsRepository.find({
      where: businessId ? { businessId } : {},
      order: { validTill: 'ASC' },
    });
  }

  async update(user: AuthenticatedUser, id: string, dto: UpdateCouponDto) {
    const coupon = await this.couponsRepository.findOne({ where: { id } });

    if (!coupon) {
      throw new NotFoundException('Coupon not found');
    }

    await this.assertCouponAccess(user, coupon);

    Object.assign(coupon, {
      code: dto.code.trim().toUpperCase(),
      discountType: dto.discountType,
      discountValue: dto.discountValue,
      minOrderValue: dto.minOrderValue,
      maxDiscount: dto.maxDiscount,
      usageLimit: dto.usageLimit,
      validFrom: new Date(dto.validFrom),
      validTill: new Date(dto.validTill),
    });

    return this.couponsRepository.save(coupon);
  }

  async remove(user: AuthenticatedUser, id: string) {
    const coupon = await this.couponsRepository.findOne({ where: { id } });

    if (!coupon) {
      throw new NotFoundException('Coupon not found');
    }

    await this.assertCouponAccess(user, coupon);
    coupon.isActive = false;
    await this.couponsRepository.save(coupon);
    return { id, deleted: true };
  }

  async validate(dto: ValidateCouponDto) {
    const coupon = await this.couponsRepository.findOne({
      where: { code: dto.code.trim().toUpperCase(), isActive: true },
    });

    if (!coupon) {
      throw new BadRequestException('Coupon not found');
    }

    const now = new Date();

    if (!coupon.isActive) {
      throw new BadRequestException('Coupon is inactive');
    }

    if (new Date(coupon.validTill) < now) {
      throw new BadRequestException('Coupon expired');
    }

    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
      throw new BadRequestException('Coupon usage limit exceeded');
    }

    if (dto.orderAmount < coupon.minOrderValue) {
      throw new BadRequestException('Minimum order value not met');
    }

    let discount =
      coupon.discountType === DiscountType.FLAT
        ? coupon.discountValue
        : (dto.orderAmount * coupon.discountValue) / 100;

    if (coupon.maxDiscount) {
      discount = Math.min(discount, coupon.maxDiscount);
    }

    return {
      code: coupon.code,
      valid: true,
      discountAmount: Number(discount.toFixed(2)),
    };
  }

  private async resolveBusinessId(user: AuthenticatedUser, requestedBusinessId?: string) {
    if (user.role === UserRole.ADMIN) {
      if (!requestedBusinessId) {
        throw new BadRequestException('businessId is required for admin coupon actions');
      }
      return requestedBusinessId;
    }

    const business = await this.businessesRepository.findOne({
      where: { userId: user.userId, isApproved: true, isActive: true },
    });

    if (!business) {
      throw new ForbiddenException('Only approved businesses can manage coupons');
    }

    return business.id;
  }

  private async assertCouponAccess(user: AuthenticatedUser, coupon: CouponEntity) {
    if (user.role === UserRole.ADMIN) {
      return;
    }

    const businessId = await this.resolveBusinessId(user);
    if (coupon.businessId !== businessId) {
      throw new ForbiddenException('You can manage only your own coupons');
    }
  }
}
