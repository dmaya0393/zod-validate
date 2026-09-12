import { z } from "zod";

/*
|--------------------------------------------------------------------------
| SCHEMAS
|--------------------------------------------------------------------------
*/

export const signupSchema = z.object({
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

export const nestedSchema = z.object({
  users: z.array(
    z.object({
      mobile_no: z
        .string("mobile_no")
        .regex(/^[0-9]+$/, "mobile_no_digits")
        .length(10, "mobile_no_length"),

      password: z.string("password").min(8, "password_length"),
    }),
  ),
});

/*
|--------------------------------------------------------------------------
| VALID INPUTS
|--------------------------------------------------------------------------
*/

export const validSignupData = {
  mobile_no: "9812345678",
  password: "Password123!",
};

export const invalidSignupData = {
  mobile_no: "abc",
  password: "abc",
};

export const validFieldData = {
  mobile_no: "9812345678",
  password: "Password123!",
};

export const invalidFieldData = {
  mobile_no: "abc",
  password: "abc",
};

/*
|--------------------------------------------------------------------------
| PLAIN MESSAGE MAP
|--------------------------------------------------------------------------
*/

export const plainMessages = {
  mobile_no: "Mobile number is required.",
  mobile_no_digits: "Mobile number must contain only digits.",
  mobile_no_prefix: "Mobile number must start with 98 or 97.",
  mobile_no_length: "Mobile number must be exactly 10 digits.",

  password: "Password is required.",
  password_length: "Password must be between 8 and 32 characters.",
  password_lowercase: "Password must contain at least one lowercase letter.",
  password_uppercase: "Password must contain at least one uppercase letter.",
  password_digit: "Password must contain at least one number.",
  password_special: "Password must contain at least one special character.",
};

/*
|--------------------------------------------------------------------------
| LOCALIZED MESSAGE MAP
|--------------------------------------------------------------------------
*/

export const localizedMessages = {
  en: {
    mobile_no: "Mobile number is required.",
    mobile_no_digits: "Mobile number must contain only digits.",
    mobile_no_prefix: "Mobile number must start with 98 or 97.",
    mobile_no_length: "Mobile number must be exactly 10 digits.",

    password: "Password is required.",
    password_length: "Password must be between 8 and 32 characters.",
    password_lowercase: "Password must contain at least one lowercase letter.",
    password_uppercase: "Password must contain at least one uppercase letter.",
    password_digit: "Password must contain at least one number.",
    password_special: "Password must contain at least one special character.",
  },

  np: {
    mobile_no: "मोबाइल नम्बर आवश्यक छ।",
    mobile_no_digits: "मोबाइल नम्बरमा अंक मात्र हुनुपर्छ।",
    mobile_no_prefix: "मोबाइल नम्बर ९८ वा ९७ बाट सुरु हुनुपर्छ।",
    mobile_no_length: "मोबाइल नम्बर ठीक १० अंकको हुनुपर्छ।",

    password: "पासवर्ड आवश्यक छ।",
    password_length: "पासवर्ड ८ देखि ३२ अक्षरसम्म हुनुपर्छ।",
    password_lowercase: "पासवर्डमा कम्तीमा एउटा सानो अक्षर हुनुपर्छ।",
    password_uppercase: "पासवर्डमा कम्तीमा एउटा ठूलो अक्षर हुनुपर्छ।",
    password_digit: "पासवर्डमा कम्तीमा एउटा अंक हुनुपर्छ।",
    password_special: "पासवर्डमा कम्तीमा एउटा विशेष चिन्ह हुनुपर्छ।",
  },

  fr: {
    mobile_no: "Le numéro de téléphone est requis.",
    mobile_no_digits:
      "Le numéro de téléphone doit contenir uniquement des chiffres.",
    mobile_no_prefix: "Le numéro de téléphone doit commencer par 98 ou 97.",
    mobile_no_length:
      "Le numéro de téléphone doit comporter exactement 10 chiffres.",

    password: "Le mot de passe est requis.",
    password_length: "Le mot de passe doit comporter entre 8 et 32 caractères.",
    password_lowercase:
      "Le mot de passe doit contenir au moins une lettre minuscule.",
    password_uppercase:
      "Le mot de passe doit contenir au moins une lettre majuscule.",
    password_digit: "Le mot de passe doit contenir au moins un chiffre.",
    password_special:
      "Le mot de passe doit contenir au moins un caractère spécial.",
  },
};

/*
|--------------------------------------------------------------------------
| LOCALIZED MAP WITHOUT ENGLISH
|--------------------------------------------------------------------------
|
| Tests fallback to the first available locale.
|--------------------------------------------------------------------------
*/

export const localizedMessagesWithoutEnglish = {
  np: {
    mobile_no: "मोबाइल नम्बर आवश्यक छ।",
    mobile_no_digits: "मोबाइल नम्बरमा अंक मात्र हुनुपर्छ।",
  },

  fr: {
    mobile_no: "Le numéro de téléphone est requis.",
    mobile_no_digits:
      "Le numéro de téléphone doit contenir uniquement des chiffres.",
  },
};

/*
|--------------------------------------------------------------------------
| INCOMPLETE MESSAGE MAPS
|--------------------------------------------------------------------------
|
| Missing individual codes are intentionally allowed by the current
| resolver contract. The resolver should fall back to the original code.
|--------------------------------------------------------------------------
*/

export const incompletePlainMessages = {
  mobile_no: "Mobile number is required.",
};

export const incompleteLocalizedMessages = {
  en: {
    mobile_no: "Mobile number is required.",
  },

  np: {
    mobile_no: "मोबाइल नम्बर आवश्यक छ।",
  },
};

/*
|--------------------------------------------------------------------------
| INVALID RUNTIME MESSAGE MAPS
|--------------------------------------------------------------------------
|
| `as any` is deliberate.
|
| These test runtime protection against data that TypeScript cannot
| guarantee, such as JavaScript, JSON, external configuration, or any.
|--------------------------------------------------------------------------
*/

export const invalidMessages = {
  /*
  |----------------------------------------------------------------------
  | Invalid message values
  |----------------------------------------------------------------------
  */

  numberMessage: {
    en: {
      mobile_no: 123,
    },
  } as any,

  booleanMessage: {
    en: {
      mobile_no: true,
    },
  } as any,

  nullMessage: {
    en: {
      mobile_no: null,
    },
  } as any,

  arrayMessage: {
    en: {
      mobile_no: [],
    },
  } as any,

  objectMessage: {
    en: {
      mobile_no: {},
    },
  } as any,

  /*
  |----------------------------------------------------------------------
  | Invalid locale values
  |----------------------------------------------------------------------
  */

  localeIsString: {
    en: "hello",
  } as any,

  localeIsNumber: {
    en: 123,
  } as any,

  localeIsBoolean: {
    en: true,
  } as any,

  localeIsNull: {
    en: null,
  } as any,

  localeIsArray: {
    en: [],
  } as any,

  /*
  |----------------------------------------------------------------------
  | Invalid top-level values
  |----------------------------------------------------------------------
  */

  topLevelString: "invalid" as any,

  topLevelNumber: 123 as any,

  topLevelBoolean: true as any,

  topLevelNull: null as any,

  topLevelArray: [] as any,

  /*
  |----------------------------------------------------------------------
  | Empty structures
  |----------------------------------------------------------------------
  */

  emptyObject: {} as any,

  emptyLocalizedMap: {
    en: {},
  } as any,

  multipleEmptyLocales: {
    en: {},
    np: {},
  } as any,
};

/*
|--------------------------------------------------------------------------
| ERROR SHAPES
|--------------------------------------------------------------------------
*/

export const resolverErrors = {
  single: {
    mobile_no: "mobile_no",
  },

  multiple: {
    mobile_no: "mobile_no_digits",
    password: "password_length",
  },

  unknownCode: {
    mobile_no: "unknown_validation_code",
  },
};

/*
|--------------------------------------------------------------------------
| NESTED ERROR SHAPES
|--------------------------------------------------------------------------
*/

export const nestedResolverErrors = {
  user: {
    mobile_no: "mobile_no_digits",
    password: "password_length",
  },
};

export const arrayResolverErrors = {
  users: [
    {
      mobile_no: "mobile_no_digits",
    },
    {
      mobile_no: "mobile_no_length",
    },
  ],
};

/*
|--------------------------------------------------------------------------
| DEEPLY NESTED ERROR SHAPE
|--------------------------------------------------------------------------
*/

export const deeplyNestedResolverErrors = {
  users: [
    {
      profile: {
        mobile_no: "mobile_no_digits",
      },
    },
    {
      profile: {
        mobile_no: "mobile_no_length",
      },
    },
  ],
};
