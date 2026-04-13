import { ApiPropertyOptional, ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsEmail, IsOptional, IsString } from 'class-validator';

export class CreateRiderDto {
  @ApiProperty()
  @IsString()
  businessId: string;

  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsString()
  phone: string;

  @ApiProperty()
  @IsEmail()
  email: string;

  @ApiProperty()
  @IsString()
  vehicleType: string;

  @ApiProperty()
  @IsString()
  vehicleNumber: string;

  @ApiProperty()
  @IsString()
  licenseNumber: string;
}

export class UpdateRiderDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  vehicleType?: string;
}

export class ToggleAvailabilityDto {
  @ApiProperty()
  @IsBoolean()
  isAvailable: boolean;
}
