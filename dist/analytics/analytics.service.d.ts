export declare class AnalyticsService {
    businessSummary(): {
        totalOrders: number;
        revenueToday: number;
        pendingPickups: number;
        growthPercentage: number;
    };
    businessRevenueChart(): any[];
    businessOrdersChart(): any[];
    businessTopItems(): any[];
    adminSummary(): {
        platformGmv: number;
        totalUsers: number;
        totalBusinesses: number;
        commissionsEarned: number;
    };
    adminGrowthChart(): any[];
    topBusinesses(): any[];
}
