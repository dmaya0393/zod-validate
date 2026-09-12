import { describe, expect, it } from "vitest";
import { z } from "zod";
import { createValidator } from "../src/index.js";

describe("createValidator", () => {
  const signupSchema = z.object({
    mobile_no: z
      .string("mobile_no")
      .min(1, "mobile_no")
      .regex(/^[0-9]+$/, "mobile_no_digits"),

    password: z.string("password").min(8, "password_length"),
  });

  const validator = createValidator(signupSchema);

  it("validates data successfully", () => {
    const result = validator.validate({
      mobile_no: "9812345678",
      password: "password123",
    });

    expect(result).toEqual({
      valid: true,
      data: {
        mobile_no: "9812345678",
        password: "password123",
      },
    });
  });

  it("returns validation errors", () => {
    const result = validator.validate({
      mobile_no: "abc",
      password: "123",
    });

    expect(result).toEqual({
      valid: false,
      errors: {
        mobile_no: "mobile_no_digits",
        password: "password_length",
      },
    });
  });

  it("validates an individual field", () => {
    const result = validator.validateField("mobile_no", "abc");

    expect(result).toEqual({
      valid: false,
      errors: {
        mobile_no: "mobile_no_digits",
      },
    });
  });

  it("returns transformed field data", () => {
    const schema = z.object({
      name: z.string().trim(),
    });

    const validator = createValidator(schema);

    const result = validator.validateField("name", "  Bibek  ");

    expect(result).toEqual({
      valid: true,
      data: "Bibek",
    });
  });
});
