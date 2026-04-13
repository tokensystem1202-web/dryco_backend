import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';
import { RegisterDto } from './register.dto';

export class LoginWithOtpDto {
  @ApiProperty()
  @IsString()
  recipient: string;

  @ApiProperty()
  @IsString()
  @MinLength(4)
  otp: string;
}

export class RegisterWithOtpDto extends RegisterDto {
  @ApiProperty()
  @IsString()
  @MinLength(4)
  otp: string;

  @ApiProperty()
  @IsString()
  recipient: string;
}