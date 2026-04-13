import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';

@WebSocketGateway({ cors: { origin: '*' } })
export class OrdersGateway {
  @WebSocketServer()
  server: Server;

  emitOrderStatusUpdate(payload: Record<string, unknown>) {
    this.server.emit('order_status_update', payload);
  }

  emitNewOrder(payload: Record<string, unknown>) {
    this.server.emit('new_order_notification', payload);
  }
}
