import { Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { AuthenticatedUser } from '../auth/auth.types';
import { CreateReviewDto } from './dto/review.dto';

@Injectable()
export class ReviewsService {
  create(user: AuthenticatedUser, dto: CreateReviewDto) {
    const updatedRating = Number(((4.4 + dto.rating) / 2).toFixed(1));
    return {
      id: randomUUID(),
      customerId: user.userId,
      ...dto,
      businessRatingUpdatedTo: updatedRating,
      createdAt: new Date().toISOString(),
    };
  }

  findByBusiness(businessId: string) {
    return [{ id: 'rev-1', businessId, rating: 5, comment: 'Excellent pickup.' }];
  }

  findMyReviews(user: AuthenticatedUser) {
    return [{ id: 'rev-1', customerId: user.userId, rating: 4 }];
  }
}
