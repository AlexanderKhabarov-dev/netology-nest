import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { BooksModule } from './books/books.module';

@Module({
  imports: [
    BooksModule,
    MongooseModule.forRoot('mongodb://localhost/book_crud_db'),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
