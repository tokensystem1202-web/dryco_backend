import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { existsSync, mkdirSync } from 'fs';
import { AuthenticatedUser } from '../auth/auth.types';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { UserRole } from '../auth/roles.enum';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import {
  ApprovalDto,
  CreateBusinessDto,
  PublicBusinessRegistrationDto,
  ToggleBusinessStatusDto,
  UpdateBusinessDto,
  UpdateCommissionDto,
} from './dto/business.dto';
import { BusinessesService } from './businesses.service';

const businessRegistrationUploadsPath = join(process.cwd(), 'uploads', 'business-registrations');

function ensureBusinessRegistrationUploadsPath() {
  if (!existsSync(businessRegistrationUploadsPath)) {
    mkdirSync(businessRegistrationUploadsPath, { recursive: true });
  }
}

function buildUploadName(prefix: string, originalName: string) {
  const extension = extname(originalName) || '.bin';
  const normalizedPrefix = prefix.replace(/[^a-zA-Z0-9_-]/g, '-').toLowerCase();
  return `${normalizedPrefix}-${Date.now()}-${Math.round(Math.random() * 1e9)}${extension}`;
}

@ApiTags('Businesses')
@Controller()
export class BusinessesController {
  constructor(private readonly businessesService: BusinessesService) {}

  @Post('business/register')
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'idProof', maxCount: 1 },
        { name: 'shopImage', maxCount: 1 },
      ],
      {
        storage: diskStorage({
          destination: (_request, _file, callback) => {
            ensureBusinessRegistrationUploadsPath();
            callback(null, businessRegistrationUploadsPath);
          },
          filename: (_request, file, callback) => {
            callback(null, buildUploadName(file.fieldname, file.originalname));
          },
        }),
      },
    ),
  )
  submitBusinessRegistration(
    @Body() dto: PublicBusinessRegistrationDto,
    @UploadedFiles()
    files: {
      idProof?: Array<{ filename: string }>;
      shopImage?: Array<{ filename: string }>;
    },
  ) {
    return this.businessesService.submitPublicRegistration(dto, files ?? {});
  }

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

  @Get('admin/business-registrations')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  adminListBusinessRegistrations() {
    return this.businessesService.adminListBusinessRegistrations();
  }

  @Get('admin/business-registrations/:id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  adminGetBusinessRegistration(@Param('id') id: string) {
    return this.businessesService.getBusinessRegistrationDetails(id);
  }

  @Patch('business/:id/approve')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  approveBusinessRegistration(@Param('id') id: string) {
    return this.businessesService.approveBusinessRegistration(id);
  }

  @Patch('business/:id/reject')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  rejectBusinessRegistration(@Param('id') id: string) {
    return this.businessesService.rejectBusinessRegistration(id);
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
