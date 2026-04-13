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
exports.RidersController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const roles_guard_1 = require("../auth/guards/roles.guard");
const roles_enum_1 = require("../auth/roles.enum");
const roles_decorator_1 = require("../common/decorators/roles.decorator");
const rider_dto_1 = require("./dto/rider.dto");
const riders_service_1 = require("./riders.service");
let RidersController = class RidersController {
    constructor(ridersService) {
        this.ridersService = ridersService;
    }
    create(dto) {
        return this.ridersService.create(dto);
    }
    findAll() {
        return this.ridersService.findAll();
    }
    update(id, dto) {
        return this.ridersService.update(id, dto);
    }
    remove(id) {
        return this.ridersService.remove(id);
    }
    toggleAvailability(id, dto) {
        return this.ridersService.toggleAvailability(id, dto);
    }
    history(id) {
        return this.ridersService.getHistory(id);
    }
};
exports.RidersController = RidersController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [rider_dto_1.CreateRiderDto]),
    __metadata("design:returntype", void 0)
], RidersController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], RidersController.prototype, "findAll", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, rider_dto_1.UpdateRiderDto]),
    __metadata("design:returntype", void 0)
], RidersController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], RidersController.prototype, "remove", null);
__decorate([
    (0, common_1.Patch)(':id/availability'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, rider_dto_1.ToggleAvailabilityDto]),
    __metadata("design:returntype", void 0)
], RidersController.prototype, "toggleAvailability", null);
__decorate([
    (0, common_1.Get)(':id/history'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], RidersController.prototype, "history", null);
exports.RidersController = RidersController = __decorate([
    (0, swagger_1.ApiTags)('Riders'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(roles_enum_1.UserRole.BUSINESS),
    (0, common_1.Controller)('riders'),
    __metadata("design:paramtypes", [riders_service_1.RidersService])
], RidersController);
//# sourceMappingURL=riders.controller.js.map