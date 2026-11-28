/** Full-screen viewer for certificates, transcripts and award letters: page images with zoom, expand and page arrows. */
import * as React from "react";
import { createPortal } from "react-dom";

export interface ViewerDoc {
  label: string;
  /** Page images, in order. */
  pages: string[];
  /** Open in the large viewer (for dense pages such as transcripts). */
  expanded?: boolean;
}

const ZOOMS = [0.75, 1, 1.25, 1.5, 2, 2.5, 3];
const control =
  "inline-flex size-8 items-center justify-center rounded-full border border-border bg-card text-muted-foreground shadow-sm outline-none transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-40";

/** A modest, readable pop-up for document page images: zoom, page arrows, close (button, Esc or backdrop). */
export function DocViewer({ doc, onClose }: { doc: ViewerDoc; onClose: () => void }) {
  const [page, setPage] = React.useState(0);
  const [zoom, setZoom] = React.useState(1);
  const [expanded, setExpanded] = React.useState(!!doc.expanded);
  const closeRef = React.useRef<HTMLButtonElement | null>(null);
  const panelRef = React.useRef<HTMLDivElement | null>(null);
  const scrollRef = React.useRef<HTMLDivElement | null>(null);
  const [shown, setShown] = React.useState(false);
  const titleId = React.useId();
  const total = doc.pages.length;
  const z = ZOOMS.indexOf(zoom);

  React.useEffect(() => {
    const before = document.activeElement as HTMLElement | null;
    closeRef.current?.focus({ preventScroll: true });
    const raf = requestAnimationFrame(() => setShown(true));
    return () => { cancelAnimationFrame(raf); before?.focus?.({ preventScroll: true }); };
  }, []);

  React.useEffect(() => { scrollRef.current?.scrollTo({ top: 0, left: 0 }); }, [page]);

  const go = (d: number) => setPage((p) => Math.min(total - 1, Math.max(0, p + d)));

  // While open, the viewer owns the keyboard: keys are caught on window (capture phase) and stopped there,
  // so the plate dialog underneath never reacts (e.g. Esc closing it), even if focus has drifted to <body>.
  const keys = React.useRef((e: KeyboardEvent) => { void e; });
  keys.current = (e: KeyboardEvent) => {
    const handled = ["Escape", "ArrowLeft", "ArrowRight", "+", "=", "-", "Tab"].includes(e.key);
    if (!handled) return;
    e.stopPropagation();
    if (e.key === "Escape") { e.preventDefault(); onClose(); }
    else if (e.key === "ArrowRight") go(1);
    else if (e.key === "ArrowLeft") go(-1);
    else if (e.key === "+" || e.key === "=") setZoom(ZOOMS[Math.min(ZOOMS.length - 1, z + 1)]);
    else if (e.key === "-") setZoom(ZOOMS[Math.max(0, z - 1)]);
    else if (e.key === "Tab") {
      const nodes = [...(panelRef.current?.querySelectorAll<HTMLElement>("button:not(:disabled), [tabindex='0']") ?? [])];
      const first = nodes[0], last = nodes.at(-1);
      if (!first || !last) return;
      const inside = panelRef.current?.contains(document.activeElement);
      if (!inside) { e.preventDefault(); first.focus(); }
      else if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  };
  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => keys.current(e);
    window.addEventListener("keydown", onKey, true);
    return () => window.removeEventListener("keydown", onKey, true);
  }, []);

  // Keep focus inside when a page button becomes disabled under the pointer.
  React.useEffect(() => {
    if (panelRef.current && !panelRef.current.contains(document.activeElement)) scrollRef.current?.focus({ preventScroll: true });
  }, [page]);

  return createPortal(
    <div role="dialog" aria-modal="true" aria-labelledby={titleId} className="fixed inset-0 z-[60] flex items-center justify-center p-4 text-foreground">
      <div aria-hidden="true" onClick={onClose} className={`absolute inset-0 bg-background/70 backdrop-blur-sm transition-opacity duration-200 motion-reduce:transition-none ${shown ? "opacity-100" : "opacity-0"}`} />
      <div
        ref={panelRef}
        className={`relative flex flex-col ${expanded ? "h-[94vh] w-[min(96vw,76rem)]" : "h-[min(82vh,50rem)] w-[min(92vw,38rem)]"} overflow-hidden rounded-2xl border border-border bg-card shadow-2xl transition-[opacity,scale] duration-200 motion-reduce:transition-none ${shown ? "scale-100 opacity-100" : "scale-[0.97] opacity-0"}`}
      >
        <header className="flex items-center gap-2 border-b border-border px-4 py-2.5">
          <h3 id={titleId} className="min-w-0 flex-1 truncate text-sm font-medium">{doc.label}</h3>
          <button type="button" aria-label="Zoom out" className={control} disabled={z <= 0} onClick={() => setZoom(ZOOMS[z - 1])}>
            <svg aria-hidden="true" viewBox="0 0 16 16" className="size-3.5" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"><path d="M3.5 8h9" /></svg>
          </button>
          <span className="w-11 text-center text-xs tabular-nums text-muted-foreground" aria-live="polite">{Math.round(zoom * 100)}%</span>
          <button type="button" aria-label="Zoom in" className={control} disabled={z >= ZOOMS.length - 1} onClick={() => setZoom(ZOOMS[z + 1])}>
            <svg aria-hidden="true" viewBox="0 0 16 16" className="size-3.5" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"><path d="M8 3.5v9M3.5 8h9" /></svg>
          </button>
          <button
            type="button"
            aria-label={expanded ? "Shrink viewer" : "Expand viewer"}
            aria-pressed={expanded}
            title={expanded ? "Shrink" : "Expand"}
            className={control}
            onClick={() => setExpanded((v) => !v)}
          >
            {expanded
              ? <svg aria-hidden="true" viewBox="0 0 16 16" className="size-3.5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M6.5 2.5v4h-4M9.5 13.5v-4h4M6.5 6.5 2.5 2.5M9.5 9.5l4 4" /></svg>
              : <svg aria-hidden="true" viewBox="0 0 16 16" className="size-3.5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M9.5 2.5h4v4M6.5 13.5h-4v-4M13.5 2.5 9 7M2.5 13.5 7 9" /></svg>}
          </button>
          <button ref={closeRef} type="button" onClick={onClose} className="ml-1 inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium text-muted-foreground outline-none transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring">
            Close
            <svg aria-hidden="true" viewBox="0 0 16 16" className="size-3.5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"><path d="M3.5 3.5l9 9M12.5 3.5l-9 9" /></svg>
          </button>
        </header>
        <div ref={scrollRef} tabIndex={0} aria-label={`${doc.label}, page ${page + 1} of ${total}`} className="min-h-0 flex-1 overflow-auto bg-muted p-3 outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring">
          <img
            src={doc.pages[page]}
            alt={`${doc.label}, page ${page + 1} of ${total}`}
            draggable={false}
            className="mx-auto block h-auto max-w-none rounded-md bg-white shadow-sm select-none"
            style={{ width: `${zoom * 100}%` }}
          />
        </div>
        {total > 1 && (
          <footer className="flex items-center justify-center gap-3 border-t border-border px-4 py-2">
            <button type="button" aria-label="Previous page" className={control} disabled={page === 0} onClick={() => go(-1)}>
              <svg aria-hidden="true" viewBox="0 0 16 16" className="size-3.5" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M10 3.5 5.5 8l4.5 4.5" /></svg>
            </button>
            <span className="font-mono text-[11px] tracking-[0.2em] text-muted-foreground">{String(page + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}</span>
            <button type="button" aria-label="Next page" className={control} disabled={page === total - 1} onClick={() => go(1)}>
              <svg aria-hidden="true" viewBox="0 0 16 16" className="size-3.5" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M6 3.5 10.5 8 6 12.5" /></svg>
            </button>
          </footer>
        )}
      </div>
    </div>,
    document.body,
  );
}

export default DocViewer;
