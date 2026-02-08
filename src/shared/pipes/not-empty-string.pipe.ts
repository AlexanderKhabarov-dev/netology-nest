import {
  Injectable,
  PipeTransform,
  ArgumentMetadata,
  BadRequestException,
} from '@nestjs/common';

@Injectable()
export class NotEmptyStringPipe implements PipeTransform<string, string> {
  transform(value: string | undefined, metadata: ArgumentMetadata): string {
    const targetType = metadata.type;

    if (targetType !== 'query') {
      return value ?? '';
    }

    if (!value || value.trim() === '') {
      throw new BadRequestException(
        `Параметр ${targetType} не может быть пустым`,
      );
    }

    return value.trim();
  }
}
