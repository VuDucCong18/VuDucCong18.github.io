/** Chef's Skills pop-up: every skill as a chip, grouped into courses; hovering or tapping a chip shows where it was used. */
import * as React from "react";
import { createPortal } from "react-dom";
import { tierStyle } from "@/components/ui/sushi-conveyor-menu";
import { TERMS, TOOLS } from "@/data/glossary";
import { PLATES } from "@/data/plates";
import { SKILLS, SKILL_ROLES } from "@/data/skills";
import { useDialog } from "@/lib/use-dialog";

type Skill = (typeof SKILLS.courses)[number]["items"][number];

function placesFor(skill: Skill) {
  return skill.used.map((id) => {
    const plate = PLATES.find((p) => p.id === id);
    return { id, name: plate?.name ?? id, when: plate?.price ?? "", tier: plate?.tier ?? 1, role: SKILL_ROLES[id] ?? "" };
  });
}
const atWork = (skill: Skill) => placesFor(skill).some((p) => p.tier === 2);

/** Chef's Skills: every skill grouped into four "courses". Hover, focus or tap a skill for a card saying what it is and where it was used.
 *  The card is placed inside the panel, below the chip or above it when there is no room, and clamped to the panel's edges. */
export function SkillsViewer({ onClose }: { onClose: () => void }) {
  const cardRef = React.useRef<HTMLDivElement | null>(null);
  const [active, setActive] = React.useState<{ skill: Skill; el: HTMLElement } | null>(null);
  const [pos, setPos] = React.useState<{ left: number; top: number } | null>(null);
  const titleId = React.useId();
  // Esc closes an open skill card first, then the pop-up.
  const { closeRef, panelRef, shown } = useDialog(onClose, () => { if (!active) return false; setActive(null); return true; });

  // Place the card inside the panel: below the chip if it fits, otherwise above; clamp left/right to the panel.
  React.useLayoutEffect(() => {
    if (!active || !panelRef.current || !cardRef.current) { setPos(null); return; }
    const panel = panelRef.current.getBoundingClientRect();
    const chip = active.el.getBoundingClientRect();
    const card = cardRef.current.getBoundingClientRect();
    const m = 10, gap = 8;
    let left = chip.left - panel.left + chip.width / 2 - card.width / 2;
    left = Math.max(m, Math.min(left, panel.width - card.width - m));
    const below = chip.bottom - panel.top + gap;
    const above = chip.top - panel.top - gap - card.height;
    const top = below + card.height <= panel.height - m ? below : Math.max(m, above);
    setPos({ left, top });
  }, [active]);

  const label = "text-[11px] font-medium uppercase tracking-[0.2em] text-muted-foreground";
  const dot = <span aria-hidden="true" className="size-1.5 shrink-0 rounded-full bg-[#dc2f4b]" />;
  const info = active ? (TOOLS as Record<string, { body: string }>)[active.skill.name] ?? (TERMS as Record<string, { body: string }>)[active.skill.name] : undefined;

  return createPortal(
    <div role="dialog" aria-modal="true" aria-labelledby={titleId} className="fixed inset-0 z-[60] flex items-center justify-center p-3 text-foreground sm:p-4">
      <div aria-hidden="true" onClick={onClose} className={`absolute inset-0 bg-background/70 backdrop-blur-sm transition-opacity duration-200 motion-reduce:transition-none ${shown ? "opacity-100" : "opacity-0"}`} />
      <div
        ref={panelRef}
        onPointerDown={(e) => { if (active && !(e.target as HTMLElement).closest("[data-skill],[data-skill-card]")) setActive(null); }}
        className={`relative flex max-h-[96svh] w-[min(96vw,48rem)] flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-2xl transition-[opacity,scale] duration-200 motion-reduce:transition-none ${shown ? "scale-100 opacity-100" : "scale-[0.97] opacity-0"}`}
      >
        <header className="flex items-start gap-3 border-b border-border px-4 py-3 sm:px-5 sm:py-4">
          <div className="min-w-0 flex-1">
            <p className={label}>Skills</p>
            <h3 id={titleId} className="mt-0.5 text-lg font-medium tracking-tight sm:text-xl">Chef's Skills</h3>
            <p className="mt-0.5 text-xs text-muted-foreground sm:text-sm">Hover or tap a skill to see where I used it.</p>
          </div>
          <button ref={closeRef} type="button" onClick={onClose} className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground outline-none transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring">
            Close
            <svg aria-hidden="true" viewBox="0 0 16 16" className="size-3.5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"><path d="M3.5 3.5l9 9M12.5 3.5l-9 9" /></svg>
          </button>
        </header>
        <div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden px-4 py-3.5 sm:px-5 sm:py-5">
          <div className="grid gap-x-8 gap-y-3.5 sm:grid-cols-2 sm:gap-y-5">
            {SKILLS.courses.map((course, ci) => (
              <section key={course.title}>
                <h4 className="flex items-baseline gap-2 text-[13px] font-medium sm:text-sm">
                  <span className="font-mono text-[11px] text-muted-foreground">{String(ci + 1).padStart(2, "0")}</span>
                  {course.title}
                </h4>
                <ul className="mt-1.5 flex flex-wrap gap-1 sm:mt-2.5 sm:gap-1.5">
                  {course.items.map((it) => {
                    const work = atWork(it);
                    const on = active?.skill === it;
                    return (
                      <li key={it.name}>
                        <button
                          type="button"
                          data-skill
                          aria-expanded={on}
                          onPointerEnter={(e) => { if (e.pointerType === "mouse") setActive({ skill: it, el: e.currentTarget }); }}
                          onPointerLeave={(e) => { if (e.pointerType === "mouse") setActive((a) => (a?.skill === it ? null : a)); }}
                          onFocus={(e) => setActive({ skill: it, el: e.currentTarget })}
                          onClick={(e) => setActive({ skill: it, el: e.currentTarget })}
                          className={`inline-flex cursor-help items-center gap-1.5 rounded-full border px-2 py-0.5 text-[11px] outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring sm:px-2.5 sm:py-1 sm:text-xs ${work ? "border-foreground/25 font-medium text-foreground" : "border-border text-muted-foreground"} ${on ? "bg-foreground/[0.06]" : ""}`}
                        >
                          {work && dot}
                          {it.name}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </section>
            ))}
          </div>
        </div>
        <footer className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 border-t border-border px-4 py-2.5 text-[11px] text-muted-foreground sm:px-5 sm:py-3 sm:text-xs">
          <span>Spoken: {SKILLS.spoken}</span>
          <span className="inline-flex items-center gap-1.5">{dot}Used at work</span>
        </footer>
        {active && (
          <div
            ref={cardRef}
            data-skill-card
            role="tooltip"
            style={pos ? { left: pos.left, top: pos.top } : { left: 0, top: 0, visibility: "hidden" }}
            className="pointer-events-none absolute z-10 w-[min(20rem,calc(100%-20px))] rounded-xl border border-border bg-popover p-3 text-left text-popover-foreground shadow-lg"
          >
            <p className="text-sm font-medium">{active.skill.name}</p>
            {info && <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{info.body}</p>}
            <p className="mt-2.5 text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground">Where I used it</p>
            <ul className="mt-1.5 space-y-1.5">
              {placesFor(active.skill).map((p) => (
                <li key={p.id} className="flex items-center gap-2">
                  <img src={tierStyle(p.tier).plate} alt="" aria-hidden="true" className="size-5 shrink-0" />
                  <div className="min-w-0 text-xs leading-tight">
                    <p className="truncate font-medium text-foreground">{p.name}</p>
                    <p className="text-muted-foreground">{p.role}{p.when ? ` · ${p.when}` : ""}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>,
    document.body,
  );
}

export default SkillsViewer;
