import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  type IParagraphOptions,
} from "docx";
import { buildBlocks, type ResumeBlock } from "@/lib/resume/build-blocks";
import type { FocusId, ResumeData } from "@/lib/resume/schema";

const FONT = "Arial";

/** docx sizes are half-points (20 = 10pt). */
const SIZE = {
  name: 32,
  role: 22,
  contact: 18,
  section: 22,
  jobTitle: 21,
  jobMeta: 18,
  body: 19,
  bullet: 19,
  educationTitle: 20,
  educationMeta: 18,
} as const;

function run(
  text: string,
  opts: { bold?: boolean; size: number; color?: string } = { size: SIZE.body }
): TextRun {
  return new TextRun({
    text,
    font: FONT,
    size: opts.size,
    bold: opts.bold,
    color: opts.color,
  });
}

function paragraph(
  children: TextRun[],
  opts: Omit<IParagraphOptions, "children"> = {}
): Paragraph {
  return new Paragraph({ ...opts, children });
}

/**
 * Map typed resume blocks into a simple single-column ATS DOCX.
 */
export function blocksToParagraphs(blocks: ResumeBlock[]): Paragraph[] {
  const paragraphs: Paragraph[] = [];

  for (const block of blocks) {
    switch (block.type) {
      case "name":
        paragraphs.push(
          paragraph([run(block.text, { bold: true, size: SIZE.name })], {
            spacing: { after: 80 },
          })
        );
        break;
      case "role":
        paragraphs.push(
          paragraph([run(block.text, { size: SIZE.role })], {
            spacing: { after: 60 },
          })
        );
        break;
      case "contact":
        paragraphs.push(
          paragraph([run(block.text, { size: SIZE.contact, color: "444444" })], {
            spacing: { after: 200 },
          })
        );
        break;
      case "section":
        paragraphs.push(
          paragraph([run(block.text, { bold: true, size: SIZE.section })], {
            spacing: { before: 240, after: 120 },
          })
        );
        break;
      case "jobTitle":
        paragraphs.push(
          paragraph([run(block.text, { bold: true, size: SIZE.jobTitle })], {
            spacing: { before: 160, after: 40 },
          })
        );
        break;
      case "jobMeta":
        paragraphs.push(
          paragraph([run(block.text, { size: SIZE.jobMeta, color: "444444" })], {
            spacing: { after: 60 },
          })
        );
        break;
      case "educationTitle":
        paragraphs.push(
          paragraph(
            [run(block.text, { bold: true, size: SIZE.educationTitle })],
            { spacing: { before: 120, after: 40 } }
          )
        );
        break;
      case "educationMeta":
        paragraphs.push(
          paragraph(
            [run(block.text, { size: SIZE.educationMeta, color: "444444" })],
            { spacing: { after: 60 } }
          )
        );
        break;
      case "paragraph":
        paragraphs.push(
          paragraph([run(block.text, { size: SIZE.body })], {
            spacing: { after: 120 },
          })
        );
        break;
      case "bullets":
        for (const item of block.items) {
          paragraphs.push(
            paragraph([run(`• ${item}`, { size: SIZE.bullet })], {
              indent: { left: 180 },
              spacing: { after: 40 },
            })
          );
        }
        break;
      default: {
        const _exhaustive: never = block;
        void _exhaustive;
      }
    }
  }

  return paragraphs;
}

export async function generateDocxBuffer(
  data: ResumeData,
  focus: FocusId = "geral"
): Promise<Buffer> {
  const blocks = buildBlocks(data, focus);
  const children = blocksToParagraphs(blocks);

  const doc = new Document({
    creator: data.name?.trim() || "Passou",
    title: `${data.name?.trim() || "Currículo"} - ATS`,
    description: "Currículo ATS gerado pelo Passou",
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: 720,
              bottom: 720,
              left: 720,
              right: 720,
            },
          },
        },
        children:
          children.length > 0
            ? children
            : [
                paragraph([
                  run("Preencha o formulário para gerar o currículo.", {
                    size: SIZE.body,
                    color: "666666",
                  }),
                ]),
              ],
      },
    ],
  });

  return Buffer.from(await Packer.toBuffer(doc));
}
