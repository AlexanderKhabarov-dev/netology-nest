import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
  registerDecorator,
  ValidationOptions,
} from 'class-validator';

@ValidatorConstraint({ name: 'isBookTitleValid', async: true })
export class CustomValidatePipe implements ValidatorConstraintInterface {
  validate(title: string): boolean {
    if (!title || title.trim().length < 3 || title.length > 100) {
      return false;
    }

    const forbiddenWords = ['spam', 'test', 'delete', 'admin'];
    return !forbiddenWords.some((word) => title.toLowerCase().includes(word));
  }

  defaultMessage(args: ValidationArguments): string {
    return `${args.property} содержит запрещённые слова или неверная длина (3-100)!`;
  }
}

export function IsBookTitleValid(validationOptions?: ValidationOptions) {
  return (object: object, propertyName: string) =>
    registerDecorator({
      name: 'isBookTitleValid',
      target: object.constructor,
      propertyName,
      options: validationOptions,
      constraints: [],
      validator: CustomValidatePipe,
    });
}
