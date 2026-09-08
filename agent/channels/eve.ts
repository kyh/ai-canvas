import type { AuthFn } from "eve/channels/auth";
import { extractBearerToken, localDev, vercelOidc } from "eve/channels/auth";
import { eveChannel } from "eve/channels/eve";

/**
 * BYO-key verifier: the canvas toolbar sends the user's Vercel AI Gateway key
 * as `Authorization: Bearer <key>`; this admits the request and stashes
 * the key in the session auth attributes, where the dynamic model
 * resolver (agent/agent.ts) picks it up. The key itself is never
 * validated here — a bad key fails at the model call and surfaces as a
 * turn error the toolbar maps back to the key dialog.
 */
const gatewayKeyBearer: AuthFn<Request> = (request) => {
  const token = extractBearerToken(request.headers.get("authorization"));
  if (token === null || token.length === 0) {
    return null;
  }
  return {
    attributes: { gatewayApiKey: token },
    authenticator: "gateway-key-bearer",
    principalId: "byok-user",
    principalType: "user",
  };
};

/**
 * Auth walk: user bearer key first, then Vercel OIDC (deployment-internal
 * callers), then open localhost for dev. Anything else — notably keyless
 * browsers in production — gets a 401, which the toolbar turns into
 * the key dialog.
 */
export default eveChannel({ auth: [gatewayKeyBearer, vercelOidc(), localDev()] });
