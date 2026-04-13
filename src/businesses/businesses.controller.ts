import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthenticatedUser } from '../auth/auth.types';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { UserRole } from '../auth/roles.enum';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import {
  ApprovalDto,
  CreateBusinessDto,
  ToggleBusinessStatusDto,
  UpdateBusinessDto,
  UpdateCommissionDto,
} from './dto/business.dto';
import { BusinessesService } from './businesses.service';

@ApiTags('Businesses')
@Controller()
export class BusinessesController {
  constructor(private readonly businessesService: BusinessesService) {}

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.BUSINESS, UserRole.ADMIN)
  @Post('businesses')
  registerBusiness(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateBusinessDto,
  ) {
    return this.businessesService.registerBusiness(user, dto);
  }

  @Get('businesses')
  listBusinesses(@Query() query: Record<string, string | undefined>) {
    return this.businessesService.listApprovedBusinesses(query);
  }

  @Get('businesses/my')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.BUSINESS)
  getMyBusiness(@CurrentUser() user: AuthenticatedUser) {
    return this.businessesService.getMyBusiness(user);
  }

  @Get('businesses/:id')
  getBusinessDetails(@Param('id') id: string) {
    return this.businessesService.getBusinessDetails(id);
  }

  @Patch('businesses/:id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.BUSINESS, UserRole.ADMIN)
  updateBusiness(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
    @Body() dto: UpdateBusinessDto,
  ) {
    return this.businessesService.updateBusiness(user, id, dto);
  }

  @Get('businesses/:id/stats')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.BUSINESS, UserRole.ADMIN)
  getBusinessStats(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string) {
    return this.businessesService.getBusinessStats(user, id);
  }

  @Get('admin/businesses')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  adminListBusinesses() {
    return this.businessesService.adminListBusinesses();
  }

  @Patch('admin/businesses/:id/approve')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  approveBusiness(@Param('id') id: string, @Body() dto: ApprovalDto) {
    return this.businessesService.approveBusiness(id, dto);
  }

  @Patch('admin/businesses/:id/status')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  toggleBusinessStatus(
    @Param('id') id: string,
    @Body() dto: ToggleBusinessStatusDto,
  ) {
    return this.businessesService.toggleBusinessStatus(id, dto);
  }

  @Patch('admin/businesses/:id/commission')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  updateCommission(
    @Param('id') id: string,
    @Body() dto: UpdateCommissionDto,
  ) {
    return this.businessesService.updateCommission(id, dto);
  }
}
