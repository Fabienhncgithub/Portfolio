#!/bin/sh

set -eu

environment_file="${1:?Environment file is required.}"
compose_file="${2:?Compose file is required.}"

docker compose --env-file "${environment_file}" -f "${compose_file}" exec -T web node -e '
const secret = process.env.STRAPI_WEBHOOK_SECRET;
if (!secret) throw new Error("STRAPI_WEBHOOK_SECRET is missing.");

const baseUrl = "http://127.0.0.1:3000";

async function request(path, init) {
  const response = await fetch(`${baseUrl}${path}`, {
    ...init,
    signal: AbortSignal.timeout(10_000),
  });
  if (!response.ok) {
    throw new Error(`${path} returned ${response.status}.`);
  }
}

async function refresh() {
  await request("/api/revalidate", {
    method: "POST",
    headers: { "x-revalidate-secret": secret },
  });
  await Promise.all([
    request("/"),
    request("/archive"),
    request("/sitemap.xml"),
  ]);
  console.log("Strapi content revalidated and warmed.");
}

refresh().catch((error) => {
  console.error(error);
  process.exit(1);
});
'
