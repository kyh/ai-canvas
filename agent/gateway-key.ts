import { z } from "zod";

// Auth attributes are string-or-string-array valued; only a non-empty string
// stashed by the channel verifier (agent/channels/eve.ts) is a usable key.
const gatewayApiKeySchema = z.string().min(1);

/** Parses the BYO gateway key out of a session auth attribute value. */
export const parseGatewayApiKey = (
  attribute: string | readonly string[] | undefined,
): string | null => {
  const parsed = gatewayApiKeySchema.safeParse(attribute);
  return parsed.success ? parsed.data : null;
};
