type Props = {
  percent: number;
  label?: string;
};

export function AiDownloadProgress({ percent, label }: Props) {
  const safePercent = Math.max(0, Math.min(100, percent));

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs text-muted">
        <span>{label ?? "Download do modelo"}</span>
        <span>{safePercent}%</span>
      </div>
      <div
        className="h-2 overflow-hidden rounded-full bg-border"
        role="progressbar"
        aria-valuenow={safePercent}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div
          className="h-full rounded-full bg-accent transition-[width] duration-300"
          style={{ width: `${safePercent}%` }}
        />
      </div>
    </div>
  );
}
