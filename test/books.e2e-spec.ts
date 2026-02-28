/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { Test, TestingModule } from '@nestjs/testing';
import {
  INestApplication,
  NotFoundException,
  ValidationPipe,
} from '@nestjs/common';
import request from 'supertest';
import { AuthGuard } from '@nestjs/passport';
import { useContainer } from 'class-validator';
import { BooksController } from '../src/books/books.controller';
import { BooksService } from '../src/books/books.service';
import { CustomValidatePipe } from '../src/shared/pipes/custom-validation.pipe';

describe('BooksController (e2e тесты)', () => {
  const booksService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  describe('CRUD операции', () => {
    let app: INestApplication;

    beforeEach(async () => {
      jest.clearAllMocks();

      const module: TestingModule = await Test.createTestingModule({
        controllers: [BooksController],
        providers: [
          { provide: BooksService, useValue: booksService },
          CustomValidatePipe,
        ],
      })
        .overrideGuard(AuthGuard('jwt'))
        .useValue({ canActivate: () => true })
        .overridePipe(CustomValidatePipe)
        .useValue({ transform: (value: unknown) => value })
        .compile();

      app = module.createNestApplication();
      await app.init();
    });

    afterEach(async () => {
      await app.close();
    });

    describe('GET /books', () => {
      it('должен вернуть все книги со статусом 200', async () => {
        const books = [
          { title: 'Clean Code', author: 'R. Martin', pages: 200 },
        ];
        booksService.findAll.mockResolvedValue(books);

        return request(app.getHttpServer())
          .get('/books')
          .expect(200)
          .expect(books);
      });
    });

    describe('GET /books/get/:id', () => {
      it('должен вернуть одну книгу со статусом 200', async () => {
        const book = { title: 'Clean Code', author: 'R. Martin', pages: 200 };
        booksService.findOne.mockResolvedValue(book);

        return request(app.getHttpServer())
          .get('/books/get/someId')
          .expect(200)
          .expect(book);
      });

      it('должен вернуть 404, если книга не найдена', async () => {
        booksService.findOne.mockRejectedValue(
          new NotFoundException('Book not found'),
        );

        return request(app.getHttpServer()).get('/books/get/badId').expect(404);
      });
    });

    describe('POST /books', () => {
      it('должен создать книгу и вернуть 201', async () => {
        const dto = { title: 'Clean Code', author: 'R. Martin', pages: 200 };
        booksService.create.mockResolvedValue(dto);

        return request(app.getHttpServer())
          .post('/books')
          .send(dto)
          .expect(201)
          .expect(dto);
      });
    });

    describe('PATCH /books/:id', () => {
      it('должен обновить книгу и вернуть 200', async () => {
        const dto = { title: 'Updated Title' };
        const updated = {
          title: 'Updated Title',
          author: 'R. Martin',
          pages: 200,
        };
        booksService.update.mockResolvedValue(updated);

        return request(app.getHttpServer())
          .patch('/books/someId')
          .send(dto)
          .expect(200)
          .expect(updated);
      });

      it('должен вернуть 404, если обновляемая книга не найдена', async () => {
        booksService.update.mockRejectedValue(
          new NotFoundException('Book not found'),
        );

        return request(app.getHttpServer())
          .patch('/books/badId')
          .send({ title: 'Title' })
          .expect(404);
      });
    });

    describe('DELETE /books/:id', () => {
      it('должен удалить книгу и вернуть 200', async () => {
        const result = { message: 'Book successfully deleted', id: 'someId' };
        booksService.remove.mockResolvedValue(result);

        return request(app.getHttpServer())
          .delete('/books/someId')
          .expect(200)
          .expect(result);
      });

      it('должен вернуть 404, если удаляемая книга не найдена', async () => {
        booksService.remove.mockRejectedValue(
          new NotFoundException('Book not found'),
        );

        return request(app.getHttpServer()).delete('/books/badId').expect(404);
      });
    });
  });

  describe('Валидация', () => {
    let app: INestApplication;

    beforeEach(async () => {
      jest.clearAllMocks();

      const module: TestingModule = await Test.createTestingModule({
        controllers: [BooksController],
        providers: [
          { provide: BooksService, useValue: booksService },
          CustomValidatePipe,
        ],
      })
        .overrideGuard(AuthGuard('jwt'))
        .useValue({ canActivate: () => true })
        .compile();

      useContainer(module, { fallbackOnErrors: true });

      app = module.createNestApplication();
      app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
      await app.init();
    });

    afterEach(async () => {
      await app.close();
    });

    describe('POST /books — невалидные данные', () => {
      it('должен вернуть 400 при отсутствии обязательного поля title', async () => {
        return request(app.getHttpServer())
          .post('/books')
          .send({ author: 'Author', pages: 100 })
          .expect(400);
      });

      it('должен вернуть 400 при слишком коротком title (меньше 3 символов)', async () => {
        return request(app.getHttpServer())
          .post('/books')
          .send({ title: 'ab', author: 'Author', pages: 100 })
          .expect(400);
      });

      it('должен вернуть 400, если title содержит запрещённое слово "spam"', async () => {
        return request(app.getHttpServer())
          .post('/books')
          .send({ title: 'spam book', author: 'Author', pages: 100 })
          .expect(400);
      });

      it('должен вернуть 400, если title содержит запрещённое слово "admin"', async () => {
        return request(app.getHttpServer())
          .post('/books')
          .send({ title: 'admin guide', author: 'Author', pages: 100 })
          .expect(400);
      });
    });

    describe('PATCH /books/:id — невалидные данные', () => {
      it('должен вернуть 400, если title содержит запрещённое слово "test"', async () => {
        return request(app.getHttpServer())
          .patch('/books/someId')
          .send({ title: 'test title' })
          .expect(400);
      });

      it('должен вернуть 400, если title содержит запрещённое слово "delete"', async () => {
        return request(app.getHttpServer())
          .patch('/books/someId')
          .send({ title: 'delete this' })
          .expect(400);
      });
    });
  });
});
