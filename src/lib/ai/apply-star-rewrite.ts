import type { StarRewriteItem } from "@/lib/ai/star-types";
import type { Experience } from "@/lib/resume/schema";

export function applyStarRewrite(
  experience: Experience,
  rewrites: StarRewriteItem[]
): Experience {
  if (!rewrites.length) return experience;

  const bullets = [...experience.bullets];
  for (const rewrite of rewrites) {
    const { bulletIndex, rewritten } = rewrite;
    if (bulletIndex < 0 || bulletIndex >= bullets.length) continue;
    if (!rewritten.trim()) continue;
    bullets[bulletIndex] = rewritten.trim();
  }

  return { ...experience, bullets };
}
