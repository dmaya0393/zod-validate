import { describe, expect, it } from "vitest";

import { createValidator, resolveValidationMessages } from "../src/index.js";

import {
  arrayResolverErrors,
  deeplyNestedResolverErrors,
  incompleteLocalizedMessages,
  incompletePlainMessages,
  invalidFieldData,
  invalidMessages,
  invalidSignupData,
  localizedMessages,
  localizedMessagesWithoutEnglish,
  nestedResolverErrors,
  nestedSchema,
  plainMessages,
  resolverErrors,
  signupSchema,
  validFieldData,
  validSignupData,
} from "./fixtures.js";

describe("createValidator", () => {
  const signup = createValidator(signupSchema);

  describe("validate", () => {
    it("accepts valid form data", () => {
      const result = signup.validate(validSignupData);

      expect(result).toEqual({
        valid: true,
        data: validSignupData,
      });
    });

    it("rejects invalid form data", () => {
      const result = signup.validate(invalidSignupData);

      expect(result.valid).toBe(false);

      if (!result.valid) {
        expect(result.errors.mobile_no).toBe("mobile_no_digits");
        expect(result.errors.password).toBe("password_length");
      }
    });
  });

  describe("validateField", () => {
    it("accepts a valid mobile number", () => {
      const result = signup.validateField(
        "mobile_no",
        validFieldData.mobile_no,
      );

      expect(result).toEqual({
        valid: true,
        data: "9812345678",
      });
    });

    it("rejects an invalid mobile number", () => {
      const result = signup.validateField(
        "mobile_no",
        invalidFieldData.mobile_no,
      );

      expect(result).toEqual({
        valid: false,
        errors: {
          mobile_no: "mobile_no_digits",
        },
      });
    });

    it("accepts a valid password", () => {
      const result = signup.validateField("password", validFieldData.password);

      expect(result).toEqual({
        valid: true,
        data: "Password123!",
      });
    });

    it("rejects an invalid password", () => {
      const result = signup.validateField(
        "password",
        invalidFieldData.password,
      );

      expect(result).toEqual({
        valid: false,
        errors: {
          password: "password_length",
        },
      });
    });
  });
});

