import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { UserRole } from '../auth/roles.enum';
import { Roles } from '../common/decorators/roles.decorator';
import { CreateRiderDto, ToggleAvailabilityDto, UpdateRiderDto } from './dto/rider.dto';
import { RidersService } from './riders.service';

@ApiTags('Riders')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.BUSINESS)
@Controller('riders')
export class RidersController {
  constructor(private readonly ridersService: RidersService) {}

  @Post()
  create(@Body() dto: CreateRiderDto) {
    return this.ridersService.create(dto);
  }

  @Get()
  findAll() {
    return this.ridersService.findAll();
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateRiderDto) {
    return this.ridersService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.ridersService.remove(id);
  }

  @Patch(':id/availability')
  toggleAvailability(
    @Param('id') id: string,
    @Body() dto: ToggleAvailabilityDto,
  ) {
    return this.ridersService.toggleAvailability(id, dto);
  }

  @Get(':id/history')
  history(@Param('id') id: string) {
    return this.ridersService.getHistory(id);
  }
}
