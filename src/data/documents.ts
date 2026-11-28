/**
 * Files and links attached to plate cards.
 *
 * DOCS        education certificates and transcripts, shown in the document viewer (keyed by plate id)
 * AWARD_DOCS  award documents shown from a role's card
 * REPORTS     project report PDFs offered as downloads
 * EXTRA_LINKS links shown above "View on GitHub" on a project card
 *
 * All certificate pages are redacted images, never the original PDFs: FIN, student numbers, date of birth,
 * serial/certificate numbers, signatures and other students' names are blacked out.
 */
const page = (dir: string, f: string) => `assets/docs/${dir}/${f}.webp`;

export const DOCS: Record<string, { label: string; pages: string[]; expanded?: boolean }[]> = {
  amk: [
    { label: "O-Level Certificate", pages: [page("secondary", "olevel-1"), page("secondary", "olevel-2")] },
    { label: "Graduation Certificate", pages: [page("secondary", "graduation-1")] },
    { label: "Testimonial", pages: [page("secondary", "testimonial-1")] },
  ],
  "ngee-ann": [
    { label: "Awards", pages: [1, 2, 3, 4].map((n) => page("ngee-ann", `awards-${n}`)) },
    { label: "Diploma & Certificates", pages: [1, 2, 3].map((n) => page("ngee-ann", `diploma-${n}`)) },
    { label: "Transcript", pages: [1, 2].map((n) => page("ngee-ann", `transcript-${n}`)) },
    { label: "Recommendation Letter", pages: [page("ngee-ann", "letter-1")] },
  ],
  smu: [
    { label: "Degree Certificate", pages: [page("smu", "cert-1")] },
    // Dense pages: open these in the large viewer so the small print is readable straight away.
    { label: "Transcript", pages: [1, 2, 3].map((n) => page("smu", `transcript-${n}`)), expanded: true },
    { label: "Co-Curricular Transcript", pages: [1, 2, 3, 4].map((n) => page("smu", `cocurricular-${n}`)), expanded: true },
  ],
};

/** Award documents shown from a role's card (redacted page images). */
export const AWARD_DOCS: Record<string, { button: string; label: string; pages: string[] }[]> = {
  // DKHMCC announcement, 14 Jan 2025, condensed to one page (banner dropped): winner, two runners-up and two special mentions. Other students' names and my student email are blacked out.
  aire: [
    {
      button: "Ruth Chiang Outstanding Intern · Top 5",
      label: "Ruth Chiang Outstanding Intern Awards 2024 · Special Mention",
      pages: ["assets/docs/aire/ruth-chiang.webp"],
    },
  ],
};

/** Project report PDFs, offered as a download on the project card (from the live site; Fintech's print header and footer cropped off). */
export const REPORTS: Record<string, { href: string; file: string }> = {
  fintech: { href: "assets/reports/fintech-report.pdf", file: "Vu-Duc-Cong-Fintech-Transaction-Analytics-Report.pdf" },
  insurance: { href: "assets/reports/insurance-report.pdf", file: "Vu-Duc-Cong-Phone-Insurance-Forecasting-Report.pdf" },
};

/** Extra links shown beside "View on GitHub" on a project card. */
export const EXTRA_LINKS: Record<string, { label: string; href: string }[]> = {
  fintech: [{ label: "Live dashboard", href: "https://duccongvuanalytics.streamlit.app/" }],
};
