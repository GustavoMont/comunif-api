import { registerDecorator, ValidationOptions } from 'class-validator';

export function IsNaN(validationOptions?: ValidationOptions) {
  return function (object: any, propertyName: string) {
    registerDecorator({
      name: "It's a code",
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: string) {
          return !isNaN(+value);
        },
      },
    });
  };
}
