# Netology NestJS — учебный REST API + WebSocket
---

## Содержание

- [Технологии](#технологии)
- [Структура проекта](#структура-проекта)
- [Модули и сервисы](#модули-и-сервисы)
- [API](#api)
- [WebSocket](#websocket)
- [Переменные окружения](#переменные-окружения)
- [Запуск локально](#запуск-локально)
- [Запуск через Docker](#запуск-через-docker)
- [Тесты](#тесты)

---

## Технологии

| Категория | Стек |
|---|---|
| Фреймворк | NestJS 11, Express |
| База данных | MongoDB (Mongoose) |
| Аутентификация | Passport.js, JWT, bcrypt |
| WebSocket | Socket.io (`@nestjs/websockets`) |
| Валидация | class-validator, class-transformer |
| Документация | Swagger / OpenAPI |
| Контейнеры | Docker, Docker Compose |
| Тесты | Jest, Supertest |
| Линтинг | ESLint, Prettier |

---

## Структура проекта

```
netology-nest/
├── src/
│   ├── main.ts                        # Точка входа
│   ├── app.module.ts                  # Корневой модуль
│   ├── app.controller.ts              # GET / — health-check
│   │
│   ├── auth/                          # Аутентификация
│   │   ├── auth.module.ts
│   │   ├── auth.service.ts            # Генерация JWT
│   │   ├── dto/
│   │   │   └── jwt-payload.dto.ts
│   │   └── strategies/
│   │       └── jwt.strategy.ts        # Passport JWT стратегия
│   │
│   ├── users/                         # Пользователи
│   │   ├── users.module.ts
│   │   ├── users.controller.ts        # /users/signup, /users/signin
│   │   ├── users.service.ts
│   │   ├── dto/
│   │   │   ├── signup-user.dto.ts
│   │   │   ├── signin-user.dto.ts
│   │   │   └── user-response.dto.ts
│   │   └── entities/
│   │       └── user.entity.ts
│   │
│   ├── books/                         # Книги (CRUD)
│   │   ├── books.module.ts
│   │   ├── books.controller.ts        # /books — защищённые маршруты
│   │   ├── books.service.ts
│   │   ├── dto/
│   │   │   ├── create-book.dto.ts
│   │   │   └── update-book.dto.ts
│   │   └── entities/
│   │       └── book.entity.ts
│   │
│   ├── book-comments/                 # Комментарии к книгам (WebSocket)
│   │   ├── book-comments.module.ts
│   │   ├── book-comments.gateway.ts   # Socket.io gateway
│   │   ├── book-comments.service.ts
│   │   ├── dto/
│   │   │   └── create-book-comment.dto.ts
│   │   └── entities/
│   │       └── book-comment.entity.ts
│   │
│   └── shared/                        # Общие утилиты
│       ├── filters/
│       │   └── http-exception.filter.ts   # Глобальный обработчик ошибок
│       ├── interceptors/
│       │   ├── logging.interceptor.ts         # Логирование запросов
│       │   └── responseAdapter.interceptor.ts # Обёртка ответа
│       └── pipes/
│           ├── custom-validation.pipe.ts      # Валидация заголовков книг
│           └── not-empty-string.pipe.ts       # Проверка query-параметров
│
├── test/                              # E2E тесты
│   ├── app.e2e-spec.ts
│   ├── books.e2e-spec.ts
│   └── users.e2e-spec.ts
│
├── Dockerfile
├── docker-compose.yml
├── .env
└── package.json
```

---

## Модули и сервисы

### AuthModule

Отвечает за выдачу JWT-токенов. Использует Passport.js с `jwt`-стратегией.

- `AuthService.login(payload)` — создаёт токен со сроком действия 24 часа
- `JwtStrategy` — извлекает и валидирует токен из заголовка `Authorization: Bearer <token>`

### UsersModule

Регистрация и вход пользователей.

- `UsersService.signup(dto)` — создаёт пользователя, хеширует пароль (bcrypt, 10 раундов)
- `UsersService.signin(dto)` — проверяет пароль и возвращает JWT-токен

Поля сущности `User`: `email` (уникальный), `firstName`, `password`, `createdAt`

### BooksModule

CRUD-ресурс для книг. Все маршруты защищены JWT-гвардом (`JwtAuthGuard`).

- `BooksService` — стандартный CRUD через Mongoose (`create`, `findAll`, `findOne`, `update`, `remove`)

Поля сущности `Book`: `title`, `author`, `pages`

### BookCommentsModule

Реальное время через Socket.io. Gateway слушает namespace `/comments`.

| Событие | Описание |
|---|---|
| `subscribeToBook` | Подписаться на комментарии книги |
| `unsubscribeFromBook` | Отписаться от книги |
| `addComment` | Добавить комментарий (транслируется подписчикам) |
| `getAllComments` | Получить все комментарии книги |

### Shared-утилиты

| Утилита | Поведение |
|---|---|
| `LoggingInterceptor` | Логирует каждый запрос с временем выполнения |
| `ResponseAdapterInterceptor` | Оборачивает успешные ответы: `{ status: 'success', data: ... }` |
| `HttpExceptionFilter` | Возвращает ошибки в формате `{ status: 'fail', data: { error, path }, code }` |
| `CustomValidatePipe` | Проверяет заголовок книги: длина 3–100 символов, запрещённые слова |
| `NotEmptyStringPipe` | Отклоняет пустые query-параметры |

---

## API

### Пользователи

| Метод | URL | Описание | Auth |
|---|---|---|---|
| POST | `/users/signup` | Регистрация | — |
| POST | `/users/signin` | Вход, получение токена | — |

**Пример регистрации:**

```json
POST /users/signup
{
  "email": "user@example.com",
  "firstName": "Иван",
  "lastName": "Иванов",
  "password": "secret123"
}
```

**Пример входа:**

```json
POST /users/signin
{
  "email": "user@example.com",
  "password": "secret123"
}

// Ответ:
{
  "status": "success",
  "data": { "access_token": "eyJ..." }
}
```

### Книги

| Метод | URL | Описание | Auth |
|---|---|---|---|
| POST | `/books` | Создать книгу | JWT |
| GET | `/books` | Список всех книг | JWT |
| GET | `/books/get/:id` | Получить книгу по ID | JWT |
| PATCH | `/books/:id` | Обновить книгу | JWT |
| DELETE | `/books/:id` | Удалить книгу | JWT |

Передавайте токен в заголовке: `Authorization: Bearer <access_token>`

### Health-check

```
GET /  →  Hello World!
```

---

## WebSocket

Подключение: `ws://localhost:3000/comments`

```js
import { io } from 'socket.io-client';

const socket = io('http://localhost:3000/comments');

// Подписаться на комментарии книги
socket.emit('subscribeToBook', { bookId: '<id>' });

// Добавить комментарий
socket.emit('addComment', { bookId: '<id>', comment: 'Отличная книга!' });

// Получить все комментарии
socket.emit('getAllComments', { bookId: '<id>' });
```

---

## Переменные окружения

Создайте файл `.env` в корне проекта:

```env
# Строка подключения к MongoDB
DB_URI=mongodb://root:root@localhost:27017/?authSource=admin

# Порт приложения
PORT=3000

# Секрет для подписи JWT (замените на безопасное значение)
MY_SECRET_JWT_KEY=your-secret-key
```

---

## Запуск локально

### Требования

- Node.js >= 20
- Yarn
- MongoDB (локально или через Docker)

### Установка зависимостей

```bash
yarn install
```

### Запуск в режиме разработки

```bash
yarn start:dev
```

Приложение доступно по адресу: `http://localhost:3000`

### Сборка и запуск продакшн-версии

```bash
yarn build
yarn start:prod
```

---

## Запуск через Docker

Docker Compose поднимает три контейнера: **приложение**, **MongoDB** и **Mongo Express** (веб-интерфейс БД).

```bash
docker compose up --build
```

| Сервис | URL |
|---|---|
| NestJS API | http://localhost:3000 |
| Mongo Express | http://localhost:8081 |
| MongoDB | localhost:27017 |

Учётные данные Mongo Express: `mongoexpressuser` / `mongoexpresspass`

Остановить:

```bash
docker compose down
```

---

## Тесты

```bash
# Юнит-тесты
yarn test

# Юнит-тесты в режиме наблюдения
yarn test:watch

# Покрытие кода
yarn test:cov

# E2E-тесты
yarn test:e2e
```
