import { HiSparkles } from "react-icons/hi2";

export function Logo({ size = 36 }: { size?: number }) {
  return (
    <div className="flex items-center gap-2.5">
      <div
        style={{ width: size, height: size }}
        className="grid place-items-center rounded-xl btn-brand"
      >
        <HiSparkles className="text-brand-foreground" size={size * 0.55} />
      </div>
      <div className="font-display text-lg font-semibold tracking-tight">
        Site<span className="text-gradient">wise</span>
      </div>
    </div>
  );
}
