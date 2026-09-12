import { z } from "zod";
export const validateObjectEngine = (schema, data) => {
    const result = schema.safeParse(data);
    if (result.success)
        return { valid: true, data: result.data };
    const errors = {};
    for (const issue of result.error.issues) {
        let current = errors;
        const path = issue.path;
        for (let i = 0; i < path.length; i++) {
            const key = path[i];
            const isLast = i === path.length - 1;
            if (isLast) {
                if (current[key] === undefined)
                    current[key] = issue.message;
            }
            else {
                if (!current[key] || typeof current[key] !== "object")
                    current[key] = typeof path[i + 1] === "number" ? [] : {};
                current = current[key];
            }
        }
    }
    return { valid: false, errors };
};
export const validateFieldEngine = (schema) => {
    const shape = schema.shape;
    return (field, value) => {
        const result = shape[field].safeParse(value);
        if (result.success)
            return { valid: true, data: result.data };
        const error = result.error.issues[0];
        return {
            valid: false,
            errors: { [String(field)]: error?.message ?? "validation_error" },
        };
    };
};
//# sourceMappingURL=engine.js.map