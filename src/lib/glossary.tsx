import Term from "@/components/ui/term";
import { COMPANIES, TERMS, TOOLS, type GlossaryEntry } from "@/data/glossary";

/**
 * Turns plain text into text with hover explanations: any phrase that is a key in a glossary
 * becomes a <Term> with that entry's title and body. Longest phrases match first.
 */
type Glossary = Record<string, GlossaryEntry>;
type Matcher = { dict: Glossary; re: RegExp };

function matcher(dict: Glossary): Matcher {
  const keys = Object.keys(dict).sort((a, b) => b.length - a.length).map((k) => k.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
  return { dict, re: new RegExp(`(${keys.join("|")})`) };
}

/** Descriptions explain programmes and clubs; titles explain companies; chips also explain tools. */
const IN_TEXT = matcher(TERMS);
const IN_TITLES = matcher(COMPANIES);
const IN_CHIPS = matcher({ ...TERMS, ...TOOLS });

/** `plain` drops the dotted underline, for chips. Returns undefined when nothing matches, so callers fall back to plain text. */
function withTerms(text: string | undefined, { dict, re }: Matcher, plain = false) {
  if (!text || !re.test(text)) return undefined;
  return text.split(re).map((part, i) =>
    dict[part] ? <Term key={i} plain={plain} title={dict[part].title} body={dict[part].body}>{part}</Term> : part,
  );
}

export const explainDescription = (text?: string) => withTerms(text, IN_TEXT);
export const explainTitle = (text?: string) => withTerms(text, IN_TITLES);
export const explainChip = (text?: string) => withTerms(text, IN_CHIPS, true);
