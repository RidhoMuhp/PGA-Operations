import "server-only";

export function getOperationsApiUnavailableResponse(): Response | null {
  const isLocalDevelopment = process.env.NODE_ENV !== "production";
  const isNetlifyDeployPreview =
    process.env.NETLIFY === "true" && process.env.CONTEXT === "deploy-preview";

  if (isLocalDevelopment || isNetlifyDeployPreview) return null;

  return Response.json(
    { error: "API operasi hanya tersedia saat development lokal atau deploy preview." },
    { status: 404 },
  );
}
