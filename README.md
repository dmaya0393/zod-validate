# zod-validate

Reusable validation utilities built on top of [Zod](https://zod.dev/) for frontend and backend applications.

`zod-validate` provides a small layer around Zod's `safeParse()` API so you can create a reusable validator from a schema and use the same validator for:

- Whole-form validation
- Individual field validation
- Deeply nested field validation
- Nested object validation
- Nested array validation
- Structured validation errors
- Optional validation error codes
- Optional human-readable message resolution
- Localized validation messages

The package does **not** replace Zod. Zod remains the validation engine.

---

## Recent Update

The next release, `v1.1.3`, adds support for validating a nested field directly without forcing a whole-form validation pass.

Examples:

- `users.0.mobile_no`
- `users[0].password`
- `profile.address.city`

This is useful when a form library wants to validate one field at a time while the user is editing, while still keeping full-form validation available for submit-time checks.

## Update Log

### v1.2.0

- Added support for deep nested field validation for object and array paths
- Added bracket-path support such as `users[0].password`
- Improved nested error mapping so field-level errors retain the original path structure
- Kept full-form validation available for submit-time checks
- Updated compatibility patterns to align with the current Zod v4 API

### v1.1.2

- Published the reusable validation utility for whole-form and direct field validation
- Added nested object and array error support
- Added message resolution and localization utilities

### v1.1.1

- Improved validation result consistency
- Added more regression coverage for field-level validation
- Refined the public validation API behavior

### v1.1.0

- Added reusable validator creation via `createValidator()`
- Added direct field validation for object schemas
- Added message resolution utilities for code-based validation flows

### v1.0.0

- Initial release
- Added whole-form validation with structured nested errors
- Added optional message resolution and localization support

---

## Installation

```bash
npm install zod-validate
```

You continue to use Zod to define your schemas:

```ts
import { z } from "zod";
```

---

# Basic Usage

## 1. Define a Zod schema

You define your validation rules using Zod as usual.

For example:

```ts
import { z } from "zod";

const signupSchema = z.object({
  mobile_no: z
    .string()
    .trim()
    .min(1, "Mobile number is required.")
    .regex(/^[0-9]+$/, "Mobile number must contain only digits.")
    .regex(/^(98|97)/, "Mobile number must start with 98 or 97.")
    .length(10, "Mobile number must be exactly 10 digits."),

  password: z.string().min(8, "Password must be at least 8 characters."),
});
```

Zod messages are returned by `zod-validate` exactly as provided by the schema.

---

## 2. Create a Validator

Import `createValidator`:

```ts
import { createValidator } from "zod-validate";
```

Create a validator from your schema:

```ts
const signup = createValidator(signupSchema);
```

The validator is now tied to that schema and can be reused wherever the schema needs to be validated.

---

# 3. Validate an Entire Object

Pass your data to `validate()`:

```ts
const result = signup.validate({
  mobile_no: "9812345678",
  password: "password123",
});
```

If the data is valid:

```ts
{
  valid: true,
  data: {
    mobile_no: "9812345678",
    password: "password123"
  }
}
```

The returned `data` is the data parsed by Zod.

This means Zod transformations are also preserved.

For example:

```ts
const schema = z.object({
  name: z.string().trim(),
});
```

If the input is:

```ts
{
  name: "  John Doe  ";
}
```

the successful result contains the transformed value:

```ts
{
  valid: true,
  data: {
    name: "John Doe"
  }
}
```

---

# 4. Validate a Nested Field Directly

You can now validate a nested path without validating the whole form:

```ts
const nestedSchema = z.object({
  users: z.array(
    z.object({
      mobile_no: z.string().regex(/^[0-9]+$/, "mobile_no_digits"),
      password: z.string().min(8, "password_length"),
    }),
  ),
});

const nested = createValidator(nestedSchema);

const result = nested.validateField("users.0.mobile_no", "abc");
```

Result:

```ts
{
  valid: false,
  errors: {
    users: [
      {
        mobile_no: "mobile_no_digits",
      },
    ],
  },
}
```

This is especially useful for form libraries that validate one field at a time while the user is typing.

---

# 5. Invalid Data

Suppose the data is invalid:

```ts
const result = signup.validate({
  mobile_no: "",
  password: "123",
});
```

Because the schema contains human-readable messages, the result is:

```ts
{
  valid: false,
  errors: {
    mobile_no: "Mobile number is required.",
    password: "Password must be at least 8 characters."
  }
}
```

The errors remain associated with their original fields.

You can use them directly:

```ts
if (!result.valid) {
  console.log(result.errors.mobile_no);
}
```

Output:

```text
Mobile number is required.
```

No additional message resolution is required.

---

# Validation Messages

There are two ways to provide messages in your Zod schemas.

## Direct Messages

The simplest approach is to put the human-readable message directly in the schema:

```ts
const signupSchema = z.object({
  mobile_no: z.string().min(1, "Mobile number is required."),
  password: z.string().min(8, "Password must be at least 8 characters."),
});
```

Then:

```ts
const result = signup.validate({
  mobile_no: "",
  password: "123",
});
```

returns:

```ts
{
  valid: false,
  errors: {
    mobile_no: "Mobile number is required.",
    password: "Password must be at least 8 characters."
  }
}
```

You can use these messages directly:

```ts
if (!result.valid) {
  setErrors(result.errors);
}
```

This approach is useful when your validation messages are simple and do not need to be managed separately.

---

# Validation Codes

For larger applications, you may prefer to keep validation rules separate from human-readable messages.

Instead of putting the final message in the schema, use a stable validation code:

```ts
const signupSchema = z.object({
  mobile_no: z
    .string()
    .min(1, "mobile_no_required")
    .regex(/^[0-9]+$/, "mobile_no_digits")
    .length(10, "mobile_no_length"),

  password: z.string().min(8, "password_min_length"),
});
```

The validator then returns those codes:

```ts
{
  valid: false,
  errors: {
    mobile_no: "mobile_no_required",
    password: "password_min_length"
  }
}
```

The validation layer does not need to know how those codes should be displayed.

Your application can decide what each code means.

For example:

```ts
const messages = {
  mobile_no_required: "Mobile number is required.",
  mobile_no_digits: "Mobile number must contain only digits.",
  mobile_no_length: "Mobile number must be exactly 10 digits.",
  password_min_length: "Password must be at least 8 characters.",
};
```

This approach becomes particularly useful when messages need to be:

- Centralized
- Reused
- Changed independently from validation rules
- Localized
- Shared between different parts of an application

---

# Resolving Validation Messages

`resolveValidationMessages()` is an optional utility for applications that use validation codes.

Import it:

```ts
import { resolveValidationMessages } from "zod-validate";
```

Given validation errors:

```ts
const errors = {
  mobile_no: "mobile_no_required",
  password: "password_min_length",
};
```

and a message map:

```ts
const messages = {
  mobile_no_required: "Mobile number is required.",
  password_min_length: "Password must be at least 8 characters.",
};
```

resolve the codes:

```ts
const resolvedErrors = resolveValidationMessages(errors, messages);
```

The result is:

```ts
{
  mobile_no: "Mobile number is required.",
  password: "Password must be at least 8 characters."
}
```

The structure of the errors is preserved.

For example:

```ts
{
  user: {
    email: "email_invalid";
  }
}
```

can become:

```ts
{
  user: {
    email: "Invalid email address.";
  }
}
```

You do **not** need to use `resolveValidationMessages()` when your Zod schema already contains human-readable messages.

It is an optional layer for applications that choose to use validation codes.

---

# Missing Message Codes

A message does not have to exist for every validation code.

For example:

```ts
const errors = {
  mobile_no: "mobile_no_required",
  password: "password_min_length",
};

const messages = {
  mobile_no_required: "Mobile number is required.",
};
```

Resolving the messages produces:

```ts
{
  mobile_no: "Mobile number is required.",
  password: "password_min_length"
}
```

Known codes are resolved.

Unknown codes fall back to the original code.

This means missing messages do not silently disappear.

---

# Localized Validation Messages

Validation codes can also be resolved using localized message maps.

For example:

```ts
const messages = {
  en: {
    mobile_no_required: "Mobile number is required.",
    password_min_length: "Password must be at least 8 characters.",
  },

  np: {
    mobile_no_required: "मोबाइल नम्बर आवश्यक छ।",
    password_min_length: "पासवर्ड कम्तीमा ८ अक्षरको हुनुपर्छ।",
  },
};
```

Resolve English messages:

```ts
const errors = resolveValidationMessages(
  validationResult.errors,
  messages,
  "en",
);
```

Result:

```ts
{
  mobile_no: "Mobile number is required.",
  password: "Password must be at least 8 characters."
}
```

Resolve Nepali messages:

```ts
const errors = resolveValidationMessages(
  validationResult.errors,
  messages,
  "np",
);
```

Result:

```ts
{
  mobile_no: "मोबाइल नम्बर आवश्यक छ।",
  password: "पासवर्ड कम्तीमा ८ अक्षरको हुनुपर्छ।"
}
```

---

# Default Locale

If no locale is supplied and the message configuration is localized, `en` is preferred when available.

For example:

```ts
const messages = {
  en: {
    required: "This field is required.",
  },

  np: {
    required: "यो field आवश्यक छ।",
  },
};
```

Then:

```ts
resolveValidationMessages(errors, messages);
```

uses the English messages.

If `en` does not exist, the first available locale is used.
You can always explicitly choose a locale:

```ts
resolveValidationMessages(errors, messages, "np");
```

---

# Plain Message Maps

Localization is optional.

You can provide a normal message map:

```ts
const messages = {
  required: "This field is required.",
  invalid_email: "Invalid email address.",
};
```

Then:

```ts
resolveValidationMessages(errors, messages);
```

No locale is required.

---

# 5. Type-Safe Result Handling

The result returned by `createValidator()` is a discriminated union.

```ts
const result = signup.validate(data);

if (result.valid) {
  console.log(result.data);
} else {
  console.log(result.errors);
}
```

TypeScript understands that:

```ts
result.valid === true;
```

means `result.data` is available.

And:

```ts
result.valid === false;
```

means `result.errors` is available.

---

# 6. Validate a Single Field

For frontend forms, you often don't want to validate the entire form.

For example, while the user is entering their mobile number:

```ts
const result = signup.validateField("mobile_no", "9812345678");
```

If valid:

```ts
{
  valid: true,
  data: "9812345678"
}
```

If invalid:

```ts
const result = signup.validateField("mobile_no", "abc");
```

You get:

```ts
{
  valid: false,
  errors: {
    mobile_no: "Mobile number must contain only digits."
  }
}
```

If your schema uses validation codes instead:

```ts
{
  valid: false,
  errors: {
    mobile_no: "mobile_no_digits"
  }
}
```

The same schema can therefore be used for both whole-form and individual-field validation.

---

# 7. Why Field Validation Is Useful

A frontend form might use the validator like this:

```ts
const result = signup.validateField("mobile_no", mobileNo);

if (!result.valid) {
  setMobileError(result.errors.mobile_no);
}
```

Then when the entire form is submitted:

```ts
const result = signup.validate(formData);

if (!result.valid) {
  setErrors(result.errors);
}
```

You don't need a separate schema for field validation.

The same Zod schema is used for both operations.

---

# 8. Nested Objects

`zod-validate` preserves the structure of nested validation errors.

Consider:

```ts
const userSchema = z.object({
  name: z.string("name_required"),

  address: z.object({
    city: z.string("city_required"),
    street: z.string("street_required"),
  }),
});
```

Create the validator:

```ts
const userValidator = createValidator(userSchema);
```

Validate:

```ts
const result = userValidator.validate({
  name: "John Doe",

  address: {
    city: "",
    street: "",
  },
});
```

The errors mirror the input structure:

```ts
{
  valid: false,
  errors: {
    address: {
      city: "city_required",
      street: "street_required"
    }
  }
}
```

The same structure is preserved when using direct messages:

```ts
const userSchema = z.object({
  name: z.string("Name is required."),

  address: z.object({
    city: z.string("City is required."),
    street: z.string("Street is required."),
  }),
});
```

The resulting errors are:

```ts
{
  valid: false,
  errors: {
    address: {
      city: "City is required.",
      street: "Street is required."
    }
  }
}
```

This is useful because the error structure follows the same hierarchy as the data.

---

# 9. Nested Arrays

Arrays are also preserved.

For example:

```ts
const buildingSchema = z.object({
  name: z.string("building_name_required"),

  floors: z.array(
    z.object({
      floor_number: z.number("floor_number_required"),

      name: z.string("floor_name_required"),

      units: z.array(
        z.object({
          unit_number: z.string("unit_number_required"),
          rent: z.number("rent_required"),
        }),
      ),
    }),
  ),
});
```

Create the validator:

```ts
const buildingValidator = createValidator(buildingSchema);
```

Suppose the second floor contains invalid data:

```ts
const result = buildingValidator.validate({
  name: "Sunrise Apartments",

  floors: [
    {
      floor_number: 1,
      name: "Ground Floor",

      units: [
        {
          unit_number: "101",
          rent: 15000,
        },
      ],
    },

    {
      floor_number: 2,
      name: "",

      units: [
        {
          unit_number: "",
          rent: -5000,
        },
      ],
    },
  ],
});
```

The resulting errors follow the same structure:

```ts
{
  valid: false,
  errors: {
    floors: [
      <empty>,
      {
        name: "floor_name_required",

        units: [
          {
            unit_number: "unit_number_required",
            rent: "rent_required"
          }
        ]
      }
    ]
  }
}
```

The error at:

```ts
errors.floors[1].name;
```

belongs to:

```ts
floors[1].name;
```

And:

```ts
errors.floors[1].units[0].rent;
```

belongs to:

```ts
floors[1].units[0].rent;
```

The structure is intentionally aligned with the original data.

---

# 10. Using Nested Errors in React

This structure works naturally with component hierarchies.

For example:

```tsx
<Building errors={errors} />
```

The building component can pass the appropriate floor errors:

```tsx
<Floors errors={errors.floors?.[floorIndex]} />
```

The floor component can pass errors to a unit:

```tsx
<Unit errors={errors?.units?.[unitIndex]} />
```

And the unit component can access:

```tsx
errors?.rent;
```

For example:

```tsx
{
  errors?.rent && <p>{errors.rent}</p>;
}
```

This works because the validation error structure follows the data structure.

You don't need to convert:

```text
floors[1].units[0].rent
```

into a flat string just to find the error.

---

# 11. Sparse Array Errors

When only some array items contain errors, the resulting error array can contain empty slots.

For example:

```ts
[
  <empty>,

  {
    name: "floor_name_required"
  }
]
```

The empty slot represents an array item that has no validation error.

Therefore:

```ts
errors.floors?.[0];
```

returns:

```ts
undefined;
```

while:

```ts
errors.floors?.[1];
```

contains the second floor's errors.

This allows the error array to preserve the original data indexes.

---

# 12. Choosing Between Messages and Codes

Both approaches are supported.

### Use direct messages when:

- Your messages are simple.
- You don't need localization.
- You want the schema to contain the final message.
- You want to use `result.errors` directly.

Example:

```ts
z.string().min(1, "Name is required.");
```

Result:

```ts
{
  name: "Name is required.";
}
```

### Use validation codes when:

- Messages need to be centralized.
- Multiple parts of the application share the same messages.
- Messages need to be localized.
- You want to change wording without changing validation rules.
- The validation layer should return stable identifiers rather than UI text.

Example:

```ts
z.string().min(1, "name_required");
```

Result:

```ts
{
  name: "name_required";
}
```

Then resolve it:

```ts
resolveValidationMessages(errors, messages);
```

There is no requirement to use validation codes.

There is also no requirement to use `resolveValidationMessages()`.

---

# 13. Locale Configuration Validation

`resolveValidationMessages()` validates the message configuration it receives.

A plain message map must contain string messages:

```ts
const messages = {
  required: "This field is required.",
  invalid: "Invalid value.",
};
```

A localized message map must contain message maps:

```ts
const messages = {
  en: {
    required: "This field is required.",
  },

  np: {
    required: "यो field आवश्यक छ।",
  },
};
```

Invalid message values are rejected instead of being silently accepted.

For example:

```ts
const messages = {
  en: {
    required: 123,
  },
};
```

is invalid because validation messages must be strings.

---

# 14. Frontend Use Case

A React form can use the library without requiring message resolution.

## During field interaction

If your schema uses direct messages:

```ts
const result = signup.validateField("mobile_no", mobileNo);

if (!result.valid) {
  setMobileError(result.errors.mobile_no);
}
```

The error can be displayed immediately.

If your schema uses validation codes:

```ts
const result = signup.validateField("mobile_no", mobileNo);

if (!result.valid) {
  setMobileError(result.errors.mobile_no);
}
```

the error will contain the code instead.

You can resolve it when appropriate:

```ts
const errors = resolveValidationMessages(result.errors, messages);
```

## During submission

With direct messages:

```ts
const result = signup.validate(formData);

if (!result.valid) {
  setErrors(result.errors);
  return;
}

submitForm(result.data);
```

With validation codes:

```ts
const result = signup.validate(formData);

if (!result.valid) {
  const errors = resolveValidationMessages(result.errors, messages);

  setErrors(errors);
  return;
}

submitForm(result.data);
```

This keeps the two approaches independent while allowing them to use the same validator.

---

# 15. Backend Use Case

The same validator can be used on the backend.

For example:

```ts
const result = signup.validate(req.body);

if (!result.valid) {
  return res.status(400).json({
    errors: result.errors,
  });
}
```

When using validation codes, the backend can return stable codes:

```json
{
  "errors": {
    "mobile_no": "mobile_no_required",
    "password": "password_min_length"
  }
}
```

The frontend can then decide how those codes should be displayed.

This allows the backend validation rules and frontend presentation to remain separate.

---

# 16. Zod Remains the Validation Engine

`zod-validate` does not replace Zod.

Your schemas are still Zod schemas:

```ts
const schema = z.object({
  name: z.string().min(1, "Name is required."),
});
```

Zod performs the actual validation.

`zod-validate` provides a reusable layer around the result:

```text
Zod schema
    ↓
Zod validation
    ↓
createValidator()
    ↓
Structured validation result
```

The package does not introduce another validation language or replace Zod's schema API.

---

# API Summary

## `createValidator(schema)`

Creates a reusable validator from a Zod schema.

```ts
const validator = createValidator(schema);
```

### `validator.validate(data)`

Validates the complete value.

```ts
const result = validator.validate(data);
```

Returns either:

```ts
{
  valid: true,
  data: parsedData
}
```

or:

```ts
{
  valid: false,
  errors: validationErrors
}
```

### `validator.validateField(field, value)`

Validates an individual field of a Zod object schema.

```ts
const result = validator.validateField("mobile_no", value);
```

Returns either:

```ts
{
  valid: true,
  data: parsedValue
}
```

or:

```ts
{
  valid: false,
  errors: {
    mobile_no: "validation message or code"
  }
}
```

---

## `resolveValidationMessages(errors, messages, locale?)`

Optionally resolves validation codes into human-readable messages.

```ts
const resolvedErrors = resolveValidationMessages(errors, messages);
```

For localized messages:

```ts
const resolvedErrors = resolveValidationMessages(errors, messages, "np");
```

This function is only needed when you choose to manage validation messages separately from your Zod schemas.

---

# Design Philosophy

`zod-validate` intentionally stays small.

It does not try to replace Zod or create a new validation system.

Instead, it focuses on a few useful problems around Zod validation:

- Reusable validators
- Whole-object validation
- Field-level validation
- Structured nested errors
- Preserving array indexes
- Optional validation codes
- Optional message resolution
- Optional localization

You can keep your schemas simple with direct messages:

```ts
z.string().min(1, "Name is required.");
```

or use stable validation codes when your application benefits from separating validation rules from presentation:

```ts
z.string().min(1, "name_required");
```

Both approaches work with the same validator.

---

# License

MIT
