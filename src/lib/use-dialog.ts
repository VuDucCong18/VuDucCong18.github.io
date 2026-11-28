import * as React from "react";

/**
 * Shared behaviour for the pop-ups (project write-ups, Chef's Skills):
 * - moves focus to the Close button on open and back to where it was on close
 * - fades the pop-up in (`shown`)
 * - owns Esc and Tab while open, so the plate card underneath does not react:
 *   Esc closes (unless `onEscape` handles it first) and Tab stays inside the panel.
 */
export function useDialog(onClose: () => void, onEscape?: () => boolean) {
  const closeRef = React.useRef<HTMLButtonElement | null>(null);
  const panelRef = React.useRef<HTMLDivElement | null>(null);
  const [shown, setShown] = React.useState(false);

  React.useEffect(() => {
    const before = document.activeElement as HTMLElement | null;
    closeRef.current?.focus({ preventScroll: true });
    const raf = requestAnimationFrame(() => setShown(true));
    return () => { cancelAnimationFrame(raf); before?.focus?.({ preventScroll: true }); };
  }, []);

  // Read the latest callbacks without re-binding the listener on every render.
  const latest = React.useRef({ onClose, onEscape });
  latest.current = { onClose, onEscape };

  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape" && e.key !== "Tab") return;
      e.stopPropagation();
      if (e.key === "Escape") {
        e.preventDefault();
        if (!latest.current.onEscape?.()) latest.current.onClose();
        return;
      }
      const nodes = [...(panelRef.current?.querySelectorAll<HTMLElement>("button:not(:disabled), a[href], [tabindex='0']") ?? [])];
      const first = nodes[0], last = nodes.at(-1);
      if (!first || !last) return;
      const inside = panelRef.current?.contains(document.activeElement);
      if (!inside) { e.preventDefault(); first.focus(); }
      else if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    };
    window.addEventListener("keydown", onKey, true);
    return () => window.removeEventListener("keydown", onKey, true);
  }, []);

  return { closeRef, panelRef, shown };
}
