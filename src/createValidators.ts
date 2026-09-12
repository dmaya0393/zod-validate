import { z } from "zod";

import type { ValidationResult } from "./types.js";
import { validateFieldEngine, validateObjectEngine } from "./engine.js";

export const createValidator = <S extends z.ZodType>(schema: S) => {
  const validateField =
    schema instanceof z.ZodObject ? validateFieldEngine(schema) : undefined;

  return {
    validate(data: unknown): ValidationResult<z.infer<S>> {
      return validateObjectEngine(schema, data);
    },

    validateField<K extends keyof z.infer<S>>(
      field: K,
      value: unknown,
    ): ValidationResult<z.infer<S>[K]> {
      if (!validateField)
        throw new Error(
          "validateField() can only be used with a Zod object schema.",
        );

      return validateField(field, value);
    },
  };
};
