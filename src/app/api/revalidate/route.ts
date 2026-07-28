import { revalidatePath, revalidateTag } from "next/cache";
import { NextResponse } from "next/server";

const noStoreHeaders = { "Cache-Control": "no-store, max-age=0" };

function secretsMatch(provided: string, expected: string) {
  const encoder = new TextEncoder();
  const providedBytes = encoder.encode(provided);
  const expectedBytes = encoder.encode(expected);
  const length = Math.max(providedBytes.length, expectedBytes.length);
  let mismatch = providedBytes.length ^ expectedBytes.length;

  for (let index = 0; index < length; index += 1) {
    mismatch |= (providedBytes[index] ?? 0) ^ (expectedBytes[index] ?? 0);
  }

  return mismatch === 0;
}

export async function POST(request: Request) {
  const providedSecret = request.headers.get("x-revalidate-secret") ?? "";
  const expectedSecret = process.env.STRAPI_WEBHOOK_SECRET?.trim() ?? "";

  if (expectedSecret.length < 32 || !secretsMatch(providedSecret, expectedSecret)) {
    return NextResponse.json(
      { revalidated: false },
      { status: 401, headers: noStoreHeaders },
    );
  }

  revalidateTag("photos");
  revalidatePath("/");
  revalidatePath("/archive");
  revalidatePath("/photo/[slug]", "page");
  revalidatePath("/sitemap.xml");

  return NextResponse.json(
    { revalidated: true, now: Date.now() },
    { headers: noStoreHeaders },
  );
}
