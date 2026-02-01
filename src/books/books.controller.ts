import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
  Query,
} from '@nestjs/common';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';
import { Book } from './entities/book.entity';
import { BooksService } from './books.service';
import { NotEmptyStringPipe } from 'src/pipes/not-empty-string.pipe';

@Controller('books')
export class BooksController {
  constructor(private readonly bookService: BooksService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createBookDto: CreateBookDto): Promise<Book> {
    return this.bookService.create(createBookDto);
  }

  @Get()
  findAll(): Promise<Book[]> {
    return this.bookService.findAll();
  }

  @Get('get/:id')
  findOne(@Param('id', NotEmptyStringPipe) id: string): Promise<Book> {
    return this.bookService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateBookDto: UpdateBookDto,
  ): Promise<Book> {
    return this.bookService.update(id, updateBookDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  remove(@Param('id') id: string) {
    return this.bookService.remove(id);
  }

  @Get('pipe')
  getTestPipeRaw(@Query('name', NotEmptyStringPipe) name: string) {
    return name;
  }

  // Тест HttpExceptionFilter
  // @Get('error/manual')
  // testManualError() {
  //   const someData: any = null;
  //   return someData.title;
  // }
}
