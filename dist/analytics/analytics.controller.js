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
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnalyticsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const roles_guard_1 = require("../auth/guards/roles.guard");
const roles_enum_1 = require("../auth/roles.enum");
const roles_decorator_1 = require("../common/decorators/roles.decorator");
const analytics_service_1 = require("./analytics.service");
let AnalyticsController = class AnalyticsController {
    constructor(analyticsService) {
        this.analyticsService = analyticsService;
    }
    businessSummary() {
        return this.analyticsService.businessSummary();
    }
    businessRevenueChart() {
        return this.analyticsService.businessRevenueChart();
    }
    businessOrdersChart() {
        return this.analyticsService.businessOrdersChart();
    }
    businessTopItems() {
        return this.analyticsService.businessTopItems();
    }
    adminSummary() {
        return this.analyticsService.adminSummary();
    }
    adminGrowthChart() {
        return this.analyticsService.adminGrowthChart();
    }
    topBusinesses() {
        return this.analyticsService.topBusinesses();
    }
};
exports.AnalyticsController = AnalyticsController;
__decorate([
    (0, roles_decorator_1.Roles)(roles_enum_1.UserRole.BUSINESS),
    (0, common_1.Get)('business/summary'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AnalyticsController.prototype, "businessSummary", null);
__decorate([
    (0, roles_decorator_1.Roles)(roles_enum_1.UserRole.BUSINESS),
    (0, common_1.Get)('business/revenue-chart'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AnalyticsController.prototype, "businessRevenueChart", null);
__decorate([
    (0, roles_decorator_1.Roles)(roles_enum_1.UserRole.BUSINESS),
    (0, common_1.Get)('business/orders-chart'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AnalyticsController.prototype, "businessOrdersChart", null);
__decorate([
    (0, roles_decorator_1.Roles)(roles_enum_1.UserRole.BUSINESS),
    (0, common_1.Get)('business/top-items'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AnalyticsController.prototype, "businessTopItems", null);
__decorate([
    (0, roles_decorator_1.Roles)(roles_enum_1.UserRole.ADMIN),
    (0, common_1.Get)('admin/summary'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AnalyticsController.prototype, "adminSummary", null);
__decorate([
    (0, roles_decorator_1.Roles)(roles_enum_1.UserRole.ADMIN),
    (0, common_1.Get)('admin/growth-chart'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AnalyticsController.prototype, "adminGrowthChart", null);
__decorate([
    (0, roles_decorator_1.Roles)(roles_enum_1.UserRole.ADMIN),
    (0, common_1.Get)('admin/top-businesses'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AnalyticsController.prototype, "topBusinesses", null);
exports.AnalyticsController = AnalyticsController = __decorate([
    (0, swagger_1.ApiTags)('Analytics'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, common_1.Controller)('analytics'),
    __metadata("design:paramtypes", [analytics_service_1.AnalyticsService])
], AnalyticsController);
//# sourceMappingURL=analytics.controller.js.map