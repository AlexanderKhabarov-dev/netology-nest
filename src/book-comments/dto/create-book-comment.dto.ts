import { IsString, IsNotEmpty, IsUUID } from 'class-validator';

export class CreateBookCommentDto {
  @IsUUID()
  @IsNotEmpty()
  readonly bookId: string;

  @IsString()
  @IsNotEmpty()
  readonly comment: string;
}
