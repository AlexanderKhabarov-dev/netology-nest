import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { LoggingInterceptor } from './interceptors/logging.interceptor';
// import { ResponseAdapterInterceptor } from './interceptors/responseAdapter.interceptor';
import { HttpExceptionFilter } from './books/filters/http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalInterceptors(new LoggingInterceptor());
  // Конфликтуют вместе с HttpExceptionFilter. Для проверки необходимо закомментировать наоборот.
  // app.useGlobalInterceptors(new ResponseAdapterInterceptor());
  app.useGlobalFilters(new HttpExceptionFilter());

  await app.listen(process.env.PORT ?? 3000);
}
void bootstrap();
