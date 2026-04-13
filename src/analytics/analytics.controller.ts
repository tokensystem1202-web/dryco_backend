import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { UserRole } from '../auth/roles.enum';
import { Roles } from '../common/decorators/roles.decorator';
import { AnalyticsService } from './analytics.service';

@ApiTags('Analytics')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Roles(UserRole.BUSINESS)
  @Get('business/summary')
  businessSummary() {
    return this.analyticsService.businessSummary();
  }

  @Roles(UserRole.BUSINESS)
  @Get('business/revenue-chart')
  businessRevenueChart() {
    return this.analyticsService.businessRevenueChart();
  }

  @Roles(UserRole.BUSINESS)
  @Get('business/orders-chart')
  businessOrdersChart() {
    return this.analyticsService.businessOrdersChart();
  }

  @Roles(UserRole.BUSINESS)
  @Get('business/top-items')
  businessTopItems() {
    return this.analyticsService.businessTopItems();
  }

  @Roles(UserRole.ADMIN)
  @Get('admin/summary')
  adminSummary() {
    return this.analyticsService.adminSummary();
  }

  @Roles(UserRole.ADMIN)
  @Get('admin/growth-chart')
  adminGrowthChart() {
    return this.analyticsService.adminGrowthChart();
  }

  @Roles(UserRole.ADMIN)
  @Get('admin/top-businesses')
  topBusinesses() {
    return this.analyticsService.topBusinesses();
  }
}
