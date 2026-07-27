import { revalidateTag } from "next/cache";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const secret = request.headers.get("x-revalidate-secret");

  if (!process.env.STRAPI_WEBHOOK_SECRET || secret !== process.env.STRAPI_WEBHOOK_SECRET) {
    return NextResponse.json({ revalidated: false }, { status: 401 });
  }

  revalidateTag("photos");
  return NextResponse.json({ revalidated: true, now: Date.now() });
}
