import { z } from "zod";

export const parseFieldPath = (field: string): Array<string | number> => {
  const normalized = field.replace(/\[(\d+)\]/g, ".$1");

  return normalized
    .split(".")
    .filter(Boolean)
    .map((segment) => (/^\d+$/.test(segment) ? Number(segment) : segment));
};
export const setErrorAtPath = (
  errors: Record<string, any>,
  path: Array<string | number>,
  message: string,
): void => {
  let current = errors;

  for (let i = 0; i < path.length; i++) {
    const key = path[i]!;
    const isLast = i === path.length - 1;

    if (isLast) {
      if (current[key] === undefined) current[key] = message;
      continue;
    }

    const nextKey = path[i + 1]!;
    if (!current[key] || typeof current[key] !== "object") {
      current[key] = typeof nextKey === "number" ? [] : {};
    }

    current = current[key];
  }
};

export const resolveSchemaAtPath = (
  schema: z.ZodType,
  path: Array<string | number>,
): z.ZodType | undefined => {
  let current: z.ZodType | undefined = schema;

  for (const segment of path) {
    if (current instanceof z.ZodObject) {
      if (typeof segment !== "string") return undefined;
      const next = current.shape[segment];
      if (!next) return undefined;
      current = next as z.ZodType;
      continue;
    }

    if (current instanceof z.ZodArray) {
      if (typeof segment !== "number") return undefined;
      current = current.element as z.ZodType;
      continue;
    }

    if (
      current instanceof z.ZodOptional ||
      current instanceof z.ZodNullable ||
      current instanceof z.ZodDefault
    ) {
      current = current.unwrap() as z.ZodType;
      continue;
    }

    return undefined;
  }

  return current;
};
