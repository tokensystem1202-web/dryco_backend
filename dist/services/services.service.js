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
exports.ServicesService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const entities_1 = require("../database/entities");
let ServicesService = class ServicesService {
    constructor(servicesRepository, businessesRepository) {
        this.servicesRepository = servicesRepository;
        this.businessesRepository = businessesRepository;
    }
    async create(user, dto) {
        const business = await this.businessesRepository.findOne({ where: { id: dto.businessId } });
        if (!business) {
            throw new common_1.NotFoundException('Business not found');
        }
        if (business.userId !== user.userId) {
            throw new common_1.ForbiddenException('You can add services only to your own business');
        }
        if (!business.isApproved || !business.isActive) {
            throw new common_1.ForbiddenException('Only approved businesses can manage pricing');
        }
        return this.servicesRepository.save(this.servicesRepository.create({
            ...dto,
            isActive: true,
        }));
    }
    async findByBusiness(businessId) {
        return this.servicesRepository.find({
            where: { businessId, isActive: true },
            order: { createdAt: 'DESC' },
        });
    }
    async update(user, id, dto) {
        const service = await this.servicesRepository.findOne({ where: { id } });
        if (!service) {
            throw new common_1.NotFoundException('Service not found');
        }
        const business = await this.businessesRepository.findOne({ where: { id: service.businessId } });
        if (!business || business.userId !== user.userId) {
            throw new common_1.ForbiddenException('You can update only your own business services');
        }
        if (!business.isApproved || !business.isActive) {
            throw new common_1.ForbiddenException('Only approved businesses can manage pricing');
        }
        Object.assign(service, dto);
        return this.servicesRepository.save(service);
    }
    async remove(user, id) {
        const service = await this.servicesRepository.findOne({ where: { id } });
        if (!service) {
            throw new common_1.NotFoundException('Service not found');
        }
        const business = await this.businessesRepository.findOne({ where: { id: service.businessId } });
        if (!business || business.userId !== user.userId) {
            throw new common_1.ForbiddenException('You can delete only your own business services');
        }
        if (!business.isApproved || !business.isActive) {
            throw new common_1.ForbiddenException('Only approved businesses can manage pricing');
        }
        service.isActive = false;
        await this.servicesRepository.save(service);
        return { id, removed: true };
    }
};
exports.ServicesService = ServicesService;
exports.ServicesService = ServicesService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(entities_1.ServiceEntity)),
    __param(1, (0, typeorm_1.InjectRepository)(entities_1.BusinessEntity)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], ServicesService);
//# sourceMappingURL=services.service.js.map