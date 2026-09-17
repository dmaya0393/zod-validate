import { z } from "zod";

import type { ValidationResult } from "./types.js";
import { validateFieldEngine, validateObjectEngine } from "./engine.js";

export const createValidator = <S extends z.ZodType>(schema: S) => {
  const fieldValidator =
    schema instanceof z.ZodObject ? validateFieldEngine(schema) : undefined;

  return {
    validate(data: unknown): ValidationResult<z.infer<S>> {
      return validateObjectEngine(schema, data);
    },

    validateField(field: string | keyof z.infer<S>, value: unknown) {
      if (!fieldValidator)
        throw new Error(
          "validateField() can only be used with a Zod object schema.",
        );

      return fieldValidator(field as string, value);
    },
  };
};
