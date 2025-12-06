import { Controller, Get } from '@nestjs/common';
import { BooksService } from './books.service';
import type { IBook } from './interfaces/book.interface';

@Controller('books')
export class BooksController {
  constructor(private booksService: BooksService) {}

  @Get()
  findAll(): IBook[] {
    return this.booksService.findAll();
  }

  @Get('/:id')
  findOneById(id: string): IBook | undefined {
    return this.booksService.findOneById(id);
  }
}
