export function createMonotonicProgressReporter(
  onProgress?: (percent: number) => void,
  options?: { min?: number; max?: number; initial?: number }
) {
  const min = options?.min ?? 0;
  const max = options?.max ?? 100;
  let last = options?.initial ?? min;

  return (next: number) => {
    const clamped = Math.max(min, Math.min(max, next));
    if (clamped > last) {
      last = clamped;
      onProgress?.(last);
    }
  };
}
