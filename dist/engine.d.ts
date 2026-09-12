import { z } from "zod";
import type { ValidationResult } from "./types.js";
export declare const validateObjectEngine: <S extends z.ZodType>(schema: S, data: unknown) => ValidationResult<z.infer<S>>;
export declare const validateFieldEngine: <T extends z.ZodObject<any>>(schema: T) => <K extends keyof z.infer<T>>(field: K, value: unknown) => ValidationResult<z.infer<T>[K]>;
//# sourceMappingURL=engine.d.ts.map