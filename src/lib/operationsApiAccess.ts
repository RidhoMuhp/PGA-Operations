import "server-only";

export function getOperationsApiUnavailableResponse(): Response | null {
  const isLocalDevelopment = process.env.NODE_ENV !== "production";
  const isAllowedDeployPreview =
    process.env.OPERATIONS_API_ALLOW_DEPLOY_PREVIEW === "true";
  const isAllowedProtectedProduction =
    process.env.OPERATIONS_API_ALLOW_PROTECTED_PRODUCTION === "true";

  if (isLocalDevelopment || isAllowedDeployPreview || isAllowedProtectedProduction) {
    return null;
  }

  return Response.json(
    { error: "API operasi hanya tersedia saat development lokal atau deploy preview." },
    { status: 404 },
  );
}
