import {
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AuthenticatedUser } from '../auth/auth.types';
import { UsersService } from './users.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { Body } from '@nestjs/common';

@ApiTags('Users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('profile')
  getProfile(@CurrentUser() user: AuthenticatedUser) {
    return this.usersService.getProfile(user);
  }

  @Patch('profile')
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('profileImage'))
  updateProfile(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: UpdateProfileDto,
    @UploadedFile() file?: { filename?: string },
  ) {
    return this.usersService.updateProfile(user, dto, file?.filename);
  }

  @Delete('account')
  deleteAccount(@CurrentUser() user: AuthenticatedUser) {
    return this.usersService.deactivateAccount(user);
  }

  @Get('notifications')
  getNotifications(@CurrentUser() user: AuthenticatedUser) {
    return this.usersService.getNotifications(user);
  }

  @Patch('notifications/:id/read')
  markNotificationAsRead(@Param('id') id: string) {
    return this.usersService.markNotificationAsRead(id);
  }
}
