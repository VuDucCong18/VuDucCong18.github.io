import * as React from "react";

/** An abbreviation with a small explanation that appears on hover, keyboard focus or tap. */
/** plain: no dotted underline (used inside chips, where the chip itself already frames the text). */
export function Term({ children, title, body, plain = false }: { children: React.ReactNode; title: string; body: string; plain?: boolean }) {
  const [open, setOpen] = React.useState(false);
  const [shift, setShift] = React.useState(0);
  const tipRef = React.useRef<HTMLSpanElement | null>(null);
  const id = React.useId();

  // Keep the tooltip inside the screen: nudge it sideways if it would spill past either edge.
  React.useLayoutEffect(() => {
    if (!open) { setShift(0); return; }
    const tip = tipRef.current;
    if (!tip) return;
    const r = tip.getBoundingClientRect();
    const left = r.left - shift, right = r.right - shift, margin = 12, vw = document.documentElement.clientWidth;
    setShift(left < margin ? margin - left : right > vw - margin ? vw - margin - right : 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);
  return (
    <span
      className="relative inline-block"
      onPointerEnter={(e) => { if (e.pointerType === "mouse") setOpen(true); }}
      onPointerLeave={(e) => { if (e.pointerType === "mouse") setOpen(false); }}
    >
      <button
        type="button"
        aria-describedby={id}
        aria-expanded={open}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        onClick={() => setOpen(true)}
        onKeyDown={(e) => { if (e.key === "Escape" && open) { e.stopPropagation(); setOpen(false); } }}
        className={`cursor-help rounded-sm text-left outline-none focus-visible:ring-2 focus-visible:ring-ring ${plain ? "" : "font-medium text-foreground underline decoration-dotted decoration-from-font underline-offset-4"}`}
      >
        {children}
      </button>
      <span
        ref={tipRef}
        id={id}
        role="tooltip"
        style={{ marginLeft: shift }}
        className={`pointer-events-none absolute top-full left-1/2 z-20 mt-2 w-[min(18rem,80vw)] -translate-x-1/2 rounded-xl border border-border bg-popover p-3 text-left text-xs leading-relaxed text-popover-foreground shadow-lg transition-[opacity,translate] duration-150 motion-reduce:transition-none ${open ? "translate-y-0 opacity-100" : "-translate-y-1 opacity-0"}`}
      >
        <span className="mb-1 block font-medium text-foreground">{title}</span>
        <span className="block text-muted-foreground">{body}</span>
      </span>
    </span>
  );
}

export default Term;
