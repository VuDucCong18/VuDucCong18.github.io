/**
 * Hover explanations (see lib/glossary.tsx for how they are applied).
 *
 * COMPANIES  shown when hovering a card's title
 * TERMS      programmes, exams and clubs, in descriptions and chips
 * TOOLS      what each tool or skill is for, in chips, project pop-ups and Chef's Skills
 *
 * To add one, add an entry whose key is the exact text that appears on the site.
 */
export type GlossaryEntry = { title: string; body: string };

/** Company blurbs, shown when hovering a card's title. */
export const COMPANIES: Record<string, GlossaryEntry> = {
  // Sources: Sembcorp Annual Report 2024 (Temasek 49.4%); Temasek "Sembcorp: Powering Singapore's Energy Transition";
  // SGX announcements 28 Mar 2025 (Meta / Malkoha 150MWp Kranji floating solar) and 28 Jan 2026 (Micron PPA expanded to 600MW)
  "Sembcorp Industries Ltd": {
    title: "Sembcorp Industries Ltd",
    body: "A Singapore Exchange-listed energy company, with Temasek as its largest shareholder (about half its shares). It supplies power, natural gas, solar energy and utilities. Its customers include Micron, which takes up to 600MW for its Singapore chip plants, and Meta, for which it is building a 150MWp floating solar farm on Kranji Reservoir.",
  },
  // Sources: jobs.sephora.com (35 markets, 3,200+ points of sale); Sephora SEA careers pages (markets run from Singapore)
  // Sources: Momentum Works via DealStreetAsia (53% of SEA platform e-commerce in 2025); Shopee 10th-anniversary release (SEA, Taiwan, Brazil); Sea Ltd
  // Sources: DSG Consumer Partners (Aire, Adult Pull-Up Pants launched mid-2023); SMU Office of Impact interview; Aire internship report (SMU BIG incubator)
  Aire: {
    title: "Aire",
    body: "A Singapore senior-care brand by XEL Lifecare that makes adult care products, starting with its Adult Pull-Up Pants launched in mid-2023. Backed by DSG Consumer Partners, it has grown into a leading senior-care brand in Singapore. When I joined in 2024, it was a one-year-old start-up in SMU's Business Innovations Generator incubator.",
  },
  Shopee: {
    title: "Shopee",
    body: "Southeast Asia's largest e-commerce platform, with about half of the region's platform e-commerce market in 2025. Headquartered in Singapore, it operates across Southeast Asia, Taiwan and Brazil, and belongs to Sea Limited (NYSE: SE), alongside Garena and Monee.",
  },
  Sephora: {
    title: "Sephora",
    body: "The world's leading prestige beauty retailer, part of LVMH, the luxury group behind Louis Vuitton and Dior. It operates in 35 markets with more than 3,200 points of sale. Its Southeast Asia team, based in Singapore, runs stores and online shops in Singapore, Malaysia, Thailand, Australia, New Zealand and the Philippines, with franchise partners in India and Indonesia.",
  },
};

/** Programmes, exams and clubs explained when hovered in a plate's description or chips. */
export const TERMS: Record<string, GlossaryEntry> = {
  // Source: SMU work-study programme pages (SCIS, School of Accountancy): work at least four days, study up to one day a week, about 20+ weeks
  "Work-study internship": {
    title: "Work-study internship",
    body: "An SMU work-study elective: a credit-bearing internship taken during the school term. Students work at least four days a week at the company and study on campus up to one day a week, for about five to six months.",
  },
  // Source: MOE, moe.gov.sg/international-students/s-aeis
  "S-AEIS": {
    title: "S-AEIS: Supplementary Admissions Exercise for International Students",
    body: "MOE's mid-year entry route for international students. Applicants sit centralised English and Mathematics tests, and only those who pass are offered a place in a Singapore school that same year.",
  },
  // Source: MOE, moe.gov.sg/news/press-releases (SYF 2026) and parliamentary reply on SYF (2019)
  SYF: {
    title: "SYF: Singapore Youth Festival",
    body: "Singapore's longest-running youth arts festival, organised by MOE since 1966. At the Arts Presentation, school performing-arts groups take the stage and are assessed on their performance.",
  },
  // Source: SMUBIA, smubia.com/DAP and smubia.com/WhatWeDo
  "Data Associate Programme": {
    title: "Data Associate Programme (DAP)",
    body: "SMU Business Intelligence & Analytics Club's flagship programme. A selective cohort spends a semester learning core machine learning through weekly co-learning sessions, while small teams build and present their own data project with mentors.",
  },
  // Source: SMU, smu.edu.sg arts & culture clubs; SMU Arts Festival 2025 (return of RE:TURN)
  "SMU Eurhythmix": {
    title: "SMU Eurhythmix (EMIX)",
    body: "SMU's premier hip-hop dance club, and the university's oldest and largest dance club. It stages its own productions, performs at the SMU Arts Festival and competes in Singapore and overseas.",
  },
  // Source: SEAB, seab.gov.sg/gce-o-level/about-gce-o-level
  "GCE O-Levels": {
    title: "GCE O-Levels: Singapore-Cambridge General Certificate of Education (Ordinary Level)",
    body: "Singapore's national exam at the end of secondary school, set jointly by MOE, SEAB and Cambridge. A1 is the top grade, and results decide entry to polytechnic or junior college.",
  },
};

