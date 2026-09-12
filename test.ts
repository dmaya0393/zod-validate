import { z } from "zod";
import { createValidator } from "./src/index.js";

const signupSchema = z.object({
  mobile_no: z
    .string("mobile_no")
    .trim()
    .min(1, "mobile_no")
    .regex(/^[0-9]+$/, "mobile_no_digits")
    .regex(/^(98|97)/, "mobile_no_prefix")
    .length(10, "mobile_no_length"),

  password: z
    .string("password")
    .trim()
    .min(1, "password")
    .min(8, "password_length")
    .max(32, "password_length")
    .regex(/[a-z]/, "password_lowercase")
    .regex(/[A-Z]/, "password_uppercase")
    .regex(/[0-9]/, "password_digit")
    .regex(/[!@#$%*]/, "password_special"),
});

const signup = createValidator(signupSchema);

console.log("\n--- FIELD VALIDATION ---");
console.log("mobile_no:", signup.validateField("mobile_no", "abc"));
console.log("mobile_no:", signup.validateField("mobile_no", "9812345678"));
console.log("password:", signup.validateField("password", "abc"));
console.log("password:", signup.validateField("password", "Password123!"));

console.log("\n--- WHOLE DATA VALIDATION ---");

console.log(
  "valid signup:",
  signup.validate({
    mobile_no: "9812345678",
    password: "Password123!",
  }),
);

console.log(
  "invalid signup:",
  signup.validate({
    mobile_no: "abc",
    password: "123",
  }),
);

console.log(
  "prefix error:",
  signup.validate({
    mobile_no: "9612345678",
    password: "Password123!",
  }),
);

console.log(
  "password errors:",
  signup.validate({
    mobile_no: "9812345678",
    password: "abc",
  }),
);
