import { Injectable } from '@nestjs/common';

@Injectable()
export class AnalyticsService {
  businessSummary() {
    return {
      totalOrders: 0,
      revenueToday: 0,
      pendingPickups: 0,
      growthPercentage: 0,
    };
  }

  businessRevenueChart() {
    return [];
  }

  businessOrdersChart() {
    return [];
  }

  businessTopItems() {
    return [];
  }

  adminSummary() {
    return {
      platformGmv: 0,
      totalUsers: 0,
      totalBusinesses: 0,
      commissionsEarned: 0,
    };
  }

  adminGrowthChart() {
    return [];
  }

  topBusinesses() {
    return [];
  }
}
