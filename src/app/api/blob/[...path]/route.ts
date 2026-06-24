import { get } from "@vercel/blob";
import { NextRequest } from "next/server";

export const runtime = "nodejs";

// Nyilvános kiszolgáló a privát Blob store-hoz: a termékképeket bárki
// láthatja a boltban, miközben a tárolás privát. A válasz erősen
// gyorsítótárazott, így a CDN/böngésző a további kéréseket kiszolgálja.
export async function GET(
  _req: NextRequest,
  ctx: { params: Promise<{ path: string[] }> }
) {
  const { path } = await ctx.params;
  const pathname = path.map((p) => decodeURIComponent(p)).join("/");

  try {
    const result = await get(pathname, { access: "private" });
    if (!result || !result.stream) {
      return new Response("Not found", { status: 404 });
    }
    return new Response(result.stream, {
      status: 200,
      headers: {
        "Content-Type": result.blob.contentType ?? "application/octet-stream",
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return new Response("Not found", { status: 404 });
  }
}
