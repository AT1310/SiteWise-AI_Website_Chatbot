import { useEffect, useRef } from "react";

export function useAutoScroll<T extends HTMLElement>(dep: unknown) {
  const ref = useRef<T | null>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }, [dep]);
  return ref;
}
