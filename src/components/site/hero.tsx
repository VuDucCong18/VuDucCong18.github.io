import { PROFILE } from "@/data/profile";
import { ContactLinks } from "./contact-links";
import { DownloadIcon, SkillsIcon } from "./icons";
import { primaryButton, secondaryButton } from "./styles";

/** Headshot above the name line. Centred on small screens, left-aligned in the two-column layout (1024px and up). */
export function HeroIntro() {
  return (
    <span className="inline-flex flex-col items-center gap-3 min-[1024px]:items-start min-[1024px]:gap-4">
      <img
        src={PROFILE.headshot}
        alt={PROFILE.name}
        width={560}
        height={560}
        className="size-32 shrink-0 rounded-full object-cover shadow-md ring-[3px] ring-background outline outline-1 outline-border min-[1024px]:size-44"
      />
      <span>{PROFILE.name} · {PROFILE.role}</span>
    </span>
  );
}

/** Download CV, Chef's Skills and the contact row. */
export function HeroActions({ onOpenSkills }: { onOpenSkills: () => void }) {
  return (
    <div className="flex flex-wrap items-center justify-center gap-2.5 min-[1024px]:justify-start">
      <a href={PROFILE.resume.href} download={PROFILE.resume.file} className={primaryButton}>
        <DownloadIcon />
        Download CV
      </a>
      <button type="button" onClick={onOpenSkills} aria-haspopup="dialog" className={secondaryButton}>
        <SkillsIcon />
        Chef's Skills
      </button>
      <div className="mt-1 basis-full">
        <ContactLinks />
      </div>
    </div>
  );
}
