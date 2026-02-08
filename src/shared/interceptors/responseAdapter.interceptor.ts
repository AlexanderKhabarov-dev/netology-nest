import { CallHandler, ExecutionContext, NestInterceptor } from '@nestjs/common';
import { catchError, map, Observable, throwError } from 'rxjs';

export interface Response<T> {
  status: string;
  data?: T;
  error?: string;
}

export class ResponseAdapterInterceptor<T> implements NestInterceptor<
  T,
  Response<T>
> {
  intercept(
    _context: ExecutionContext,
    next: CallHandler,
  ): Observable<Response<T>> {
    return next.handle().pipe(
      map((data: T) => ({
        status: 'ok',
        data,
      })),
      catchError((err: unknown) => {
        return throwError(() => err);
      }),
    );
  }
}
