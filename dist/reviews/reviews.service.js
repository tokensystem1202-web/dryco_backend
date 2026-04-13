"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReviewsService = void 0;
const common_1 = require("@nestjs/common");
const crypto_1 = require("crypto");
let ReviewsService = class ReviewsService {
    create(user, dto) {
        const updatedRating = Number(((4.4 + dto.rating) / 2).toFixed(1));
        return {
            id: (0, crypto_1.randomUUID)(),
            customerId: user.userId,
            ...dto,
            businessRatingUpdatedTo: updatedRating,
            createdAt: new Date().toISOString(),
        };
    }
    findByBusiness(businessId) {
        return [{ id: 'rev-1', businessId, rating: 5, comment: 'Excellent pickup.' }];
    }
    findMyReviews(user) {
        return [{ id: 'rev-1', customerId: user.userId, rating: 4 }];
    }
};
exports.ReviewsService = ReviewsService;
exports.ReviewsService = ReviewsService = __decorate([
    (0, common_1.Injectable)()
], ReviewsService);
//# sourceMappingURL=reviews.service.js.map