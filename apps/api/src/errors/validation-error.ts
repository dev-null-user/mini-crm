import type { ValidationResult } from '../validators';

type ValidationFailure = Extract<
  ValidationResult,
  { errors: unknown }
>;

export class ValidationError extends Error {
  public readonly issues: ValidationFailure['errors'];

  constructor({ errors }: ValidationFailure) {
    super('Ошибка валидации');

    this.name = 'ValidationError';
    this.issues = errors;
  }
}
