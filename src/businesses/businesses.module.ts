import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BusinessEntity, OrderEntity, RiderEntity, ServiceEntity } from '../database/entities';
import { BusinessesController } from './businesses.controller';
import { BusinessesService } from './businesses.service';

@Module({
  imports: [TypeOrmModule.forFeature([BusinessEntity, ServiceEntity, OrderEntity, RiderEntity])],
  controllers: [BusinessesController],
  providers: [BusinessesService],
  exports: [BusinessesService],
})
export class BusinessesModule {}
