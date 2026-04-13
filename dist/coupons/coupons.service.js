"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CouponsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const roles_enum_1 = require("../auth/roles.enum");
const entities_1 = require("../database/entities");
const washflow_entity_1 = require("../database/entities/washflow.entity");
let CouponsService = class CouponsService {
    constructor(couponsRepository, businessesRepository) {
        this.couponsRepository = couponsRepository;
        this.businessesRepository = businessesRepository;
    }
    async create(user, dto) {
        const businessId = await this.resolveBusinessId(user, dto.businessId);
        const existing = await this.couponsRepository.findOne({
            where: { code: dto.code.trim().toUpperCase() },
        });
        if (existing) {
            throw new common_1.BadRequestException('Coupon code already exists');
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
    async list(user) {
        const businessId = user.role === roles_enum_1.UserRole.ADMIN ? undefined : await this.resolveBusinessId(user);
        return this.couponsRepository.find({
            where: businessId ? { businessId } : {},
            order: { validTill: 'ASC' },
        });
    }
    async update(user, id, dto) {
        const coupon = await this.couponsRepository.findOne({ where: { id } });
        if (!coupon) {
            throw new common_1.NotFoundException('Coupon not found');
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
    async remove(user, id) {
        const coupon = await this.couponsRepository.findOne({ where: { id } });
        if (!coupon) {
            throw new common_1.NotFoundException('Coupon not found');
        }
        await this.assertCouponAccess(user, coupon);
        coupon.isActive = false;
        await this.couponsRepository.save(coupon);
        return { id, deleted: true };
    }
    async validate(dto) {
        const coupon = await this.couponsRepository.findOne({
            where: { code: dto.code.trim().toUpperCase(), isActive: true },
        });
        if (!coupon) {
            throw new common_1.BadRequestException('Coupon not found');
        }
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
    async resolveBusinessId(user, requestedBusinessId) {
        if (user.role === roles_enum_1.UserRole.ADMIN) {
            if (!requestedBusinessId) {
                throw new common_1.BadRequestException('businessId is required for admin coupon actions');
            }
            return requestedBusinessId;
        }
        const business = await this.businessesRepository.findOne({
            where: { userId: user.userId, isApproved: true, isActive: true },
        });
        if (!business) {
            throw new common_1.ForbiddenException('Only approved businesses can manage coupons');
        }
        return business.id;
    }
    async assertCouponAccess(user, coupon) {
        if (user.role === roles_enum_1.UserRole.ADMIN) {
            return;
        }
        const businessId = await this.resolveBusinessId(user);
        if (coupon.businessId !== businessId) {
            throw new common_1.ForbiddenException('You can manage only your own coupons');
        }
    }
};
exports.CouponsService = CouponsService;
exports.CouponsService = CouponsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(entities_1.CouponEntity)),
    __param(1, (0, typeorm_1.InjectRepository)(entities_1.BusinessEntity)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], CouponsService);
//# sourceMappingURL=coupons.service.js.map