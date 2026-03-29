import { NextResponse } from "next/server";

export function integrationSecretMissingResponse() {
  return NextResponse.json(
    {
      error:
        "Server misconfiguration: set THG_FORM_INTEGRATION_SECRET on the CRM deployment.",
    },
    { status: 503 }
  );
}

/** Validates Authorization: Bearer <secret> or X-THG-Integration-Secret. */
export function verifyIntegrationSecret(request: Request): boolean {
  const expected = process.env.THG_FORM_INTEGRATION_SECRET;
  if (!expected) return false;

  const auth = request.headers.get("authorization");
  const bearer =
    auth?.startsWith("Bearer ") ? auth.slice(7).trim() : null;
  const header = request.headers.get("x-thg-integration-secret");
  const provided = bearer ?? header ?? "";

  if (provided.length !== expected.length) return false;
  let ok = 0;
  for (let i = 0; i < expected.length; i++) {
    ok |= provided.charCodeAt(i) ^ expected.charCodeAt(i);
  }
  return ok === 0;
}

export function integrationUnauthorizedResponse() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}