/** What each tool is for, shown when hovering a tool chip on any card. */
export const TOOLS: Record<string, GlossaryEntry> = {
  "Power BI": { title: "Power BI", body: "Microsoft's business intelligence tool for turning data into interactive dashboards and reports that teams can explore and share." },
  "Power Automate": { title: "Power Automate", body: "Microsoft's workflow automation tool. It connects apps such as SharePoint, Outlook and Teams so repetitive steps run on their own." },
  "Power Apps": { title: "Power Apps", body: "Microsoft's low-code platform for building custom business apps, such as forms and trackers that run on company data." },
  "Copilot Studio": { title: "Copilot Studio", body: "Microsoft's platform for building AI agents that answer questions and take actions on top of company data." },
  Snowflake: { title: "Snowflake", body: "A cloud data warehouse that stores data and runs SQL on it at scale, separating storage from computing power." },
  SQL: { title: "SQL", body: "The standard language for asking questions of databases: filtering, joining and summarising tables." },
  Streamlit: { title: "Streamlit", body: "A Python framework for turning data scripts into interactive web apps and dashboards." },
  Pandas: { title: "Pandas", body: "Python's go-to library for loading, cleaning and reshaping tables of data." },
  "Scikit-learn": { title: "Scikit-learn", body: "Python's standard machine learning library, with models, data splitting, cross-validation and scaling built in." },
  XGBoost: { title: "XGBoost", body: "A fast machine learning method that builds decision trees one after another, each fixing the mistakes of the last. Often the most accurate on tables of data." },
  Matplotlib: { title: "Matplotlib", body: "Python's core charting library, used to plot data and model results." },
  dbt: { title: "dbt", body: "A tool for building data models in SQL, with testing and documentation built in, so raw tables become clean, trusted ones step by step." },
  BigQuery: { title: "BigQuery", body: "Google Cloud's data warehouse, which stores very large datasets and runs SQL queries on them in seconds." },
  Airflow: { title: "Airflow", body: "A scheduler for data pipelines. It runs each step in the right order at the right time, and retries or alerts when something fails." },
  GitHub: { title: "GitHub", body: "Where the team's code lives, with every change recorded, so work can be reviewed, combined and rolled back safely." },
  DOMO: { title: "DOMO", body: "A cloud business intelligence platform for building dashboards. It can also transform data, though that logic stays locked inside the tool." },
  "CI/CD": { title: "CI/CD", body: "Continuous integration and delivery: automatic checks that test every code change before it goes live, then release it in a consistent way." },
  "Presto SQL": { title: "Presto SQL", body: "A fast SQL engine for querying very large datasets where they are stored, often used for quick analysis across big data tables." },
  "Spark SQL": { title: "Spark SQL", body: "SQL on Apache Spark, which splits heavy queries across many machines so huge datasets can be processed quickly." },
  Excel: { title: "Excel", body: "Microsoft's spreadsheet tool, used here for reports and trackers with filters, pivot tables and charts." },
  "A/B Testing": { title: "A/B Testing", body: "Splitting users at random into groups that get different versions, such as different vouchers or none, then comparing results to see what truly made the difference." },
  R: { title: "R", body: "A programming language built for statistics and data analysis." },
  JavaScript: { title: "JavaScript", body: "The programming language of the web, used to make pages interactive." },
  "HTML/CSS": { title: "HTML/CSS", body: "The building blocks of web pages: HTML gives the structure, CSS the look." },
  FastAPI: { title: "FastAPI", body: "A Python framework for building fast web APIs, so other apps can request data or predictions." },
  SQLAlchemy: { title: "SQLAlchemy", body: "A Python library for talking to databases, writing queries as Python code." },
  NumPy: { title: "NumPy", body: "Python's core library for fast maths on large arrays of numbers." },
  TensorFlow: { title: "TensorFlow", body: "Google's framework for building and training deep learning models." },
  PyTorch: { title: "PyTorch", body: "Meta's framework for building and training deep learning models, popular in research." },
  "Dimensional modelling": { title: "Dimensional modelling", body: "Organising data into fact tables (events, like sales) and dimension tables (who, what, where), so reports are fast and easy to build." },
  VBA: { title: "VBA", body: "Visual Basic for Applications, the scripting language built into Excel. Used to automate cleaning and reshaping of spreadsheet data." },
  Python: { title: "Python", body: "A general-purpose programming language, widely used for data analysis, automation scripts and machine learning." },
};
