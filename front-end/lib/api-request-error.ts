export type ApiValidationErrorResponse = {
  error?: string;
  fields?: Record<string, string[] | undefined>;
  formErrors?: string[];
};

export class ApiRequestError extends Error {
  fields?: Record<string, string[] | undefined>;
  formErrors?: string[];

  constructor(
    message: string,
    options?: {
      fields?: Record<string, string[] | undefined>;
      formErrors?: string[];
    },
  ) {
    super(message);
    this.name = "ApiRequestError";
    this.fields = options?.fields;
    this.formErrors = options?.formErrors;
  }
}

export async function parseApiRequestError(
  response: Response,
  fallbackMessage: string,
): Promise<ApiRequestError> {
  const contentType = response.headers.get("content-type");

  if (contentType?.includes("application/json")) {
    const payload = (await response.json()) as ApiValidationErrorResponse;
    return new ApiRequestError(payload.error ?? fallbackMessage, {
      fields: payload.fields,
      formErrors: payload.formErrors,
    });
  }

  return new ApiRequestError(fallbackMessage);
}
