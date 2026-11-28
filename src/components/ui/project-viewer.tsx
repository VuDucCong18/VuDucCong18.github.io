/** Pop-up with one project write-up from data/projects.ts. Sections only appear when the write-up has them. */
import * as React from "react";
import { createPortal } from "react-dom";
import type { WorkProject } from "@/data/projects";
import { useDialog } from "@/lib/use-dialog";

/** A readable pop-up for one project write-up: background, what went wrong, cost, what was built, outcome and tools. Close with the button, Esc or the backdrop. */
function Bullets({ lines }: { lines: string[] }) {
  return (
    <ul className="mt-2 space-y-1.5">
      {lines.map((line) => (
        <li key={line} className="flex gap-2.5 text-card-foreground/90">
          <span aria-hidden="true" className="mt-[0.55em] size-1.5 shrink-0 rounded-full bg-[#dc2f4b]" />
          {line}
        </li>
      ))}
    </ul>
  );
}

export function ProjectViewer({ project, company, renderTool, onClose }: {
  project: WorkProject;
  company?: string;
  renderTool?: (tool: string) => React.ReactNode;
  onClose: () => void;
}) {
  const { closeRef, panelRef, shown } = useDialog(onClose);
  const titleId = React.useId();

  const label = "text-[11px] font-medium uppercase tracking-[0.2em] text-muted-foreground";

  return createPortal(
    <div role="dialog" aria-modal="true" aria-labelledby={titleId} className="fixed inset-0 z-[60] flex items-center justify-center p-4 text-foreground">
      <div aria-hidden="true" onClick={onClose} className={`absolute inset-0 bg-background/70 backdrop-blur-sm transition-opacity duration-200 motion-reduce:transition-none ${shown ? "opacity-100" : "opacity-0"}`} />
      <div
        ref={panelRef}
        className={`relative flex max-h-[min(86vh,46rem)] w-[min(92vw,42rem)] flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-2xl transition-[opacity,scale] duration-200 motion-reduce:transition-none ${shown ? "scale-100 opacity-100" : "scale-[0.97] opacity-0"}`}
      >
        <header className="flex items-start gap-3 border-b border-border px-5 py-4">
          <div className="min-w-0 flex-1">
            {company && <p className={label}>{company} · {project.kind ?? "Project"}</p>}
            <h3 id={titleId} className="mt-1 text-xl font-medium tracking-tight">{project.title}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{project.summary}</p>
          </div>
          <button ref={closeRef} type="button" onClick={onClose} className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground outline-none transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring">
            Close
            <svg aria-hidden="true" viewBox="0 0 16 16" className="size-3.5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"><path d="M3.5 3.5l9 9M12.5 3.5l-9 9" /></svg>
          </button>
        </header>
        <div tabIndex={0} className="min-h-0 flex-1 space-y-6 overflow-auto px-5 py-5 text-sm leading-relaxed outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring">
          {project.background && (
            <section>
              <h4 className={label}>{project.backgroundLabel ?? "Background"}</h4>
              <p className="mt-1.5 text-card-foreground/90">{project.background}</p>
            </section>
          )}
          {project.problem && (
            <section>
              <h4 className={label}>{project.problemLabel ?? "What went wrong"}</h4>
              <p className="mt-1.5 text-card-foreground/90">{project.problem}</p>
            </section>
          )}
          {project.figure && (
            <figure className="space-y-1.5">
              <img src={project.figure.src} alt={project.figure.alt} className="w-full rounded-xl border border-border bg-white" />
              {project.figure.caption && <figcaption className="text-xs text-muted-foreground">{project.figure.caption}</figcaption>}
            </figure>
          )}
          {project.tables?.map((t) => (
            <section key={t.title}>
              <h4 className={label}>{t.title}</h4>
              <div className="mt-2 overflow-x-auto rounded-xl border border-border">
                <table className={`w-full text-left text-[13px] tabular-nums ${t.columns.length > 4 ? "min-w-[26rem]" : ""}`}>
                  <thead className="bg-muted/60 text-xs text-muted-foreground">
                    <tr>{t.columns.map((c, i) => <th key={c} scope="col" className={`px-3 py-2 font-medium ${i > 0 && c !== "Role" ? "text-right" : ""}`}>{c}</th>)}</tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {t.rows.map((r, ri) => {
                      const best = ri === t.best;
                      return (
                        <tr key={r[0]} className={best ? "bg-[#dc2f4b]/[0.07] font-medium text-foreground" : "text-card-foreground/85"}>
                          {r.map((cell, ci) => ci === 0
                            ? <th key={ci} scope="row" className="px-3 py-2 font-medium">{cell}{best && <span className="ml-2 rounded-full bg-[#dc2f4b] px-1.5 py-0.5 align-middle text-[9px] font-bold uppercase tracking-wider text-white">Best</span>}</th>
                            : <td key={ci} className={`px-3 py-2 ${t.columns[ci] === "Role" ? "text-left text-muted-foreground" : "text-right"}`}>{cell}</td>)}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              {t.note && <p className="mt-1.5 text-xs text-muted-foreground">{t.note}</p>}
            </section>
          ))}
          {project.cost && project.cost.length > 0 && (
            <section>
              <h4 className={label}>{project.costLabel ?? "What it cost"}</h4>
              <Bullets lines={project.cost} />
            </section>
          )}
          {project.built && project.built.length > 0 && (
          <section>
            <h4 className={label}>{project.builtLabel ?? "What I built"}</h4>
            <ol className="mt-2.5 space-y-3">
              {project.built.map((s, i) => (
                <li key={`${i}-${s.step}`} className="flex gap-3">
                  <span aria-hidden="true" className="flex size-6 shrink-0 items-center justify-center rounded-full bg-foreground text-[11px] font-semibold text-background">{i + 1}</span>
                  <p className="text-card-foreground/90"><span className="font-medium text-foreground">{s.step}.</span> {s.text}</p>
                </li>
              ))}
            </ol>
          </section>
          )}
          {project.outcome && project.outcome.length > 0 && (
            <section>
              <h4 className={label}>{project.outcomeLabel ?? "Outcome"}</h4>
              <Bullets lines={project.outcome} />
            </section>
          )}
          {project.tools && project.tools.length > 0 && (
          <section>
            <h4 className={label}>Tools and what they did</h4>
            <dl className="mt-2 divide-y divide-border rounded-xl border border-border">
              {project.tools.map((t) => (
                <div key={t.name} className="grid gap-1 px-3.5 py-2.5 sm:grid-cols-[9.5rem_1fr] sm:gap-4">
                  <dt className="font-medium text-foreground">{renderTool?.(t.name) ?? t.name}</dt>
                  <dd className="text-card-foreground/85">{t.use}</dd>
                </div>
              ))}
            </dl>
          </section>
          )}
        </div>
      </div>
    </div>,
    document.body,
  );
}

export default ProjectViewer;
