import { put } from "@vercel/blob";
import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";

export const runtime = "nodejs";

const ALLOWED = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/avif"];
const MAX_BYTES = 8 * 1024 * 1024; // 8 MB

export async function POST(req: NextRequest) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Nincs jogosultság." }, { status: 401 });
  }

  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return NextResponse.json(
      {
        error:
          "A képtárolás még nincs beállítva. Hozz létre egy Blob Store-t a Vercel felületén (Storage → Create → Blob), majd indíts egy új deployt.",
      },
      { status: 503 }
    );
  }

  const form = await req.formData();
  const file = form.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Nem érkezett fájl." }, { status: 400 });
  }
  if (!ALLOWED.includes(file.type)) {
    return NextResponse.json(
      { error: "Csak képfájl tölthető fel (JPG, PNG, WebP, GIF, AVIF)." },
      { status: 400 }
    );
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: "A kép túl nagy (max. 8 MB)." }, { status: 400 });
  }

  const ext = (file.name.split(".").pop() || "jpg").toLowerCase().replace(/[^a-z0-9]/g, "");
  const key = `termekek/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

  try {
    const blob = await put(key, file, { access: "public", contentType: file.type });
    return NextResponse.json({ url: blob.url });
  } catch (e) {
    console.error("Blob upload failed", e);
    return NextResponse.json({ error: "A feltöltés nem sikerült. Próbáld újra." }, { status: 500 });
  }
}
