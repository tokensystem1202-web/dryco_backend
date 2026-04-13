import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  BusinessEntity,
  BusinessRegistrationEntity,
  OrderEntity,
  RiderEntity,
  ServiceEntity,
  UserEntity,
} from '../database/entities';
import { BusinessesController } from './businesses.controller';
import { BusinessesService } from './businesses.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      BusinessEntity,
      BusinessRegistrationEntity,
      UserEntity,
      ServiceEntity,
      OrderEntity,
      RiderEntity,
    ]),
  ],
  controllers: [BusinessesController],
  providers: [BusinessesService],
  exports: [BusinessesService],
})
export class BusinessesModule {}
