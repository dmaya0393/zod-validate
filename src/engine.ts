import { z } from "zod";
import type { ValidationResult } from "./types.js";
import {
  parseFieldPath,
  resolveSchemaAtPath,
  setErrorAtPath,
} from "./parser.js";

export const validateObjectEngine = <S extends z.ZodType>(
  schema: S,
  data: unknown,
): ValidationResult<z.infer<S>> => {
  const result = schema.safeParse(data);
  if (result.success) return { valid: true, data: result.data };

  const errors: any = {};

  for (const issue of result.error.issues) {
    const path = issue.path.filter(
      (segment): segment is string | number =>
        typeof segment === "string" || typeof segment === "number",
    );

    setErrorAtPath(errors, path, issue.message);
  }

  return { valid: false, errors };
};

export const validateFieldEngine = <T extends z.ZodObject<any>>(schema: T) => {
  return (
    field: string | keyof z.infer<T>,
    value: unknown,
  ): ValidationResult<unknown> => {
    const path =
      typeof field === "string" ? parseFieldPath(field) : [String(field)];
    const targetSchema = resolveSchemaAtPath(schema, path);

    if (!targetSchema)
      throw new Error(
        `Field path "${String(field)}" does not exist in the schema.`,
      );

    const result = targetSchema.safeParse(value);

    if (result.success) return { valid: true, data: result.data };

    const error = result.error.issues[0];
    const errors: Record<string, any> = {};
    setErrorAtPath(errors, path, error?.message ?? "validation_error");

    return {
      valid: false,
      errors,
    };
  };
};
