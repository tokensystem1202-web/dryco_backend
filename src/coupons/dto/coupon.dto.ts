import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsEnum, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { DiscountType } from '../../database/entities/washflow.entity';

export class CreateCouponDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  businessId?: string;

  @ApiProperty()
  @IsString()
  code: string;

  @ApiProperty({ enum: DiscountType })
  @IsEnum(DiscountType)
  discountType: DiscountType;

  @ApiProperty()
  @IsNumber()
  @Min(0)
  discountValue: number;

  @ApiProperty()
  @IsNumber()
  @Min(0)
  minOrderValue: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  maxDiscount?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  usageLimit?: number;

  @ApiProperty()
  @IsDateString()
  validFrom: string;

  @ApiProperty()
  @IsDateString()
  validTill: string;
}

export class UpdateCouponDto extends CreateCouponDto {}

export class ValidateCouponDto {
  @ApiProperty()
  @IsString()
  code: string;

  @ApiProperty()
  @IsNumber()
  @Min(0)
  orderAmount: number;
}
