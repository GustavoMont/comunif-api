import { registerDecorator, ValidationOptions } from 'class-validator';

export function MinAge(validationOptions?: ValidationOptions) {
  return function (object: any, propertyName: string) {
    registerDecorator({
      name: 'isOldEnough',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any) {
          const date = new Date(value);
          if (isNaN(date.getTime())) {
            return false;
          }
          const today = new Date();
          let age = today.getFullYear() - date.getFullYear();
          const monthDiff = today.getMonth() - date.getMonth();
          if (
            monthDiff < 0 ||
            (monthDiff === 0 && today.getDate() < date.getDate())
          ) {
            age--;
          }
          return age >= 15;
        },
      },
    });
  };
}
