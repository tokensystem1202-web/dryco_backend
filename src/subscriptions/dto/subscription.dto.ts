import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsEnum, IsString } from 'class-validator';
import { SubscriptionPlan } from '../../database/entities/washflow.entity';

export class CreateSubscriptionDto {
  @ApiProperty()
  @IsString()
  businessId: string;

  @ApiProperty({ enum: SubscriptionPlan })
  @IsEnum(SubscriptionPlan)
  planName: SubscriptionPlan;

  @ApiProperty()
  @IsBoolean()
  autoRenew: boolean;
}
