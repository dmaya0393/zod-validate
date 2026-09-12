import { z } from "zod";
import type { ValidationResult } from "./types.js";
export declare const createValidator: <S extends z.ZodType>(schema: S) => {
    validate(data: unknown): ValidationResult<z.infer<S>>;
    validateField<K extends keyof z.infer<S>>(field: K, value: unknown): ValidationResult<z.infer<S>[K]>;
};
//# sourceMappingURL=createValidators.d.ts.map