/** Shared Tailwind class strings for buttons and links, so every button of a kind looks the same. */

/** Solid black pill: the main action (Download CV, View on GitHub). */
export const primaryButton =
  "inline-flex items-center gap-2 rounded-full bg-foreground px-5 py-2.5 text-sm font-medium text-background shadow-sm outline-none transition-[translate,box-shadow] hover:-translate-y-px hover:shadow-md focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background motion-reduce:transition-none";

/** Outlined pill: secondary actions next to a primary one (Chef's Skills). */
export const secondaryButton =
  "inline-flex items-center gap-2 rounded-full border border-border bg-card px-5 py-2.5 text-sm font-medium text-foreground shadow-sm outline-none transition-[translate,box-shadow] hover:-translate-y-px hover:shadow-md focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background motion-reduce:transition-none";

/** Small outlined pill: buttons inside a plate card (documents, projects, awards). */
export const cardButton =
  "inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3.5 py-2 text-xs font-medium text-card-foreground shadow-sm outline-none transition-[translate,box-shadow,color] hover:-translate-y-px hover:shadow-md focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none";

/** Same as cardButton with slightly larger text, for links at the foot of a project card. */
export const cardLink = cardButton.replace("text-xs", "text-sm");

/** Round icon-only link (GitHub, LinkedIn, email). */
export const iconLink =
  "inline-flex size-9 items-center justify-center rounded-full border border-border bg-card text-muted-foreground shadow-sm outline-none transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring";
