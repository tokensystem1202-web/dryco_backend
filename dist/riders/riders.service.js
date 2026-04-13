"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RidersService = void 0;
const common_1 = require("@nestjs/common");
const crypto_1 = require("crypto");
let RidersService = class RidersService {
    create(dto) {
        return {
            id: (0, crypto_1.randomUUID)(),
            ...dto,
            isAvailable: true,
            isActive: true,
            totalDeliveries: 0,
            rating: 0,
        };
    }
    findAll() {
        return [{ id: 'rider-1', name: 'Aman Rider', isAvailable: true }];
    }
    update(id, dto) {
        return { id, ...dto };
    }
    remove(id) {
        return { id, removed: true };
    }
    toggleAvailability(id, dto) {
        return { id, ...dto };
    }
    getHistory(id) {
        return {
            riderId: id,
            deliveries: [{ orderNumber: 'WF-1020', deliveredAt: new Date().toISOString() }],
        };
    }
};
exports.RidersService = RidersService;
exports.RidersService = RidersService = __decorate([
    (0, common_1.Injectable)()
], RidersService);
//# sourceMappingURL=riders.service.js.map