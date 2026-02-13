import type { RequestHandler } from "express";

function getApiKey(): string | null {
  const apiKey = process.env.API_KEY;
  return apiKey && apiKey.length > 0 ? apiKey : null;
};

function readApiKey(headerValue: string | undefined): string {
  if (!headerValue) {
    return "";
  }

  return headerValue.trim();
};

export function apiKeyAuth(): RequestHandler {
  return (req, res, next) => {
    const expectedKey = getApiKey();
    if (!expectedKey) {
      return res.status(500).json({ error: "API_KEY not configured" });
    }

    const providedKey = readApiKey(req.headers["x-api-key"] as string | undefined);
    if (!providedKey) {
      return res.status(401).json({ error: "Missing API key" });
    }

    if (providedKey !== expectedKey) {
      return res.status(401).json({ error: "Invalid API key" });
    }

    req.apiKey = providedKey;
    return next();
  };
};
