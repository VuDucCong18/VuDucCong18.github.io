import { PROFILE } from "@/data/profile";
import { EmailIcon, GitHubIcon, LinkedInIcon, WhatsAppIcon } from "./icons";
import { iconLink } from "./styles";

/** GitHub, LinkedIn, email and WhatsApp, shown under the hero buttons. */
export function ContactLinks() {
  return (
    <nav aria-label="Contact" className="flex flex-wrap items-center justify-center gap-2 min-[1024px]:justify-start">
      <a href={PROFILE.github} target="_blank" rel="noopener noreferrer" aria-label="GitHub" className={iconLink}>
        <GitHubIcon />
      </a>
      <a href={PROFILE.linkedin} target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" className={iconLink}>
        <LinkedInIcon />
      </a>
      <a href={`mailto:${PROFILE.email}`} aria-label="Email" className={iconLink}>
        <EmailIcon />
      </a>
      <a
        href={PROFILE.whatsapp.href}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`Message ${PROFILE.whatsapp.display} on WhatsApp`}
        className="inline-flex h-9 items-center gap-2 rounded-full border border-border bg-card px-3.5 text-sm text-muted-foreground shadow-sm outline-none transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
      >
        <WhatsAppIcon />
        <span className="tabular-nums">{PROFILE.whatsapp.display}</span>
      </a>
    </nav>
  );
}
