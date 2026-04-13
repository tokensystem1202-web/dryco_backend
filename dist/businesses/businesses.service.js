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
exports.BusinessesService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const roles_enum_1 = require("../auth/roles.enum");
const entities_1 = require("../database/entities");
let BusinessesService = class BusinessesService {
    constructor(businessesRepository, servicesRepository, ordersRepository, ridersRepository) {
        this.businessesRepository = businessesRepository;
        this.servicesRepository = servicesRepository;
        this.ordersRepository = ordersRepository;
        this.ridersRepository = ridersRepository;
    }
    async registerBusiness(user, dto) {
        const existingBusiness = await this.businessesRepository.findOne({
            where: { userId: user.userId },
        });
        if (existingBusiness) {
            throw new common_1.ForbiddenException('Business already registered for this user');
        }
        const business = this.businessesRepository.create({
            userId: user.userId,
            ...dto,
            isApproved: false,
            isActive: true,
            commissionRate: 15,
            totalOrders: 0,
            rating: 0,
        });
        return this.businessesRepository.save(business);
    }
    async listApprovedBusinesses(filters) {
        const query = this.businessesRepository.createQueryBuilder('business');
        query.where('business.isApproved = :isApproved', { isApproved: true });
        query.andWhere('business.isActive = :isActive', { isActive: true });
        if (filters.city) {
            query.andWhere('LOWER(business.city) = LOWER(:city)', { city: filters.city });
        }
        if (filters.rating) {
            query.andWhere('business.rating >= :rating', { rating: Number(filters.rating) });
        }
        return {
            filters,
            items: await query.orderBy('business.createdAt', 'DESC').getMany(),
        };
    }
    async getBusinessDetails(id) {
        const business = await this.businessesRepository.findOne({ where: { id } });
        if (!business) {
            throw new common_1.NotFoundException('Business not found');
        }
        return {
            ...business,
            services: await this.servicesRepository.find({
                where: { businessId: id, isActive: true },
                order: { createdAt: 'DESC' },
            }),
        };
    }
    async updateBusiness(user, id, dto) {
        const business = await this.businessesRepository.findOne({ where: { id } });
        if (!business) {
            throw new common_1.NotFoundException('Business not found');
        }
        if (user.role !== roles_enum_1.UserRole.ADMIN && business.userId !== user.userId) {
            throw new common_1.ForbiddenException('You can update only your own business');
        }
        Object.assign(business, dto);
        return this.businessesRepository.save(business);
    }
    async getMyBusiness(user) {
        return this.businessesRepository.findOne({ where: { userId: user.userId } });
    }
    async getBusinessStats(user, id) {
        const business = await this.businessesRepository.findOne({ where: { id } });
        if (!business) {
            throw new common_1.NotFoundException('Business not found');
        }
        if (user.role !== roles_enum_1.UserRole.ADMIN && business.userId !== user.userId) {
            throw new common_1.ForbiddenException('You can view only your own business stats');
        }
        const [totalOrders, deliveredTotals, pendingOrders, activeRiders] = await Promise.all([
            this.ordersRepository.count({ where: { businessId: id } }),
            this.ordersRepository
                .createQueryBuilder('order')
                .select('COALESCE(SUM(order.totalAmount), 0)', 'revenue')
                .where('order.businessId = :businessId', { businessId: id })
                .andWhere('order.status = :status', { status: 'delivered' })
                .getRawOne(),
            this.ordersRepository
                .createQueryBuilder('order')
                .where('order.businessId = :businessId', { businessId: id })
                .andWhere('order.status IN (:...statuses)', {
                statuses: ['requested', 'accepted', 'picked_up', 'cleaning', 'out_for_delivery'],
            })
                .getCount(),
            this.ridersRepository.count({ where: { businessId: id, isActive: true } }),
        ]);
        return {
            businessId: id,
            totalOrders,
            revenue: Number(deliveredTotals?.revenue ?? 0),
            pendingOrders,
            activeRiders,
        };
    }
    async adminListBusinesses() {
        return this.businessesRepository.find({ order: { createdAt: 'DESC' } });
    }
    async approveBusiness(id, dto) {
        const business = await this.businessesRepository.findOne({ where: { id } });
        if (!business) {
            throw new common_1.NotFoundException('Business not found');
        }
        business.isApproved = dto.approved;
        return this.businessesRepository.save(business);
    }
    async toggleBusinessStatus(id, dto) {
        const business = await this.businessesRepository.findOne({ where: { id } });
        if (!business) {
            throw new common_1.NotFoundException('Business not found');
        }
        business.isActive = dto.isActive;
        return this.businessesRepository.save(business);
    }
    async updateCommission(id, dto) {
        const business = await this.businessesRepository.findOne({ where: { id } });
        if (!business) {
            throw new common_1.NotFoundException('Business not found');
        }
        business.commissionRate = dto.commissionRate;
        return this.businessesRepository.save(business);
    }
};
exports.BusinessesService = BusinessesService;
exports.BusinessesService = BusinessesService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(entities_1.BusinessEntity)),
    __param(1, (0, typeorm_1.InjectRepository)(entities_1.ServiceEntity)),
    __param(2, (0, typeorm_1.InjectRepository)(entities_1.OrderEntity)),
    __param(3, (0, typeorm_1.InjectRepository)(entities_1.RiderEntity)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], BusinessesService);
//# sourceMappingURL=businesses.service.js.map