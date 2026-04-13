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
const bcryptjs_1 = require("bcryptjs");
const crypto_1 = require("crypto");
const typeorm_2 = require("typeorm");
const roles_enum_1 = require("../auth/roles.enum");
const entities_1 = require("../database/entities");
let BusinessesService = class BusinessesService {
    constructor(businessesRepository, businessRegistrationsRepository, usersRepository, servicesRepository, ordersRepository, ridersRepository) {
        this.businessesRepository = businessesRepository;
        this.businessRegistrationsRepository = businessRegistrationsRepository;
        this.usersRepository = usersRepository;
        this.servicesRepository = servicesRepository;
        this.ordersRepository = ordersRepository;
        this.ridersRepository = ridersRepository;
    }
    async submitPublicRegistration(dto, files) {
        const normalizedPhone = dto.phone.trim();
        const existingPending = await this.businessRegistrationsRepository.findOne({
            where: {
                phone: normalizedPhone,
                status: entities_1.BusinessRegistrationStatus.PENDING,
            },
        });
        if (existingPending) {
            throw new common_1.BadRequestException('A pending business registration already exists for this phone number');
        }
        const registration = this.businessRegistrationsRepository.create({
            businessName: dto.businessName.trim(),
            ownerName: dto.ownerName.trim(),
            phone: normalizedPhone,
            address: dto.address.trim(),
            serviceArea: dto.serviceArea.trim(),
            businessType: dto.businessType,
            idProofPath: files.idProof?.[0]?.filename,
            shopImagePath: files.shopImage?.[0]?.filename,
            status: entities_1.BusinessRegistrationStatus.PENDING,
        });
        const saved = await this.businessRegistrationsRepository.save(registration);
        return {
            id: saved.id,
            name: saved.businessName,
            owner: saved.ownerName,
            phone: saved.phone,
            status: saved.status,
        };
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
    async adminListBusinessRegistrations() {
        const registrations = await this.businessRegistrationsRepository.find({
            order: { createdAt: 'DESC' },
        });
        return registrations.map((registration) => this.toAdminRegistrationView(registration));
    }
    async getBusinessRegistrationDetails(id) {
        const registration = await this.businessRegistrationsRepository.findOne({ where: { id } });
        if (!registration) {
            throw new common_1.NotFoundException('Business registration not found');
        }
        return this.toAdminRegistrationView(registration);
    }
    async approveBusinessRegistration(id) {
        const registration = await this.businessRegistrationsRepository.findOne({ where: { id } });
        if (!registration) {
            throw new common_1.NotFoundException('Business registration not found');
        }
        if (registration.status === entities_1.BusinessRegistrationStatus.REJECTED) {
            throw new common_1.BadRequestException('Rejected registration cannot be approved directly');
        }
        const existingPhoneUser = await this.usersRepository.findOne({
            where: { phone: registration.phone },
        });
        if (existingPhoneUser && existingPhoneUser.role !== roles_enum_1.UserRole.BUSINESS) {
            throw new common_1.ConflictException('This phone number already belongs to a non-business account');
        }
        const emailSeed = `${registration.businessName}-${registration.id}`
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '');
        const generatedEmail = `${emailSeed || 'business'}@partners.dryco.local`;
        const user = existingPhoneUser
            ? await this.usersRepository.save({
                ...existingPhoneUser,
                name: registration.ownerName,
                role: roles_enum_1.UserRole.BUSINESS,
                address: registration.address,
                city: this.extractCity(registration),
                pincode: this.extractPincode(registration),
                isActive: true,
            })
            : await this.usersRepository.save(this.usersRepository.create({
                name: registration.ownerName,
                email: generatedEmail,
                phone: registration.phone,
                passwordHash: await (0, bcryptjs_1.hash)((0, crypto_1.randomBytes)(24).toString('hex'), 10),
                role: roles_enum_1.UserRole.BUSINESS,
                address: registration.address,
                city: this.extractCity(registration),
                pincode: this.extractPincode(registration),
                isActive: true,
            }));
        const existingBusiness = await this.businessesRepository.findOne({
            where: { userId: user.id },
        });
        const business = existingBusiness
            ? existingBusiness
            : await this.businessesRepository.save(this.businessesRepository.create({
                userId: user.id,
                businessName: registration.businessName,
                address: registration.address,
                city: this.extractCity(registration),
                pincode: this.extractPincode(registration),
                gstNumber: null,
                isApproved: true,
                isActive: true,
                commissionRate: 15,
                rating: 0,
                totalOrders: 0,
            }));
        if (existingBusiness && !existingBusiness.isApproved) {
            existingBusiness.isApproved = true;
            existingBusiness.isActive = true;
            await this.businessesRepository.save(existingBusiness);
        }
        registration.status = entities_1.BusinessRegistrationStatus.APPROVED;
        await this.businessRegistrationsRepository.save(registration);
        return {
            registrationId: registration.id,
            status: registration.status,
            businessId: business.id,
            loginPhone: user.phone,
            loginMode: 'otp',
            businessPortalEnabled: true,
        };
    }
    async rejectBusinessRegistration(id) {
        const registration = await this.businessRegistrationsRepository.findOne({ where: { id } });
        if (!registration) {
            throw new common_1.NotFoundException('Business registration not found');
        }
        registration.status = entities_1.BusinessRegistrationStatus.REJECTED;
        await this.businessRegistrationsRepository.save(registration);
        return {
            registrationId: registration.id,
            status: registration.status,
        };
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
    toAdminRegistrationView(registration) {
        return {
            id: registration.id,
            businessName: registration.businessName,
            ownerName: registration.ownerName,
            phone: registration.phone,
            address: registration.address,
            serviceArea: registration.serviceArea,
            businessType: registration.businessType,
            status: registration.status,
            createdAt: registration.createdAt,
            documents: {
                idProofUrl: registration.idProofPath
                    ? `/uploads/business-registrations/${registration.idProofPath}`
                    : null,
                shopImageUrl: registration.shopImagePath
                    ? `/uploads/business-registrations/${registration.shopImagePath}`
                    : null,
            },
        };
    }
    extractCity(registration) {
        const serviceAreaToken = registration.serviceArea.split(',')[0]?.trim();
        const addressToken = registration.address.split(',')[1]?.trim();
        return serviceAreaToken || addressToken || 'Unknown City';
    }
    extractPincode(registration) {
        const match = `${registration.address} ${registration.serviceArea}`.match(/\b\d{6}\b/);
        return match?.[0] ?? '000000';
    }
};
exports.BusinessesService = BusinessesService;
exports.BusinessesService = BusinessesService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(entities_1.BusinessEntity)),
    __param(1, (0, typeorm_1.InjectRepository)(entities_1.BusinessRegistrationEntity)),
    __param(2, (0, typeorm_1.InjectRepository)(entities_1.UserEntity)),
    __param(3, (0, typeorm_1.InjectRepository)(entities_1.ServiceEntity)),
    __param(4, (0, typeorm_1.InjectRepository)(entities_1.OrderEntity)),
    __param(5, (0, typeorm_1.InjectRepository)(entities_1.RiderEntity)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], BusinessesService);
//# sourceMappingURL=businesses.service.js.map