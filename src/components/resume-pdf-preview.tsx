"use client";

import { buildBlocks, type ResumeBlock } from "@/lib/resume/build-blocks";
import { COLORS, TYPE } from "@/lib/resume/pdf-config";
import type { FocusId, ResumeData } from "@/lib/resume/schema";
import { useMemo } from "react";

type ResumePdfPreviewProps = {
  data: ResumeData;
  focus?: FocusId;
};

function BlockView({ block }: { block: ResumeBlock }) {
  switch (block.type) {
    case "name":
      return (
        <p
          className="font-bold leading-snug"
          style={{
            color: COLORS.text,
            fontSize: TYPE.name.size,
            marginBottom: TYPE.name.spaceAfter,
          }}
        >
          {block.text}
        </p>
      );
    case "role":
      return (
        <p
          className="leading-snug"
          style={{
            color: COLORS.muted,
            fontSize: TYPE.role.size,
            marginBottom: TYPE.role.spaceAfter,
          }}
        >
          {block.text}
        </p>
      );
    case "contact":
      return (
        <p
          className="leading-snug"
          style={{
            color: COLORS.muted,
            fontSize: TYPE.contact.size,
            marginBottom: TYPE.contact.spaceAfter,
          }}
        >
          {block.text}
        </p>
      );
    case "section":
      return (
        <div
          style={{
            marginTop: TYPE.section.spaceBefore,
            marginBottom: TYPE.section.spaceAfter,
          }}
        >
          <p
            className="font-bold uppercase leading-snug"
            style={{ color: COLORS.text, fontSize: TYPE.section.size }}
          >
            {block.text}
          </p>
          <div
            className="mt-0.5 h-px w-full"
            style={{ backgroundColor: COLORS.rule }}
            aria-hidden
          />
        </div>
      );
    case "jobTitle":
      return (
        <p
          className="font-bold leading-snug"
          style={{
            color: COLORS.text,
            fontSize: TYPE.jobTitle.size,
            marginTop: TYPE.jobTitle.spaceBefore,
            marginBottom: TYPE.jobTitle.spaceAfter,
          }}
        >
          {block.text}
        </p>
      );
    case "jobMeta":
      return (
        <p
          className="leading-snug"
          style={{
            color: COLORS.muted,
            fontSize: TYPE.jobMeta.size,
            marginBottom: TYPE.jobMeta.spaceAfter,
          }}
        >
          {block.text}
        </p>
      );
    case "educationTitle":
      return (
        <p
          className="font-bold leading-snug"
          style={{
            color: COLORS.text,
            fontSize: TYPE.educationTitle.size,
            marginTop: TYPE.educationTitle.spaceBefore,
            marginBottom: TYPE.educationTitle.spaceAfter,
          }}
        >
          {block.text}
        </p>
      );
    case "educationMeta":
      return (
        <p
          className="leading-snug"
          style={{
            color: COLORS.muted,
            fontSize: TYPE.educationMeta.size,
            marginBottom: TYPE.educationMeta.spaceAfter,
          }}
        >
          {block.text}
        </p>
      );
    case "paragraph":
      return (
        <p
          className="leading-relaxed"
          style={{
            color: COLORS.text,
            fontSize: TYPE.body.size,
            marginBottom: TYPE.body.spaceAfter,
          }}
        >
          {block.text}
        </p>
      );
    case "bullets":
      return (
        <ul
          className="list-none"
          style={{
            color: COLORS.text,
            fontSize: TYPE.bullet.size,
            marginBottom: TYPE.bullet.spaceAfter,
          }}
        >
          {block.items.map((item, i) => (
            <li
              key={`${i}-${item.slice(0, 24)}`}
              className="relative leading-relaxed"
              style={{
                paddingLeft: TYPE.bullet.indent,
                marginBottom: TYPE.bullet.spaceAfter,
              }}
            >
              <span
                className="absolute left-0"
                aria-hidden
                style={{ width: TYPE.bullet.indent }}
              >
                •
              </span>
              {item}
            </li>
          ))}
        </ul>
      );
    default:
      return null;
  }
}

/**
 * HTML preview approximating the ATS PDF layout (same blocks + tokens).
 * Download still uses PDFKit via /api/pdf.
 */
export function ResumePdfPreview({
  data,
  focus = "geral",
}: ResumePdfPreviewProps) {
  const blocks = useMemo(() => buildBlocks(data, focus), [data, focus]);

  if (blocks.length === 0) {
    return (
      <div className="rounded-lg border border-border bg-background p-4 text-sm text-muted">
        Preencha o formulário para ver o preview do PDF.
      </div>
    );
  }

  return (
    <div className="max-h-[70vh] overflow-auto rounded-lg border border-border bg-neutral-600/40 p-3 sm:p-4">
      <div
        className="mx-auto w-full max-w-[210mm] origin-top bg-white shadow-md"
        style={{
          color: COLORS.text,
          fontFamily: "Helvetica, Arial, sans-serif",
          padding: "42px 48px",
          minHeight: "297mm",
        }}
        aria-label="Preview aproximado do PDF"
      >
        {blocks.map((block, index) => (
          <BlockView key={`${block.type}-${index}`} block={block} />
        ))}
      </div>
    </div>
  );
}
