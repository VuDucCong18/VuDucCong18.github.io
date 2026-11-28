/**
 * Chef's Skills pop-up (components/ui/skills-viewer.tsx).
 * Explanations come from data/glossary.ts (TOOLS); places, dates and plate colours from data/plates.ts.
 */
/** Chef's Skills pop-up: skills grouped into courses. Each skill lists where it was used (plate ids, or "smu" for coursework);
 *  a skill counts as "used at work" when any of those is an Experience plate. */
export const SKILLS: { courses: { title: string; items: { name: string; used: string[] }[] }[]; spoken: string } = {
  courses: [
    { title: "Languages and frameworks", items: [
      { name: "Python", used: ["sembcorp", "sephora", "fintech", "insurance"] },
      { name: "SQL", used: ["sephora", "shopee", "fintech"] },
      { name: "VBA", used: ["sembcorp"] },
      { name: "R", used: ["smu"] },
      { name: "JavaScript", used: ["smu"] },
      { name: "HTML/CSS", used: ["smu"] },
      { name: "FastAPI", used: ["smu"] },
      { name: "SQLAlchemy", used: ["smu"] },
    ] },
    { title: "Analytics engineering", items: [
      { name: "dbt", used: ["sephora", "fintech"] },
      { name: "BigQuery", used: ["sephora"] },
      { name: "Airflow", used: ["sephora", "shopee"] },
      { name: "Presto SQL", used: ["shopee"] },
      { name: "Spark SQL", used: ["shopee"] },
      { name: "CI/CD", used: ["sephora"] },
      { name: "Snowflake", used: ["fintech"] },
      { name: "Dimensional modelling", used: ["sephora", "fintech"] },
    ] },
    { title: "Machine learning and analysis", items: [
      { name: "A/B Testing", used: ["shopee", "aire"] },
      { name: "Pandas", used: ["insurance"] },
      { name: "NumPy", used: ["insurance"] },
      { name: "Scikit-learn", used: ["insurance"] },
      { name: "XGBoost", used: ["insurance"] },
      { name: "TensorFlow", used: ["smu"] },
      { name: "PyTorch", used: ["smu"] },
    ] },
    { title: "BI and automation", items: [
      { name: "Power BI", used: ["sembcorp", "aire"] },
      { name: "Power Automate", used: ["sembcorp"] },
      { name: "Power Apps", used: ["sembcorp"] },
      { name: "Copilot Studio", used: ["sembcorp"] },
      { name: "Excel", used: ["sembcorp", "shopee", "aire"] },
      { name: "DOMO", used: ["sephora"] },
      { name: "GitHub", used: ["sephora", "fintech", "insurance"] },
      { name: "Streamlit", used: ["fintech"] },
    ] },
  ],
  spoken: "Vietnamese (native) · English (fluent)",
};

/** How each place shows up in a skill's hover card. Name, dates and plate colour come from PLATES. */
export const SKILL_ROLES: Record<string, string> = {
  sembcorp: "Data & AI Analyst",
  sephora: "Analytics Engineer Intern",
  shopee: "Data Analyst Intern",
  aire: "BI & Marketing Analytics Intern",
  fintech: "Personal project",
  insurance: "Personal project",
  smu: "Coursework",
};
