import { Injectable } from '@nestjs/common';
import { IBook } from './interfaces/book.interface';

@Injectable()
export class BooksService {
  private readonly books: IBook[] = [
    {
      id: '1',
      name: '123',
    },
  ];

  findAll(): IBook[] {
    return this.books;
  }

  findOneById(id: string): IBook | undefined {
    return this.books.find((item) => item.id === id);
  }
}
