import { CallHandler, ExecutionContext, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
export declare class TransformInterceptor<T> implements NestInterceptor<T, {
    data: T;
    timestamp: string;
    path: string;
}> {
    intercept(context: ExecutionContext, next: CallHandler): Observable<{
        data: T;
        timestamp: string;
        path: string;
    }>;
}
