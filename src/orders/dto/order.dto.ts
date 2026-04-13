import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsDateString,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { OrderStatus, ServiceCategory } from '../../database/entities/washflow.entity';

export class CreateOrderItemDto {
  @ApiProperty()
  @IsString()
  serviceId: string;

  @ApiProperty()
  @IsString()
  itemName: string;

  @ApiProperty({ enum: ServiceCategory })
  @IsEnum(ServiceCategory)
  category: ServiceCategory;

  @ApiProperty()
  @IsInt()
  @Min(1)
  quantity: number;

  @ApiProperty()
  @Min(0)
  pricePerUnit: number;
}

export class CreateOrderDto {
  @ApiProperty()
  @IsString()
  businessId: string;

  @ApiProperty()
  @IsString()
  pickupSlot: string;

  @ApiProperty()
  @IsString()
  deliverySlot: string;

  @ApiProperty()
  @IsDateString()
  pickupDate: string;

  @ApiProperty()
  @IsDateString()
  deliveryDate: string;

  @ApiProperty({ type: [CreateOrderItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateOrderItemDto)
  items: CreateOrderItemDto[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  couponCode?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  specialInstructions?: string;
}

export class UpdateOrderStatusDto {
  @ApiProperty({ enum: OrderStatus })
  @IsEnum(OrderStatus)
  status: OrderStatus;
}

export class AssignRiderDto {
  @ApiProperty()
  @IsString()
  riderId: string;
}