describe("resolveValidationMessages", () => {
  describe("plain message maps", () => {
    it("resolves a plain message map", () => {
      const result = resolveValidationMessages(
        resolverErrors.single,
        plainMessages,
      );

      expect(result).toEqual({
        mobile_no: "Mobile number is required.",
      });
    });

    it("resolves multiple validation codes", () => {
      const result = resolveValidationMessages(
        resolverErrors.multiple,
        plainMessages,
      );

      expect(result).toEqual({
        mobile_no: "Mobile number must contain only digits.",
        password: "Password must be between 8 and 32 characters.",
      });
    });

    it("falls back to the validation code when the message is missing", () => {
      const result = resolveValidationMessages(
        resolverErrors.unknownCode,
        incompletePlainMessages,
      );

      expect(result).toEqual({
        mobile_no: "unknown_validation_code",
      });
    });
  });

  describe("localized message maps", () => {
    it("uses English by default when English exists", () => {
      const result = resolveValidationMessages(
        resolverErrors.single,
        localizedMessages,
      );

      expect(result).toEqual({
        mobile_no: "Mobile number is required.",
      });
    });

    it("uses the requested locale", () => {
      const result = resolveValidationMessages(
        resolverErrors.single,
        localizedMessages,
        "np",
      );

      expect(result).toEqual({
        mobile_no: "मोबाइल नम्बर आवश्यक छ।",
      });
    });

    it("uses French when explicitly requested", () => {
      const result = resolveValidationMessages(
        resolverErrors.single,
        localizedMessages,
        "fr",
      );

      expect(result).toEqual({
        mobile_no: "Le numéro de téléphone est requis.",
      });
    });

    it("falls back to the first locale when English does not exist", () => {
      const result = resolveValidationMessages(
        resolverErrors.single,
        localizedMessagesWithoutEnglish,
      );

      expect(result).toEqual({
        mobile_no: "मोबाइल नम्बर आवश्यक छ।",
      });
    });

    it("falls back to the validation code when a localized code is missing", () => {
      const result = resolveValidationMessages(
        resolverErrors.unknownCode,
        incompleteLocalizedMessages,
        "np",
      );

      expect(result).toEqual({
        mobile_no: "unknown_validation_code",
      });
    });
  });

  describe("locale errors", () => {
    it("rejects a locale when plain messages are supplied", () => {
      expect(() =>
        resolveValidationMessages(resolverErrors.single, plainMessages, "np"),
      ).toThrow(
        'Locale "np" was provided, but the validation messages are not localized.',
      );
    });

    it("rejects an unknown locale", () => {
      expect(() =>
        resolveValidationMessages(
          resolverErrors.single,
          localizedMessages,
          "de",
        ),
      ).toThrow('Validation messages for locale "de" are not defined.');
    });
  });

  describe("invalid runtime message maps", () => {
    it("rejects a number message", () => {
      expect(() =>
        resolveValidationMessages(
          resolverErrors.single,
          invalidMessages.numberMessage,
        ),
      ).toThrow(
        'Validation message for locale "en" and code "mobile_no" must be a string. Received number.',
      );
    });

    it("rejects a boolean message", () => {
      expect(() =>
        resolveValidationMessages(
          resolverErrors.single,
          invalidMessages.booleanMessage,
        ),
      ).toThrow(
        'Validation message for locale "en" and code "mobile_no" must be a string. Received boolean.',
      );
    });

    it("rejects a null message", () => {
      expect(() =>
        resolveValidationMessages(
          resolverErrors.single,
          invalidMessages.nullMessage,
        ),
      ).toThrow(
        'Validation message for locale "en" and code "mobile_no" must be a string. Received object.',
      );
    });

    it("rejects an array message", () => {
      expect(() =>
        resolveValidationMessages(
          resolverErrors.single,
          invalidMessages.arrayMessage,
        ),
      ).toThrow(
        'Validation message for locale "en" and code "mobile_no" must be a string. Received object.',
      );
    });

    it("rejects an object message", () => {
      expect(() =>
        resolveValidationMessages(
          resolverErrors.single,
          invalidMessages.objectMessage,
        ),
      ).toThrow(
        'Validation message for locale "en" and code "mobile_no" must be a string. Received object.',
      );
    });

    // TODO: Decide how to handle ambiguous locale/message-map shapes
    // it("rejects a locale whose value is a string", () => {
    //   expect(() =>
    //     resolveValidationMessages(
    //       resolverErrors.single,
    //       invalidMessages.localeIsString,
    //     ),
    //   ).toThrow('Validation messages for locale "en" must be a message map.');
    // });

    it("rejects a locale whose value is a number", () => {
      expect(() =>
        resolveValidationMessages(
          resolverErrors.single,
          invalidMessages.localeIsNumber,
        ),
      ).toThrow('Validation messages for locale "en" must be a message map.');
    });

    it("rejects a locale whose value is null", () => {
      expect(() =>
        resolveValidationMessages(
          resolverErrors.single,
          invalidMessages.localeIsNull,
        ),
      ).toThrow('Validation messages for locale "en" must be a message map.');
    });

    it("rejects a locale whose value is an array", () => {
      expect(() =>
        resolveValidationMessages(
          resolverErrors.single,
          invalidMessages.localeIsArray,
        ),
      ).toThrow('Validation messages for locale "en" must be a message map.');
    });

    it("rejects a top-level string", () => {
      expect(() =>
        resolveValidationMessages(
          resolverErrors.single,
          invalidMessages.topLevelString,
        ),
      ).toThrow();
    });

    it("rejects a top-level number", () => {
      expect(() =>
        resolveValidationMessages(
          resolverErrors.single,
          invalidMessages.topLevelNumber,
        ),
      ).toThrow();
    });

    it("rejects a top-level boolean", () => {
      expect(() =>
        resolveValidationMessages(
          resolverErrors.single,
          invalidMessages.topLevelBoolean,
        ),
      ).toThrow();
    });

    it("rejects a top-level null", () => {
      expect(() =>
        resolveValidationMessages(
          resolverErrors.single,
          invalidMessages.topLevelNull,
        ),
      ).toThrow();
    });

    it("rejects a top-level array", () => {
      expect(() =>
        resolveValidationMessages(
          resolverErrors.single,
          invalidMessages.topLevelArray,
        ),
      ).toThrow();
    });

    it("rejects an empty message object", () => {
      expect(() =>
        resolveValidationMessages(
          resolverErrors.single,
          invalidMessages.emptyObject,
        ),
      ).toThrow();
    });

    it("rejects an empty localized message map", () => {
      expect(() =>
        resolveValidationMessages(
          resolverErrors.single,
          invalidMessages.emptyLocalizedMap,
        ),
      ).toThrow();
    });

    it("rejects multiple empty locales", () => {
      expect(() =>
        resolveValidationMessages(
          resolverErrors.single,
          invalidMessages.multipleEmptyLocales,
        ),
      ).toThrow();
    });
  });

  describe("nested errors", () => {
    it("resolves nested object errors", () => {
      const result = resolveValidationMessages(
        nestedResolverErrors,
        plainMessages,
      );

      expect(result).toEqual({
        user: {
          mobile_no: "Mobile number must contain only digits.",
          password: "Password must be between 8 and 32 characters.",
        },
      });
    });

    it("resolves errors inside arrays", () => {
      const result = resolveValidationMessages(
        arrayResolverErrors,
        plainMessages,
      );

      expect(result).toEqual({
        users: [
          {
            mobile_no: "Mobile number must contain only digits.",
          },
          {
            mobile_no: "Mobile number must be exactly 10 digits.",
          },
        ],
      });
    });

    it("resolves deeply nested errors", () => {
      const result = resolveValidationMessages(
        deeplyNestedResolverErrors,
        plainMessages,
      );

      expect(result).toEqual({
        users: [
          {
            profile: {
              mobile_no: "Mobile number must contain only digits.",
            },
          },
          {
            profile: {
              mobile_no: "Mobile number must be exactly 10 digits.",
            },
          },
        ],
      });
    });
  });
});

describe("nested schema validation", () => {
  const validator = createValidator(nestedSchema);

  it("accepts valid nested data", () => {
    const result = validator.validate({
      users: [
        {
          mobile_no: "9812345678",
          password: "Password123",
        },
      ],
    });

    expect(result.valid).toBe(true);
  });

  it("rejects invalid nested data", () => {
    const result = validator.validate({
      users: [
        {
          mobile_no: "abc",
          password: "abc",
        },
      ],
    });

    expect(result.valid).toBe(false);

    if (!result.valid) {
      expect(result.errors).toEqual({
        users: [
          {
            mobile_no: "mobile_no_digits",
            password: "password_length",
          },
        ],
      });
    }
  });
});
