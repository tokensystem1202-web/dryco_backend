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
exports.BusinessesController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const swagger_1 = require("@nestjs/swagger");
const multer_1 = require("multer");
const path_1 = require("path");
const fs_1 = require("fs");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const roles_guard_1 = require("../auth/guards/roles.guard");
const roles_enum_1 = require("../auth/roles.enum");
const current_user_decorator_1 = require("../common/decorators/current-user.decorator");
const roles_decorator_1 = require("../common/decorators/roles.decorator");
const business_dto_1 = require("./dto/business.dto");
const businesses_service_1 = require("./businesses.service");
const businessRegistrationUploadsPath = (0, path_1.join)(process.cwd(), 'uploads', 'business-registrations');
function ensureBusinessRegistrationUploadsPath() {
    if (!(0, fs_1.existsSync)(businessRegistrationUploadsPath)) {
        (0, fs_1.mkdirSync)(businessRegistrationUploadsPath, { recursive: true });
    }
}
function buildUploadName(prefix, originalName) {
    const extension = (0, path_1.extname)(originalName) || '.bin';
    const normalizedPrefix = prefix.replace(/[^a-zA-Z0-9_-]/g, '-').toLowerCase();
    return `${normalizedPrefix}-${Date.now()}-${Math.round(Math.random() * 1e9)}${extension}`;
}
let BusinessesController = class BusinessesController {
    constructor(businessesService) {
        this.businessesService = businessesService;
    }
    submitBusinessRegistration(dto, files) {
        return this.businessesService.submitPublicRegistration(dto, files ?? {});
    }
    registerBusiness(user, dto) {
        return this.businessesService.registerBusiness(user, dto);
    }
    listBusinesses(query) {
        return this.businessesService.listApprovedBusinesses(query);
    }
    getMyBusiness(user) {
        return this.businessesService.getMyBusiness(user);
    }
    getBusinessDetails(id) {
        return this.businessesService.getBusinessDetails(id);
    }
    updateBusiness(user, id, dto) {
        return this.businessesService.updateBusiness(user, id, dto);
    }
    getBusinessStats(user, id) {
        return this.businessesService.getBusinessStats(user, id);
    }
    adminListBusinesses() {
        return this.businessesService.adminListBusinesses();
    }
    adminListBusinessRegistrations() {
        return this.businessesService.adminListBusinessRegistrations();
    }
    adminGetBusinessRegistration(id) {
        return this.businessesService.getBusinessRegistrationDetails(id);
    }
    approveBusinessRegistration(id) {
        return this.businessesService.approveBusinessRegistration(id);
    }
    rejectBusinessRegistration(id) {
        return this.businessesService.rejectBusinessRegistration(id);
    }
    approveBusiness(id, dto) {
        return this.businessesService.approveBusiness(id, dto);
    }
    toggleBusinessStatus(id, dto) {
        return this.businessesService.toggleBusinessStatus(id, dto);
    }
    updateCommission(id, dto) {
        return this.businessesService.updateCommission(id, dto);
    }
};
exports.BusinessesController = BusinessesController;
__decorate([
    (0, common_1.Post)('business/register'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileFieldsInterceptor)([
        { name: 'idProof', maxCount: 1 },
        { name: 'shopImage', maxCount: 1 },
    ], {
        storage: (0, multer_1.diskStorage)({
            destination: (_request, _file, callback) => {
                ensureBusinessRegistrationUploadsPath();
                callback(null, businessRegistrationUploadsPath);
            },
            filename: (_request, file, callback) => {
                callback(null, buildUploadName(file.fieldname, file.originalname));
            },
        }),
    })),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.UploadedFiles)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [business_dto_1.PublicBusinessRegistrationDto, Object]),
    __metadata("design:returntype", void 0)
], BusinessesController.prototype, "submitBusinessRegistration", null);
__decorate([
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(roles_enum_1.UserRole.BUSINESS, roles_enum_1.UserRole.ADMIN),
    (0, common_1.Post)('businesses'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, business_dto_1.CreateBusinessDto]),
    __metadata("design:returntype", void 0)
], BusinessesController.prototype, "registerBusiness", null);
__decorate([
    (0, common_1.Get)('businesses'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], BusinessesController.prototype, "listBusinesses", null);
__decorate([
    (0, common_1.Get)('businesses/my'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(roles_enum_1.UserRole.BUSINESS),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], BusinessesController.prototype, "getMyBusiness", null);
__decorate([
    (0, common_1.Get)('businesses/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], BusinessesController.prototype, "getBusinessDetails", null);
__decorate([
    (0, common_1.Patch)('businesses/:id'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(roles_enum_1.UserRole.BUSINESS, roles_enum_1.UserRole.ADMIN),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, business_dto_1.UpdateBusinessDto]),
    __metadata("design:returntype", void 0)
], BusinessesController.prototype, "updateBusiness", null);
__decorate([
    (0, common_1.Get)('businesses/:id/stats'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(roles_enum_1.UserRole.BUSINESS, roles_enum_1.UserRole.ADMIN),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], BusinessesController.prototype, "getBusinessStats", null);
__decorate([
    (0, common_1.Get)('admin/businesses'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(roles_enum_1.UserRole.ADMIN),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], BusinessesController.prototype, "adminListBusinesses", null);
__decorate([
    (0, common_1.Get)('admin/business-registrations'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(roles_enum_1.UserRole.ADMIN),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], BusinessesController.prototype, "adminListBusinessRegistrations", null);
__decorate([
    (0, common_1.Get)('admin/business-registrations/:id'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(roles_enum_1.UserRole.ADMIN),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], BusinessesController.prototype, "adminGetBusinessRegistration", null);
__decorate([
    (0, common_1.Patch)('business/:id/approve'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(roles_enum_1.UserRole.ADMIN),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], BusinessesController.prototype, "approveBusinessRegistration", null);
__decorate([
    (0, common_1.Patch)('business/:id/reject'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(roles_enum_1.UserRole.ADMIN),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], BusinessesController.prototype, "rejectBusinessRegistration", null);
__decorate([
    (0, common_1.Patch)('admin/businesses/:id/approve'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(roles_enum_1.UserRole.ADMIN),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, business_dto_1.ApprovalDto]),
    __metadata("design:returntype", void 0)
], BusinessesController.prototype, "approveBusiness", null);
__decorate([
    (0, common_1.Patch)('admin/businesses/:id/status'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(roles_enum_1.UserRole.ADMIN),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, business_dto_1.ToggleBusinessStatusDto]),
    __metadata("design:returntype", void 0)
], BusinessesController.prototype, "toggleBusinessStatus", null);
__decorate([
    (0, common_1.Patch)('admin/businesses/:id/commission'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(roles_enum_1.UserRole.ADMIN),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, business_dto_1.UpdateCommissionDto]),
    __metadata("design:returntype", void 0)
], BusinessesController.prototype, "updateCommission", null);
exports.BusinessesController = BusinessesController = __decorate([
    (0, swagger_1.ApiTags)('Businesses'),
    (0, common_1.Controller)(),
    __metadata("design:paramtypes", [businesses_service_1.BusinessesService])
], BusinessesController);
//# sourceMappingURL=businesses.controller.js.map