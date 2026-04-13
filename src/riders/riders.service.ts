import { Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { CreateRiderDto, ToggleAvailabilityDto, UpdateRiderDto } from './dto/rider.dto';

@Injectable()
export class RidersService {
  create(dto: CreateRiderDto) {
    return {
      id: randomUUID(),
      ...dto,
      isAvailable: true,
      isActive: true,
      totalDeliveries: 0,
      rating: 0,
    };
  }

  findAll() {
    return [{ id: 'rider-1', name: 'Aman Rider', isAvailable: true }];
  }

  update(id: string, dto: UpdateRiderDto) {
    return { id, ...dto };
  }

  remove(id: string) {
    return { id, removed: true };
  }

  toggleAvailability(id: string, dto: ToggleAvailabilityDto) {
    return { id, ...dto };
  }

  getHistory(id: string) {
    return {
      riderId: id,
      deliveries: [{ orderNumber: 'WF-1020', deliveredAt: new Date().toISOString() }],
    };
  }
}
