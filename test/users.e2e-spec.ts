import { Test, TestingModule } from '@nestjs/testing';
import {
  INestApplication,
  UnauthorizedException,
  ConflictException,
  ValidationPipe,
} from '@nestjs/common';
import request from 'supertest';
import { UsersController } from '../src/users/users.controller';
import { UsersService } from '../src/users/users.service';

describe('UsersController (e2e тесты)', () => {
  let app: INestApplication;

  const usersService = {
    signup: jest.fn(),
    signin: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [{ provide: UsersService, useValue: usersService }],
    }).compile();

    app = module.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }),
    );
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  describe('POST /users/signup', () => {
    it('должен создать пользователя и вернуть 201', async () => {
      const dto = {
        email: 'john@example.com',
        firstName: 'John',
        lastName: 'Doe',
        password: 'secret',
      };
      const result = {
        id: 'abc123',
        email: dto.email,
        firstName: dto.firstName,
      };
      usersService.signup.mockResolvedValue(result);

      return request(app.getHttpServer())
        .post('/users/signup')
        .send(dto)
        .expect(201)
        .expect(result);
    });

    it('должен вернуть 409, если email уже занят', async () => {
      usersService.signup.mockRejectedValue(
        new ConflictException('User with this email already exists'),
      );

      return request(app.getHttpServer())
        .post('/users/signup')
        .send({
          email: 'existing@example.com',
          firstName: 'Jane',
          lastName: 'Doe',
          password: 'secret',
        })
        .expect(409);
    });

    it('должен вернуть 400 при отсутствии поля email', async () => {
      return request(app.getHttpServer())
        .post('/users/signup')
        .send({ firstName: 'John', lastName: 'Doe', password: 'secret' })
        .expect(400);
    });

    it('должен вернуть 400 при невалидном формате email', async () => {
      return request(app.getHttpServer())
        .post('/users/signup')
        .send({
          email: 'not-an-email',
          firstName: 'John',
          lastName: 'Doe',
          password: 'secret',
        })
        .expect(400);
    });

    it('должен вернуть 400 при отсутствии обязательного поля firstName', async () => {
      return request(app.getHttpServer())
        .post('/users/signup')
        .send({
          email: 'john@example.com',
          lastName: 'Doe',
          password: 'secret',
        })
        .expect(400);
    });
  });

  describe('POST /users/signin', () => {
    it('должен вернуть access_token и статус 200', async () => {
      const dto = { email: 'john@example.com', password: 'secret' };
      const result = { access_token: 'jwt.token.value' };
      usersService.signin.mockResolvedValue(result);

      return request(app.getHttpServer())
        .post('/users/signin')
        .send(dto)
        .expect(201)
        .expect(result);
    });

    it('должен вернуть 401 при неверных учётных данных', async () => {
      usersService.signin.mockRejectedValue(
        new UnauthorizedException('Invalid credentials'),
      );

      return request(app.getHttpServer())
        .post('/users/signin')
        .send({ email: 'wrong@example.com', password: 'wrongpass' })
        .expect(401);
    });

    it('должен вернуть 400 при отсутствии поля password', async () => {
      return request(app.getHttpServer())
        .post('/users/signin')
        .send({ email: 'john@example.com' })
        .expect(400);
    });

    it('должен вернуть 400 при невалидном формате email', async () => {
      return request(app.getHttpServer())
        .post('/users/signin')
        .send({ email: 'not-email', password: 'secret' })
        .expect(400);
    });
  });
});
