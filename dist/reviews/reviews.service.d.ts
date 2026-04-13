import { AuthenticatedUser } from '../auth/auth.types';
import { CreateReviewDto } from './dto/review.dto';
export declare class ReviewsService {
    create(user: AuthenticatedUser, dto: CreateReviewDto): {
        businessRatingUpdatedTo: number;
        createdAt: string;
        orderId: string;
        businessId: string;
        rating: number;
        comment?: string;
        id: `${string}-${string}-${string}-${string}-${string}`;
        customerId: string;
    };
    findByBusiness(businessId: string): {
        id: string;
        businessId: string;
        rating: number;
        comment: string;
    }[];
    findMyReviews(user: AuthenticatedUser): {
        id: string;
        customerId: string;
        rating: number;
    }[];
}
