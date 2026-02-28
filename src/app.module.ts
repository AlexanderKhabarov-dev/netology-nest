import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { BooksModule } from './books/books.module';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { CustomValidatePipe } from './shared/pipes/custom-validation.pipe';
import { BookCommentsModule } from './book-comments/book-comments.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    BooksModule,
    MongooseModule.forRoot(
      process.env.DB_URI ??
        'mongodb://root:root@mongo:27017/nest_db?authSource=admin',
    ),
    AuthModule,
    UsersModule,
    BookCommentsModule,
  ],
  controllers: [AppController],
  providers: [AppService, CustomValidatePipe],
})
export class AppModule {}
