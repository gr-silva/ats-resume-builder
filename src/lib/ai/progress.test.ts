import { describe, expect, it } from "vitest";
import { createMonotonicProgressReporter } from "@/lib/ai/progress";

describe("createMonotonicProgressReporter", () => {
  it("only reports increasing values", () => {
    const values: number[] = [];
    const report = createMonotonicProgressReporter((p) => values.push(p), {
      initial: 0,
      min: 0,
      max: 100,
    });

    report(10);
    report(5);
    report(20);
    report(15);
    report(100);

    expect(values).toEqual([10, 20, 100]);
  });
});
