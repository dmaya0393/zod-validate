# zod-validate

Reusable validation utilities built on top of [Zod](https://zod.dev/) for frontend and backend applications.

`zod-validate` provides a small layer around Zod's `safeParse()` API so you can create a reusable validator from a schema and use the same validator for:

- Whole-form validation
- Individual field validation
- Nested object validation
- Nested array validation
- Validation error codes
- Human-readable message resolution
- Localized validation messages

The package does **not** replace Zod. Zod remains the validation engine.

---

## Installation

```bash
npm install zod-validate zod
```

---

## Why zod-validate?

Zod already provides excellent schema validation.

The problem is usually what happens **around** the schema.

For example, an application may need to:

- Validate an entire form.
- Validate one field while the user is typing.
- Keep validation errors associated with their original fields.
- Handle deeply nested objects and arrays.
- Return stable validation codes instead of UI-specific messages.
- Resolve those codes into different languages on the frontend.

`zod-validate` provides a small, consistent API for those tasks.

Instead of repeatedly working directly with Zod's `safeParse()` result, create a validator once:

```ts
const signup = createValidator(signupSchema);
```

Then use it wherever needed:

```ts
signup.validate(data);
signup.validateField("mobile_no", value);
```

---

# Basic Usage

## 1. Define a Zod schema

You continue to define your validation rules using Zod.

```ts
import { z } from "zod";

const signupSchema = z.object({
  mobile_no: z
    .string("mobile_no")
    .trim()
    .min(1, "mobile_no_required")
    .regex(/^[0-9]+$/, "mobile_no_digits")
    .regex(/^(98|97)/, "mobile_no_prefix")
    .length(10, "mobile_no_length"),

  password: z.string("password").min(8, "password_min_length"),
});
```

The validation codes are supplied as Zod messages:

```ts
"mobile_no_required";
"mobile_no_digits";
"mobile_no_prefix";
"mobile_no_length";
"password_min_length";
```

These codes can later be converted into human-readable messages.

---

# 2. Create a Validator

Import `createValidator`:

```ts
import { createValidator } from "zod-validate";
```

Create a validator from your schema:

```ts
const signup = createValidator(signupSchema);
```

The validator is now tied to that schema.

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

---

## Invalid data

```ts
const result = signup.validate({
  mobile_no: "",
  password: "123",
});
```

The result is:

```ts
{
  valid: false,
  errors: {
    mobile_no: "mobile_no_required",
    password: "password_min_length"
  }
}
```

The validator returns the validation codes rather than forcing a human-readable message into your validation layer.

---

# 4. Type-Safe Result Handling

The result is a discriminated union.

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

# 5. Validate a Single Field

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
    mobile_no: "mobile_no_digits"
  }
}
```

This makes the same schema useful for both:

```text
Whole form validation
        +
Individual field validation
```

---

# 6. Why Field Validation Is Useful

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

# 7. Nested Objects

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
  name: "Bibek",
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

This is useful because the error structure follows the same hierarchy as the data.

---

# 8. Nested Arrays

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

# 9. Using Nested Errors in React

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
<input />;

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

# 10. Sparse Array Errors

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

# 11. Validation Codes

A major part of the design is that the validation layer can return stable codes.

For example:

```ts
const result = signup.validate(data);
```

may produce:

```ts
{
  valid: false,
  errors: {
    mobile_no: "mobile_no_required",
    password: "password_min_length"
  }
}
```

The validation layer doesn't need to know how these errors should be displayed.

This allows the application to decide what each code means.

For example:

```ts
const messages = {
  mobile_no_required: "Mobile number is required.",
  password_min_length: "Password must be at least 8 characters.",
};
```

---

# 12. Resolve Validation Messages

Import:

```ts
import { resolveValidationMessages } from "zod-validate";
```

Then:

```ts
const resolvedErrors = resolveValidationMessages(result.errors, messages);
```

Given:

```ts
const errors = {
  mobile_no: "mobile_no_required",
  password: "password_min_length",
};
```

and:

```ts
const messages = {
  mobile_no_required: "Mobile number is required.",
  password_min_length: "Password must be at least 8 characters.",
};
```

the result is:

```ts
{
  mobile_no: "Mobile number is required.",
  password: "Password must be at least 8 characters."
}
```

---

# 13. Missing Message Codes

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

The known message is resolved:

```ts
{
  mobile_no: "Mobile number is required.",
  password: "password_min_length"
}
```

An unknown code falls back to the original code.

This means missing translations do not silently disappear.

---

# 14. Localized Messages

Messages can also be provided by locale.

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

# 15. Default Locale

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

---

# 16. Plain Messages

Localization is optional.

You can simply use:

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

# 17. Locale Configuration Validation

The resolver validates the message configuration.

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

# 18. Frontend Use Case

A React form can use the library in two stages.

### During field interaction

```ts
const result = signup.validateField("mobile_no", mobileNo);

if (!result.valid) {
  setErrors(result.errors);
}
```

### During submission

```ts
const result = signup.validate(formData);

if (!result.valid) {
  const errors = resolveValidationMessages(result.errors, messages);

  setErrors(errors);
  return;
}

submitForm(result.data);
```

This gives the frontend:

```text
Zod schema
```
