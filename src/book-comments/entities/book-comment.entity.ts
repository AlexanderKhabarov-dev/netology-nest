import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type BookCommentDocument = BookComment & Document;

@Schema()
export class BookComment {
  @Prop({ required: true })
  bookId: string;

  @Prop({ required: true })
  comment: string;
}

export const BookCommentSchema = SchemaFactory.createForClass(BookComment);
