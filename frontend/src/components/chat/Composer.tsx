import { useEffect, useRef } from "react";
import { HiPaperAirplane, HiStop } from "react-icons/hi2";

interface Props {
  value: string;
  onChange: (v: string) => void;
  onSubmit: () => void;
  onStop?: () => void;
  disabled?: boolean;
  streaming?: boolean;
  placeholder?: string;
}

export function Composer({
  value,
  onChange,
  onSubmit,
  onStop,
  disabled,
  streaming,
  placeholder,
}: Props) {
  const ref = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 160) + "px";
  }, [value]);

  useEffect(() => {
    ref.current?.focus();
  }, []);

  const handleKey = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (!disabled && value.trim()) onSubmit();
    }
  };

  return (
    <div className="glass flex items-end gap-2 rounded-2xl p-2">
      <textarea
        ref={ref}
        rows={1}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKey}
        placeholder={placeholder ?? "Ask anything about this website…"}
        className="scrollbar-thin flex-1 resize-none bg-transparent px-3 py-2 text-sm outline-none placeholder:text-muted-foreground/70"
      />
      {streaming ? (
        <button
          onClick={onStop}
          className="grid h-10 w-10 place-items-center rounded-xl bg-white/10 text-foreground transition hover:bg-white/20"
          aria-label="Stop"
        >
          <HiStop size={16} />
        </button>
      ) : (
        <button
          onClick={onSubmit}
          disabled={disabled || !value.trim()}
          className="btn-brand grid h-10 w-10 place-items-center rounded-xl"
          aria-label="Send"
        >
          <HiPaperAirplane size={16} />
        </button>
      )}
    </div>
  );
}
