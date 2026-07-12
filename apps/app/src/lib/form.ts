import type { AnyFormApi, StandardSchemaV1Issue } from "@tanstack/react-form";

import { ValidationAPIError } from "./api";

export const toIssue = (message: string): StandardSchemaV1Issue => {
  return { message };
};

export const toIssues = (messages: string[]): StandardSchemaV1Issue[] => {
  return messages.map(toIssue);
};

export const toFieldIssues = (fieldErrors: Record<string, string[]>) => {
  const fieldIssues: Record<string, StandardSchemaV1Issue[]> = {};

  for (const [field, messages] of Object.entries(fieldErrors)) {
    fieldIssues[field] = toIssues(messages);
  }

  return fieldIssues;
};

export const setFormServerErrors = (formApi: AnyFormApi, error: unknown) => {
  if (error instanceof ValidationAPIError) {
    formApi.setErrorMap({
      onServer: {
        fields: toFieldIssues(error.fields),
        form: toIssues(error.form),
      },
    });
  } else if (error instanceof Error) {
    formApi.setErrorMap({
      onServer: {
        form: toIssues([error.message]),
      },
    });
  } else {
    formApi.setErrorMap({
      onServer: {
        form: toIssues(["An unknown error occurred"]),
      },
    });
  }
};
