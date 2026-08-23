import { NextResponse } from "next/server";
import { isFocusSupported } from "@/lib/focus";
import { generatePdfBuffer } from "@/lib/resume/generate-pdf";
import {
  FocusIdSchema,
  MVP_FOCUS,
  ResumeDataSchema,
} from "@/lib/resume/schema";

export const runtime = "nodejs";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido." }, { status: 400 });
  }

  const parsed = ResumeDataSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Dados do currículo inválidos.", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const focusResult = FocusIdSchema.safeParse(parsed.data.focus ?? MVP_FOCUS);
  const focus = focusResult.success ? focusResult.data : MVP_FOCUS;

  if (!isFocusSupported(focus)) {
    return NextResponse.json(
      {
        error:
          "Este foco ainda não está disponível. Use o foco Geral. Nichos e IA chegam em breve.",
      },
      { status: 400 }
    );
  }

  try {
    const buffer = await generatePdfBuffer(parsed.data, focus);
    const safeName = (parsed.data.name || "curriculo")
      .trim()
      .replace(/[^\w\-]+/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 60);

    return new NextResponse(new Uint8Array(buffer), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${safeName || "curriculo"}-ATS-Geral.pdf"`,
      },
    });
  } catch (error) {
    console.error("PDF generation failed:", error);
    return NextResponse.json(
      { error: "Falha ao gerar o PDF." },
      { status: 500 }
    );
  }
}
