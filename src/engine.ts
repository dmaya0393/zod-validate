import { z } from "zod";
import type { FieldValidationResult, ValidationResult } from "./types.js";

export const validateWithTypeTransformation = <S extends z.ZodType>(
  schema: S,
  data: unknown,
): ValidationResult<z.infer<S>> => {
  const result = schema.safeParse(data);

  if (result.success) {
    return {
      valid: true,
      data: result.data,
    };
  }

  const errors: any = {};

  for (const issue of result.error.issues) {
    let current = errors;
    const path = issue.path;

    for (let i = 0; i < path.length; i++) {
      const key = path[i]!;
      const isLast = i === path.length - 1;

      if (isLast) {
        current[key] = issue.message;
      } else {
        if (!current[key] || typeof current[key] !== "object") {
          current[key] = typeof path[i + 1] === "number" ? [] : {};
        }

        current = current[key];
      }
    }
  }

  return {
    valid: false,
    errors,
  };
};

export const validateFieldEngine = <T extends z.ZodObject<any>>(schema: T) => {
  const shape = schema.shape;

  return <K extends keyof z.infer<T>>(
    field: K,
    value: unknown,
  ): FieldValidationResult<z.infer<T>[K]> => {
    const result = shape[field].safeParse(value);

    if (result.success) {
      return {
        valid: true,
        data: result.data,
      };
    }

    const error = result.error.issues[0];

    return {
      valid: false,
      errors: {
        [String(field)]: error?.message ?? "validation_error",
      },
    };
  };
};
