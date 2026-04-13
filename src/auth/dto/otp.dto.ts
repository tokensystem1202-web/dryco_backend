import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsOptional, IsString, Length } from 'class-validator';

export class SendOtpDto {
  @ApiProperty({ enum: ['phone', 'email'] })
  @IsIn(['phone', 'email'])
  channel: 'phone' | 'email';

  @ApiProperty()
  @IsString()
  recipient: string;
}

export class VerifyOtpDto extends SendOtpDto {
  @ApiProperty()
  @IsString()
  @Length(4, 6)
  otp: string;
}
