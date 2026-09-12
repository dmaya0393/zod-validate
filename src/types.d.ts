import type { z } from "zod";

export type ValidationErrors = {
  [key: string]: string | ValidationErrors | ValidationErrors[];
};

export type ValidationSuccess<T> = {
  valid: true;
  data: T;
};

export type ValidationFailure = {
  valid: false;
  errors: ValidationErrors;
};

export type ValidationResult<T> = ValidationSuccess<T> | ValidationFailure;

export type FieldValidationResult<T> =
  | {
      valid: true;
      data: T;
    }
  | {
      valid: false;
      errors: ValidationErrors;
    };

export type Validator<S extends z.ZodType> = {
  validate(data: unknown): ValidationResult<z.infer<S>>;

  validateField(
    field: keyof z.infer<S>,
    value: unknown,
  ): FieldValidationResult<unknown>;
};
