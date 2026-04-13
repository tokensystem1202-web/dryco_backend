import { Server } from 'socket.io';
export declare class OrdersGateway {
    server: Server;
    emitOrderStatusUpdate(payload: Record<string, unknown>): void;
    emitNewOrder(payload: Record<string, unknown>): void;
}
