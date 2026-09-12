import { z } from "zod";
import { validateFieldEngine, validateObjectEngine } from "./engine.js";
export const createValidator = (schema) => {
    const validateField = schema instanceof z.ZodObject ? validateFieldEngine(schema) : undefined;
    return {
        validate(data) {
            return validateObjectEngine(schema, data);
        },
        validateField(field, value) {
            if (!validateField)
                throw new Error("validateField() can only be used with a Zod object schema.");
            return validateField(field, value);
        },
    };
};
//# sourceMappingURL=createValidators.js.map