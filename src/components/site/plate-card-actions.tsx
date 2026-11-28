import * as React from "react";
import type { ConveyorDish } from "@/components/ui/sushi-conveyor-menu";
import type { ViewerDoc } from "@/components/ui/doc-viewer";
import { AWARD_DOCS, DOCS, EXTRA_LINKS, REPORTS } from "@/data/documents";
import { PROFILE } from "@/data/profile";
import { WORK, type WorkProject } from "@/data/projects";
import { AwardIcon, DocIcon, DownloadIcon, GitHubIcon, LiveIcon, ProjectIcon } from "./icons";
import { cardButton, cardLink, primaryButton } from "./styles";

type Handlers = {
  onOpenDoc: (doc: ViewerDoc) => void;
  onOpenProject: (project: WorkProject, company: string) => void;
};

/** A small uppercase heading over a row of buttons. */
function Group({ heading, children }: { heading: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-2 sm:items-start">
      <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-muted-foreground">{heading}</p>
      <div className="flex flex-wrap justify-center gap-2 sm:justify-start">{children}</div>
    </div>
  );
}

/**
 * The buttons at the foot of a plate's card, decided by what the plate has:
 * - Education plates: one button per certificate or transcript (data/documents.ts DOCS)
 * - Plates with write-ups: project buttons, any award documents, then report / live dashboard / GitHub links
 * - Anything else: Download CV
 */
export function PlateCardActions({ item, onOpenDoc, onOpenProject }: { item: ConveyorDish } & Handlers) {
  const docs = DOCS[item.id];
  if (docs)
    return (
      <div className="flex flex-wrap justify-center gap-2 sm:justify-start">
        {docs.map((d) => (
          <button key={d.label} type="button" className={cardButton} onClick={() => onOpenDoc(d)} aria-haspopup="dialog">
            <DocIcon />{d.label}
          </button>
        ))}
      </div>
    );

  const work = WORK[item.id];
  if (work) {
    const awards = AWARD_DOCS[item.id] ?? [];
    const report = REPORTS[item.id];
    // Links run top to bottom with GitHub last, as the solid button at the foot of the card.
    const links = item.link ? [...(EXTRA_LINKS[item.id] ?? []), item.link] : [];
    return (
      <div className="flex flex-col items-center gap-4 sm:items-start">
        <Group heading={item.link ? "Inside the project" : "Projects"}>
          {work.map((w) => (
            <button key={w.title} type="button" className={cardButton} onClick={() => onOpenProject(w, item.name)} aria-haspopup="dialog">
              <ProjectIcon />{w.title}
            </button>
          ))}
        </Group>
        {awards.length > 0 && (
          <Group heading="Award">
            {awards.map((a) => (
              <button key={a.label} type="button" className={cardButton} onClick={() => onOpenDoc({ label: a.label, pages: a.pages })} aria-haspopup="dialog">
                <AwardIcon />{a.button}
              </button>
            ))}
          </Group>
        )}
        {links.length > 0 && (
          <div className="flex flex-col items-center gap-3 sm:items-start">
            {report && (
              <a href={report.href} download={report.file} className={cardLink}>
                <DownloadIcon />Download report
              </a>
            )}
            {links.map((l, i) => {
              const github = i === links.length - 1;
              return (
                <a key={l.href} href={l.href} target="_blank" rel="noopener noreferrer" className={github ? primaryButton : cardLink}>
                  {github ? <GitHubIcon /> : <LiveIcon />}{l.label}
                </a>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  return (
    <a href={PROFILE.resume.href} download={PROFILE.resume.file} className={primaryButton}>
      <DownloadIcon />Download CV
    </a>
  );
}
