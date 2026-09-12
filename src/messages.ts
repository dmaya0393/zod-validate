import type {
  ValidationErrors,
  ValidationMessageMap,
  ValidationMessages,
} from "./types.js";

const getMessageMap = (
  messages: ValidationMessages,
  locale?: string,
): ValidationMessageMap => {
  const isPlain = isPlainMessageMap(messages);
  const isLocalized = isLocaleMessageMap(messages);

  if (!isPlain && !isLocalized) {
    const localeError = getLocaleMessageMapError(messages);
    if (localeError) throw new Error(localeError);

    throw new Error(
      "Invalid validation messages. Messages must be either a plain message map or a locale-based message map.",
    );
  }

  if (isPlain) {
    if (locale)
      throw new Error(
        `Locale "${locale}" was provided, but the validation messages are not localized.`,
      );

    return messages;
  }

  const locales = Object.keys(messages);
  if (locales.length === 0)
    throw new Error("No validation message locales have been defined.");

  const selectedLocale = locale ?? (locales.includes("en") ? "en" : locales[0]);
  if (!selectedLocale)
    throw new Error("No validation message locale has been defined.");

  const messageMap = messages[selectedLocale];
  if (!messageMap)
    throw new Error(
      `Validation messages for locale "${selectedLocale}" are not defined.`,
    );

  return messageMap;
};

const isPlainMessageMap = (value: unknown): value is ValidationMessageMap => {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return false;
  }

  const values = Object.values(value);

  return (
    values.length > 0 && values.every((message) => typeof message === "string")
  );
};

const isLocaleMessageMap = (
  value: unknown,
): value is Record<string, ValidationMessageMap> => {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return false;
  }

  const localeMaps = Object.values(value);

  return (
    localeMaps.length > 0 &&
    localeMaps.every((messageMap) => isPlainMessageMap(messageMap))
  );
};

const getLocaleMessageMapError = (value: unknown): string | undefined => {
  if (typeof value !== "object" || value === null || Array.isArray(value))
    return undefined;

  for (const [locale, messageMap] of Object.entries(value)) {
    if (
      typeof messageMap !== "object" ||
      messageMap === null ||
      Array.isArray(messageMap)
    )
      return `Validation messages for locale "${locale}" must be a message map.`;

    for (const [code, message] of Object.entries(messageMap)) {
      if (typeof message !== "string")
        return `Validation message for locale "${locale}" and code "${code}" must be a string. Received ${typeof message}.`;
    }
  }

  return undefined;
};

const resolveErrors = (
  errors: ValidationErrors,
  messageMap: ValidationMessageMap,
): ValidationErrors => {
  const resolved: ValidationErrors = {};

  for (const key of Object.keys(errors)) {
    const value = errors[key];

    if (typeof value === "string") {
      resolved[key] = messageMap[value] ?? value;
      continue;
    }

    if (Array.isArray(value)) {
      resolved[key] = value.map((item) => resolveErrors(item, messageMap));
      continue;
    }

    if (value !== undefined) resolved[key] = resolveErrors(value, messageMap);
  }

  return resolved;
};

export const resolveValidationMessages = (
  errors: ValidationErrors,
  messages: ValidationMessages,
  locale?: string,
): ValidationErrors => {
  const messageMap = getMessageMap(messages, locale);
  return resolveErrors(errors, messageMap);
};
