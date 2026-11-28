import * as React from "react";
import SushiConveyorMenu from "@/components/ui/sushi-conveyor-menu";
import DocViewer, { type ViewerDoc } from "@/components/ui/doc-viewer";
import ProjectViewer from "@/components/ui/project-viewer";
import SkillsViewer from "@/components/ui/skills-viewer";
import { HeroActions, HeroIntro } from "@/components/site/hero";
import { PlateCardActions } from "@/components/site/plate-card-actions";
import { LEGEND, PLATES } from "@/data/plates";
import type { WorkProject } from "@/data/projects";
import { explainChip, explainDescription, explainTitle } from "@/lib/glossary";

/**
 * The whole page: the sushi-belt hero plus the three pop-ups it can open.
 * Content lives in src/data; this file only wires it together and holds which pop-up is open.
 */
export default function App() {
  const [doc, setDoc] = React.useState<ViewerDoc | null>(null);
  const [skillsOpen, setSkillsOpen] = React.useState(false);
  const [project, setProject] = React.useState<{ project: WorkProject; company: string } | null>(null);

  return (
    <main className="relative flex min-h-svh w-full items-center justify-center bg-background text-foreground">
      <SushiConveyorMenu
        items={PLATES}
        legend={LEGEND}
        eyebrow={<HeroIntro />}
        heading="A career served fresh, one plate at a time."
        caption="Hover to stop the belt, flick to spin it, pick a plate to find out more about me."
        autoplay
        renderTitle={(item) => explainTitle(item.name)}
        renderDescription={(item) => explainDescription(item.description)}
        renderDetail={(detail) => explainChip(detail)}
        renderActions={(item) => (
          <PlateCardActions item={item} onOpenDoc={setDoc} onOpenProject={(p, company) => setProject({ project: p, company })} />
        )}
        labels={{ add: "Download CV", close: "Close", previous: "Previous plate", next: "Next plate", pause: "Pause belt" }}
        action={<HeroActions onOpenSkills={() => setSkillsOpen(true)} />}
      />
      {doc && <DocViewer doc={doc} onClose={() => setDoc(null)} />}
      {skillsOpen && <SkillsViewer onClose={() => setSkillsOpen(false)} />}
      {project && (
        <ProjectViewer project={project.project} company={project.company} renderTool={explainChip} onClose={() => setProject(null)} />
      )}
    </main>
  );
}
