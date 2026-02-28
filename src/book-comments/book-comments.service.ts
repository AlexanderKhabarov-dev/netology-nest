import { Injectable } from '@nestjs/common';
import {
  BookComment,
  BookCommentDocument,
} from './entities/book-comment.entity';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateBookCommentDto } from './dto/create-book-comment.dto';

@Injectable()
export class BookCommentsService {
  constructor(
    @InjectModel(BookComment.name)
    private bookCommentModel: Model<BookCommentDocument>,
  ) {}

  async addComment(dto: CreateBookCommentDto): Promise<BookComment> {
    return this.bookCommentModel.create(dto);
  }

  async getAllComments(bookId: string): Promise<BookComment[]> {
    return this.bookCommentModel.find({ bookId }).exec();
  }
}
