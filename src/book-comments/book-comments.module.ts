import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { BookCommentsService } from './book-comments.service';
import { BookCommentsGateway } from './book-comments.gateway';
import { BookComment, BookCommentSchema } from './entities/book-comment.entity';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: BookComment.name, schema: BookCommentSchema },
    ]),
  ],
  providers: [BookCommentsService, BookCommentsGateway],
  controllers: [],
})
export class BookCommentsModule {}
