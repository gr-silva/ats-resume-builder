import { describe, expect, it } from "vitest";
import {
  draftBackupFilename,
  parseDraftBackup,
  serializeDraft,
} from "@/lib/resume/draft-backup";
import { createDemoResume } from "@/lib/resume/demo";
import { createEmptyResume } from "@/lib/resume/schema";

describe("serializeDraft", () => {
  it("serializes resume data as pretty JSON with focus geral", () => {
    const data = createEmptyResume();
    data.name = "Ana";
    data.focus = "fullstack";
    const raw = serializeDraft(data);
    const parsed = JSON.parse(raw) as { name: string; focus: string };
    expect(parsed.name).toBe("Ana");
    expect(parsed.focus).toBe("geral");
    expect(raw.includes("\n")).toBe(true);
  });
});

describe("parseDraftBackup", () => {
  it("parses a serialized draft", () => {
    const data = createDemoResume();
    const result = parseDraftBackup(serializeDraft(data));
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.data.name).toBe(data.name);
    expect(result.data.focus).toBe("geral");
    expect(result.data.experiences.length).toBeGreaterThan(0);
  });

  it("accepts JSON without focus and defaults to geral", () => {
    const data = createEmptyResume();
    const { focus: _focus, ...withoutFocus } = data;
    const result = parseDraftBackup(JSON.stringify(withoutFocus));
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.data.focus).toBe("geral");
  });

  it("rejects invalid JSON", () => {
    const result = parseDraftBackup("{not-json");
    expect(result).toEqual({
      ok: false,
      error: "Arquivo JSON inválido.",
    });
  });

  it("rejects JSON that is not a resume draft", () => {
    const result = parseDraftBackup(JSON.stringify({ name: 123 }));
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.error).toMatch(/rascunho Passou/i);
  });
});

describe("draftBackupFilename", () => {
  it("builds a safe filename from the name", () => {
    expect(draftBackupFilename({ ...createEmptyResume(), name: "Maria Silva" })).toBe(
      "Maria-Silva-passou-rascunho.json"
    );
  });

  it("falls back when name is empty", () => {
    expect(draftBackupFilename(createEmptyResume())).toBe(
      "rascunho-passou-rascunho.json"
    );
  });
});
