import { BadRequestException, Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { DiscountType } from '../database/entities/washflow.entity';
import { CreateCouponDto, UpdateCouponDto, ValidateCouponDto } from './dto/coupon.dto';

@Injectable()
export class CouponsService {
  private readonly sampleCoupon = {
    code: 'SAVE20',
    discountType: DiscountType.PERCENTAGE,
    discountValue: 20,
    minOrderValue: 299,
    maxDiscount: 100,
    usageLimit: 100,
    usedCount: 10,
    validFrom: new Date(Date.now() - 86400000).toISOString(),
    validTill: new Date(Date.now() + 7 * 86400000).toISOString(),
    isActive: true,
  };

  create(dto: CreateCouponDto) {
    return { id: randomUUID(), ...dto, isActive: true, usedCount: 0 };
  }

  list() {
    return [this.sampleCoupon];
  }

  update(id: string, dto: UpdateCouponDto) {
    return { id, ...dto };
  }

  remove(id: string) {
    return { id, deleted: true };
  }

  validate(dto: ValidateCouponDto) {
    const coupon = this.sampleCoupon;
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
}
