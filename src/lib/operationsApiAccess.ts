import "server-only";

export function getOperationsApiUnavailableResponse(): Response | null {
  const isLocalDevelopment = process.env.NODE_ENV !== "production";
  const isNetlifyDeployPreview =
    process.env.NETLIFY === "true" && process.env.CONTEXT === "deploy-preview";
  const isProtectedNetlifyProduction =
    process.env.NETLIFY === "true" &&
    process.env.CONTEXT === "production" &&
    process.env.OPERATIONS_API_ALLOW_PROTECTED_PRODUCTION === "true";

  if (isLocalDevelopment || isNetlifyDeployPreview || isProtectedNetlifyProduction) {
    return null;
  }

  return Response.json(
    { error: "API operasi hanya tersedia saat development lokal atau deploy preview." },
    { status: 404 },
  );
}
