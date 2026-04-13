"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CouponsService = void 0;
const common_1 = require("@nestjs/common");
const crypto_1 = require("crypto");
const washflow_entity_1 = require("../database/entities/washflow.entity");
let CouponsService = class CouponsService {
    constructor() {
        this.sampleCoupon = {
            code: 'SAVE20',
            discountType: washflow_entity_1.DiscountType.PERCENTAGE,
            discountValue: 20,
            minOrderValue: 299,
            maxDiscount: 100,
            usageLimit: 100,
            usedCount: 10,
            validFrom: new Date(Date.now() - 86400000).toISOString(),
            validTill: new Date(Date.now() + 7 * 86400000).toISOString(),
            isActive: true,
        };
    }
    create(dto) {
        return { id: (0, crypto_1.randomUUID)(), ...dto, isActive: true, usedCount: 0 };
    }
    list() {
        return [this.sampleCoupon];
    }
    update(id, dto) {
        return { id, ...dto };
    }
    remove(id) {
        return { id, deleted: true };
    }
    validate(dto) {
        const coupon = this.sampleCoupon;
        const now = new Date();
        if (!coupon.isActive) {
            throw new common_1.BadRequestException('Coupon is inactive');
        }
        if (new Date(coupon.validTill) < now) {
            throw new common_1.BadRequestException('Coupon expired');
        }
        if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
            throw new common_1.BadRequestException('Coupon usage limit exceeded');
        }
        if (dto.orderAmount < coupon.minOrderValue) {
            throw new common_1.BadRequestException('Minimum order value not met');
        }
        let discount = coupon.discountType === washflow_entity_1.DiscountType.FLAT
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
};
exports.CouponsService = CouponsService;
exports.CouponsService = CouponsService = __decorate([
    (0, common_1.Injectable)()
], CouponsService);
//# sourceMappingURL=coupons.service.js.map