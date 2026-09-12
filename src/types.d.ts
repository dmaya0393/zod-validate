import type { z } from "zod";

export type ValidationErrors = {
  [key: string]: string | ValidationErrors | ValidationErrors[];
};

export type ValidationSuccess<T> = { valid: true; data: T };
export type ValidationFailure = { valid: false; errors: ValidationErrors };
export type ValidationResult<T> = ValidationSuccess<T> | ValidationFailure;

export type ValidationMessageMap = Record<string, string>;

export type ValidationMessages =
  | ValidationMessageMap
  | Record<string, ValidationMessageMap>;
