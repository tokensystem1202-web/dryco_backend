import { ApiPropertyOptional, ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsEnum, IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';
import { BusinessRegistrationType } from '../../database/entities';

export class CreateBusinessDto {
  @ApiProperty()
  @IsString()
  businessName: string;

  @ApiProperty()
  @IsString()
  address: string;

  @ApiProperty()
  @IsString()
  city: string;

  @ApiProperty()
  @IsString()
  pincode: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  gstNumber?: string;
}

export class UpdateBusinessDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  businessName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  address?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  city?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  pincode?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  gstNumber?: string;
}

export class UpdateCommissionDto {
  @ApiProperty()
  @IsNumber()
  @Min(0)
  @Max(100)
  commissionRate: number;
}

export class ApprovalDto {
  @ApiProperty()
  @IsBoolean()
  approved: boolean;
}

export class ToggleBusinessStatusDto {
  @ApiProperty()
  @IsBoolean()
  isActive: boolean;
}

export class PublicBusinessRegistrationDto {
  @ApiProperty()
  @IsString()
  businessName: string;

  @ApiProperty()
  @IsString()
  ownerName: string;

  @ApiProperty()
  @IsString()
  phone: string;

  @ApiProperty()
  @IsString()
  address: string;

  @ApiProperty()
  @IsString()
  serviceArea: string;

  @ApiProperty({ enum: BusinessRegistrationType })
  @IsEnum(BusinessRegistrationType)
  businessType: BusinessRegistrationType;
}
