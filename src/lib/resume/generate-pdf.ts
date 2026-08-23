import PDFDocument from "pdfkit";
import { buildBlocks } from "@/lib/resume/build-blocks";
import { PAGE } from "@/lib/resume/pdf-config";
import { renderResume } from "@/lib/resume/render-resume";
import type { FocusId, ResumeData } from "@/lib/resume/schema";

export async function generatePdfBuffer(
  data: ResumeData,
  focus: FocusId = "geral"
): Promise<Buffer> {
  const blocks = buildBlocks(data, focus);

  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      size: PAGE.size,
      margins: {
        top: PAGE.marginTop,
        bottom: PAGE.marginBottom,
        left: PAGE.marginLeft,
        right: PAGE.marginRight,
      },
      info: {
        Title: `${data.name || "Curriculo"} - ATS`,
        Author: data.name || "ATS Resume Builder",
      },
    });

    const chunks: Buffer[] = [];
    doc.on("data", (chunk: Buffer) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    renderResume(doc, blocks);
    doc.end();
  });
}
