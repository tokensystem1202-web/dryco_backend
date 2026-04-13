import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, map } from 'rxjs';

@Injectable()
export class TransformInterceptor<T>
  implements NestInterceptor<T, { data: T; timestamp: string; path: string }>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<{ data: T; timestamp: string; path: string }> {
    const request = context.switchToHttp().getRequest();

    return next.handle().pipe(
      map((data) => ({
        data,
        timestamp: new Date().toISOString(),
        path: request.url,
      })),
    );
  }
}
