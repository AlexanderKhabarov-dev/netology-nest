import { IsString, IsNotEmpty, IsNumber, IsOptional } from 'class-validator';
import { IsBookTitleValid } from 'src/shared/pipes/custom-validation.pipe';

export class CreateBookDto {
  @IsString()
  @IsNotEmpty()
  @IsBookTitleValid()
  readonly title: string;

  @IsString()
  @IsOptional()
  readonly author: string;

  @IsNumber()
  @IsOptional()
  readonly pages: number;
}
