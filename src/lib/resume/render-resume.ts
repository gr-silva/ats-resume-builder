import type PDFKit from "pdfkit";
import type { ResumeBlock } from "@/lib/resume/build-blocks";
import { COLORS, FONTS, PAGE, TYPE } from "@/lib/resume/pdf-config";

type Doc = PDFKit.PDFDocument;

function contentWidth(doc: Doc) {
  return doc.page.width - PAGE.marginLeft - PAGE.marginRight;
}

function ensureSpace(doc: Doc, needed: number) {
  const bottomLimit = doc.page.height - PAGE.marginBottom;
  if (doc.y + needed > bottomLimit) {
    doc.addPage();
  }
}

function writeWrapped(
  doc: Doc,
  text: string,
  opts: {
    font: string;
    size: number;
    lineGap: number;
    color?: string;
    width?: number;
    x?: number;
  }
) {
  const width = opts.width ?? contentWidth(doc);
  const x = opts.x ?? PAGE.marginLeft;

  doc
    .font(opts.font)
    .fontSize(opts.size)
    .fillColor(opts.color ?? COLORS.text)
    .text(text, x, doc.y, {
      width,
      align: "left",
      lineGap: opts.lineGap,
      continued: false,
    });
}

function drawName(doc: Doc, block: ResumeBlock) {
  if (block.type !== "name") return;
  const t = TYPE.name;
  ensureSpace(doc, t.size + t.spaceAfter + 8);
  writeWrapped(doc, block.text, {
    font: FONTS.bold,
    size: t.size,
    lineGap: t.lineGap,
  });
  doc.y += t.spaceAfter;
}

function drawRole(doc: Doc, block: ResumeBlock) {
  if (block.type !== "role") return;
  const t = TYPE.role;
  ensureSpace(doc, t.size + t.spaceAfter + 4);
  writeWrapped(doc, block.text, {
    font: FONTS.regular,
    size: t.size,
    lineGap: t.lineGap,
    color: COLORS.muted,
  });
  doc.y += t.spaceAfter;
}

function drawContact(doc: Doc, block: ResumeBlock) {
  if (block.type !== "contact") return;
  const t = TYPE.contact;
  ensureSpace(doc, t.size + t.spaceAfter + 4);
  writeWrapped(doc, block.text, {
    font: FONTS.regular,
    size: t.size,
    lineGap: t.lineGap,
    color: COLORS.muted,
  });
  doc.y += t.spaceAfter;
}

function drawSection(doc: Doc, block: ResumeBlock) {
  if (block.type !== "section") return;
  const t = TYPE.section;
  ensureSpace(doc, t.spaceBefore + t.size + t.spaceAfter + 10);
  doc.y += t.spaceBefore;

  writeWrapped(doc, block.text.toUpperCase(), {
    font: FONTS.bold,
    size: t.size,
    lineGap: t.lineGap,
  });

  const y = doc.y + 2;
  doc
    .strokeColor(COLORS.rule)
    .lineWidth(0.8)
    .moveTo(PAGE.marginLeft, y)
    .lineTo(PAGE.marginLeft + contentWidth(doc), y)
    .stroke();

  doc.y = y + t.spaceAfter;
}

function drawJobTitle(doc: Doc, block: ResumeBlock) {
  if (block.type !== "jobTitle") return;
  const t = TYPE.jobTitle;
  ensureSpace(doc, t.spaceBefore + t.size + t.spaceAfter + 4);
  doc.y += t.spaceBefore;
  writeWrapped(doc, block.text, {
    font: FONTS.bold,
    size: t.size,
    lineGap: t.lineGap,
  });
  doc.y += t.spaceAfter;
}

function drawJobMeta(doc: Doc, block: ResumeBlock) {
  if (block.type !== "jobMeta") return;
  const t = TYPE.jobMeta;
  ensureSpace(doc, t.size + t.spaceAfter + 4);
  writeWrapped(doc, block.text, {
    font: FONTS.regular,
    size: t.size,
    lineGap: t.lineGap,
    color: COLORS.muted,
  });
  doc.y += t.spaceAfter;
}

function drawEducationTitle(doc: Doc, block: ResumeBlock) {
  if (block.type !== "educationTitle") return;
  const t = TYPE.educationTitle;
  ensureSpace(doc, t.spaceBefore + t.size + t.spaceAfter + 4);
  doc.y += t.spaceBefore;
  writeWrapped(doc, block.text, {
    font: FONTS.bold,
    size: t.size,
    lineGap: t.lineGap,
  });
  doc.y += t.spaceAfter;
}

function drawEducationMeta(doc: Doc, block: ResumeBlock) {
  if (block.type !== "educationMeta") return;
  const t = TYPE.educationMeta;
  ensureSpace(doc, t.size + t.spaceAfter + 4);
  writeWrapped(doc, block.text, {
    font: FONTS.regular,
    size: t.size,
    lineGap: t.lineGap,
    color: COLORS.muted,
  });
  doc.y += t.spaceAfter;
}

function drawParagraph(doc: Doc, block: ResumeBlock) {
  if (block.type !== "paragraph") return;
  const t = TYPE.body;
  const height = doc.heightOfString(block.text, {
    width: contentWidth(doc),
    lineGap: t.lineGap,
  });
  ensureSpace(doc, height + t.spaceAfter);
  writeWrapped(doc, block.text, {
    font: FONTS.regular,
    size: t.size,
    lineGap: t.lineGap,
  });
  doc.y += t.spaceAfter;
}

function drawBulletList(doc: Doc, block: ResumeBlock) {
  if (block.type !== "bullets") return;
  const t = TYPE.bullet;
  const textX = PAGE.marginLeft + t.indent;
  const textWidth = contentWidth(doc) - t.indent;

  for (const item of block.items) {
    doc.font(FONTS.regular).fontSize(t.size);
    const height = doc.heightOfString(item, {
      width: textWidth,
      lineGap: t.lineGap,
    });
    ensureSpace(doc, height + t.spaceAfter);

    const startY = doc.y;
    doc
      .font(FONTS.regular)
      .fontSize(t.size)
      .fillColor(COLORS.text)
      .text("•", PAGE.marginLeft, startY, {
        width: t.indent - 2,
        lineGap: t.lineGap,
        continued: false,
      });

    doc.y = startY;
    writeWrapped(doc, item, {
      font: FONTS.regular,
      size: t.size,
      lineGap: t.lineGap,
      x: textX,
      width: textWidth,
    });
    doc.y += t.spaceAfter;
  }
}

const HANDLERS: Record<
  ResumeBlock["type"],
  (doc: Doc, block: ResumeBlock) => void
> = {
  name: drawName,
  role: drawRole,
  contact: drawContact,
  section: drawSection,
  jobTitle: drawJobTitle,
  jobMeta: drawJobMeta,
  educationTitle: drawEducationTitle,
  educationMeta: drawEducationMeta,
  paragraph: drawParagraph,
  bullets: drawBulletList,
};

export function renderResume(doc: Doc, blocks: ResumeBlock[]) {
  doc.y = PAGE.marginTop;

  for (const block of blocks) {
    HANDLERS[block.type](doc, block);
  }
}
