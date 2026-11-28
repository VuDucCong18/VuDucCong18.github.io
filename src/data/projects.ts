/**
 * Project write-ups opened from a card's "Projects" / "Inside the project" buttons, keyed by plate id.
 * Written in plain language for a non-specialist reader. Every section except title and summary is optional,
 * so a write-up only shows what it has. Rendered by components/ui/project-viewer.tsx.
 */
export interface WorkProject {
  /** Shown after the company in the pop-up's eyebrow. Defaults to "Project". */
  kind?: string;
  title: string;
  /** One line under the title. */
  summary: string;
  /** Plain-language context for someone outside the industry. */
  background?: string;
  backgroundLabel?: string;
  /** What was going wrong, and why. */
  problem?: string;
  /** Heading for the problem section. Defaults to "What went wrong". */
  problemLabel?: string;
  /** Heading for the cost section. Defaults to "What it cost". */
  costLabel?: string;
  /** What the problem cost. Leave out when there is no figure to stand on. */
  cost?: string[];
  /** Heading for the steps. Defaults to "What I built". */
  builtLabel?: string;
  /** What I built, step by step. */
  built?: { step: string; text: string }[];
  outcome?: string[];
  outcomeLabel?: string;
  /** Optional comparison tables, shown under the figure. `best` is the row index to highlight. */
  tables?: { title: string; columns: string[]; rows: string[][]; best?: number; note?: string }[];
  /** Optional diagram shown before "What I built". */
  figure?: { src: string; alt: string; caption?: string };
  /** Each tool and what it did in this project. */
  tools?: { name: string; use: string }[];
}

/** Project write-ups opened from a role's card, written for a non-specialist reader. No vendor, site or colleague names. */
export const WORK: Record<string, WorkProject[]> = {
  // Source: github.com/VuDucCong18/phone-insurance-subscriber-forecasting README and charts
  insurance: [
    {
      title: "How the Forecast Works",
      summary: "Predicting next month's insured phones without letting the model peek at the answer.",
      backgroundLabel: "The business question",
      background:
        "Asurion insures phones, protecting over 300 million devices worldwide. This project forecasts how many phones will be insured at the end of next month, for every device model, colour and market (California, Nevada and Texas). That number decides how much money to hold back for claims, which repair parts to stock, and which models need renewal campaigns before customers drift away.",
      problemLabel: "The trap: data leakage",
      problem:
        "Some columns looked like perfect predictors but would not exist yet at forecast time. Cancellations and claims are only known once the month closes, the same moment as the number being predicted, and the claim-rate column even had the answer built into its formula. A model trained on them would look brilliant in testing and fail in real life.",
      figure: { src: "assets/projects/insurance-lifecycle.webp", alt: "Line chart of median insured phones by device age: demand peaks about 0.7 years after launch, then declines.", caption: "Insured phones peak about 0.7 years after launch, then fall as newer models arrive, so device age is a key input." },
      built: [
        { step: "Clean", text: "Dropped 2,128 pre-order rows created before a phone launched, which would have corrupted last month's values, while losing only about 4% of subscriber volume. 13,381 raw rows became 10,859 clean ones." },
        { step: "Fix the leakage", text: "Used last month's subscribers, cancellations and claims instead of this month's, dropped the claim-rate columns entirely, and kept only facts known in advance, such as device age and storage size." },
        { step: "Test like real life", text: "Split the data by time: train on 2019 to early 2022, tune on the rest of 2022, and test once on 2023. Cross-validation also walked forward through time, so the model never trained on the future." },
        { step: "Compare models", text: "Two simple linear baselines, Ridge and Lasso, against two tree-based models, Random Forest and XGBoost, in a champion-and-challenger setup." },
      ],
      outcome: [
        "A leakage-free pipeline with honest, real-world accuracy figures",
        "Forecasts for December 2023 and January 2024 for every device, colour and market",
      ],
      tools: [
        { name: "Pandas", use: "Cleaned the data and built the last-month features." },
        { name: "Scikit-learn", use: "Time-based splits, walk-forward cross-validation, scaling, and the Ridge, Lasso and Random Forest models." },
        { name: "XGBoost", use: "The champion model." },
        { name: "Matplotlib", use: "Exploratory charts and model comparison plots." },
      ],
    },
    {
      title: "Results & Recommendations",
      summary: "Which model won, what it learned, and how the business should use it.",
      backgroundLabel: "How to read the results",
      background:
        "RMSE and MAE measure how far forecasts land from reality, counted in subscribers, so lower is better. Percentage error was not the main measure, because phones with only a handful of subscribers make it explode.",
      figure: { src: "assets/projects/insurance-models.webp", alt: "Bar charts comparing Ridge, Lasso, Random Forest and XGBoost on MAE, RMSE and MAPE for the 2023 test set; XGBoost has the lowest MAE and RMSE.", caption: "Results on the unseen 2023 test data: XGBoost had the lowest error." },
      tables: [
        {
          title: "Held-out 2023 test set",
          columns: ["Model", "Role", "MAE", "RMSE", "R²", "MAPE"],
          rows: [
            ["Ridge", "Baseline", "869", "1,309", "0.44", "620%"],
            ["Lasso", "Baseline", "946", "1,362", "0.39", "651%"],
            ["Random Forest", "Challenger", "667", "1,140", "0.57", "866%"],
            ["XGBoost", "Champion", "552", "1,006", "0.67", "882%"],
          ],
          best: 3,
          note: "MAE and RMSE are average misses in subscribers (lower is better). R² is the share of ups and downs explained (higher is better). MAPE is inflated by phones with very few subscribers, so it was not used to pick the winner.",
        },
        {
          title: "Walk-forward cross-validation (5 folds)",
          columns: ["Model", "Mean RMSE", "Std"],
          rows: [
            ["Ridge", "1,551", "271"],
            ["Lasso", "1,576", "268"],
            ["XGBoost", "899", "240"],
          ],
          best: 2,
          note: "Each fold trains only on earlier months and tests on the next, so these figures show how the models would hold up over time.",
        },
      ],
      costLabel: "Results",
      cost: [
        "XGBoost cut forecast error (RMSE) by 23.2% compared with the best linear model",
        "An average miss of about 552 subscribers per model each month: roughly 3% for a flagship like the iPhone XS Max in California, with about 18,000 subscribers",
        "Explains 67% of the ups and downs in subscribers on unseen 2023 data",
      ],
      problemLabel: "What the models learned",
      problem:
        "XGBoost leaned on specific phone models and colours, in effect remembering which products are popular. Random Forest leaned on general drivers: last month's subscribers, storage size, cancellations, claims and device age. So XGBoost suits phones already on sale, while Random Forest suits brand-new launches with no history yet.",
      builtLabel: "Recommendations",
      built: [
        { step: "Now", text: "Use XGBoost for monthly forecasts on phones already on sale, and Random Forest for pre-launch forecasts on new models." },
        { step: "Now", text: "Flag phone models with under 500 subscribers for manual review, since the forecast error can be bigger than the actual count." },
        { step: "Next", text: "Log-transform the target to tame very large and very small models, and add SHAP explanations so the business can see why each forecast came out as it did." },
      ],
    },
  ],
  // Source: github.com/VuDucCong18/fintech-transaction-analytics-dbt README
  fintech: [
    {
      title: "How the Pipeline Works",
      summary: "From six raw tables to tested, analysis-ready data.",
      backgroundLabel: "The starting point",
      background:
        "Fintech apps record everything that happens: who signed up, which cards they hold, where they spent and in which currency. In raw form that data is messy, spread across tables and in many currencies, so it can't be trusted for reporting as it is.",
      problemLabel: "The goal",
      problem:
        "Turn the raw data into clean, tested tables that dashboards and the product, customer, operations and finance teams could all rely on, built the way an enterprise data team would.",
      figure: { src: "assets/projects/fintech-lineage.svg", alt: "dbt model lineage: six raw tables feed six staging views, then four dimension tables and one transaction fact table, two summary tables and the Streamlit dashboard.", caption: "The 13 dbt models, from raw sources to the dashboard." },
      built: [
        { step: "Load", text: "Six raw tables (customers, accounts, cards, merchants, exchange rates and transactions) land in Snowflake." },
        { step: "Clean", text: "One staging view per table fixes data types, renames columns and handles blanks, with no business logic yet." },
        { step: "Model", text: "A star schema: four tables describing customers, accounts, cards and merchants around one central table with a row for every transaction, plus two summary tables that feed the dashboards." },
        { step: "Add business logic", text: "Every amount is converted to SGD at that day's exchange rate, falling back to the latest earlier rate so no transaction is left unconverted. Money in and money out get opposite signs, and customers and merchants get ready-made labels such as age band, KYC tier and how long they have been active." },
        { step: "Test and ship", text: "131 automated tests check that IDs are unique, required fields are filled, values are valid and every link between tables holds. Every change goes through a Git branch and pull request before reaching the main version." },
      ],
      outcome: [
        "13 dbt models built end to end: 6 staging, 5 core and 2 summary",
        "131 of 131 data quality tests passing",
        "A reusable safe-divide macro, so percentage metrics never break on a zero",
        "Fully documented with dbt docs, ready for any BI tool",
      ],
      tools: [
        { name: "Snowflake", use: "The cloud warehouse holding the raw, staging and final layers." },
        { name: "dbt", use: "Builds, tests and documents every model, in the right order." },
        { name: "SQL", use: "All the cleaning, joining and business logic." },
        { name: "GitHub", use: "Feature branches and pull requests, so every change is reviewed before it ships." },
      ],
    },
    {
      title: "The Dashboards",
      summary: "A live, three-page dashboard that answers real business questions.",
      backgroundLabel: "Why it matters",
      background:
        "Data only becomes useful when people can act on it. The dashboard turns the tested tables into three views, each for a different audience.",
      built: [
        { step: "Executive Overview", text: "For leadership: transactions, volume in SGD, fee revenue, success rate, failures and cross-border activity, with monthly summaries, daily trends and breakdowns by channel and currency." },
        { step: "Customer Intelligence", text: "For growth teams: customer segments, KYC verification, age bands, preferred channels, spend by segment and country, and the top 10 customers by spend." },
        { step: "Transaction Operations", text: "For operations: success and failure rates over time, the most common failure reasons, and a drill-down into failed transactions." },
        { step: "Built for speed", text: "The app reads only the small summary tables, never the full transaction table, keeps results for 10 minutes and fetches failed transactions with a targeted query." },
      ],
      outcomeLabel: "Questions it answers",
      outcome: [
        "Who are the highest-value customers by lifetime spend?",
        "Which channels fail most often, and why?",
        "How much cross-border volume is being processed?",
        "How does spend differ across age bands and countries?",
      ],
      tools: [
        { name: "Streamlit", use: "The interactive dashboard app, live online." },
        { name: "Python", use: "Page logic, filters and caching." },
        { name: "Snowflake", use: "Serves the summary tables the dashboard reads." },
      ],
    },
  ],
  // Source: SMU internship reflection, XEL Lifecare (Aire), and resume
  aire: [
    {
      title: "National Day 8/8 Campaign",
      summary: "Leading a National Day sale that grew revenue by 35% and new customers by 30%.",
      background:
        "Online marketplaces in Southeast Asia run big sale days on matching dates like 5/5, 6/6 and 7/7, when shoppers expect deals and brands compete hard for attention. Aire sold on Lazada, Shopee, TikTok Shop and its own Shopify store.",
      problemLabel: "The challenge",
      problem:
        "The 7/7 sale, which followed a strategy I proposed, missed its targets and had to be replanned mid-campaign. National Day (8/8) was the next big sale, and a chance to apply those lessons.",
      built: [
        { step: "Review", text: "Evaluated how the earlier sale campaigns had performed, by platform and by product." },
        { step: "Plan", text: "Designed a full promotion plan with targeted offers to attract new customers." },
        { step: "Run", text: "Launched it across every platform, keeping an eye on results and on stock and deliveries." },
      ],
      outcome: [
        "35% more revenue across all e-commerce platforms",
        "30% more new customers",
        "Turned the lessons from the 7/7 miss into the highlight of the internship",
      ],
      tools: [
        { name: "Excel", use: "Analysed past campaign results to shape the plan." },
        { name: "Marketplace seller tools", use: "Set up the promotions and pulled sales data on Lazada, Shopee, TikTok Shop and Shopify." },
      ],
    },
    {
      title: "Sales Dashboards & Pricing",
      summary: "Weekly dashboards, competitor pricing and customer insights behind 22% revenue growth.",
      background:
        "Each marketplace reports sales in its own format, with its own metrics, so there was no single view of how the business was doing across all four.",
      problemLabel: "The challenge",
      problem:
        "Weekly and monthly reporting meant exporting and cleaning data from every platform. The team also needed to keep prices competitive and understand which customers to target.",
      built: [
        { step: "Dashboards", text: "Exported, cleaned and combined data from all four platforms in Excel, using pivot tables and macros, into dashboards of the key business numbers." },
        { step: "Pricing", text: "Researched competitor prices regularly, so Aire's prices stayed competitive." },
        { step: "Customers", text: "Grouped customers by how they buy and visualised the groups in Power BI, to design more targeted promotions." },
        { step: "Forecasting", text: "Built sales forecasts from past sales and campaign demand to plan stock orders." },
      ],
      outcome: [
        "Online revenue up 22% within three months",
        "Customer acquisition up 15% through competitive pricing",
        "Stock shortages down 46% with forecast-based ordering",
        "Faster weekly and monthly reporting",
      ],
      tools: [
        { name: "Excel", use: "Cleaned and combined platform data with pivot tables and macros, and powered the dashboards." },
        { name: "Power BI", use: "Visualised customer groups and buying patterns." },
      ],
    },
  ],
  // Source: SMU final internship report, Shopee (15 May – 7 Nov 2025), and resume
  shopee: [
    {
      title: "Weekly Voucher Campaign Tests",
      summary: "Measuring which vouchers really win extra buyers, and at what cost.",
      background:
        "Shopee sends targeted vouchers to users at different stages, such as new users or those likely to stop buying. Every weekly campaign is run as a test: about 5% of users get no voucher, as a comparison group, and the rest get vouchers of different values.",
      problemLabel: "The question",
      problem:
        "Bigger vouchers usually win more buyers, but they cost more. For each market and user group, the team needed to know which voucher won the most extra buyers for the money, and whether those buyers kept shopping afterwards.",
      built: [
        { step: "Measure", text: "Pulled each campaign's results with SQL by market, user group and voucher, comparing buyers and spending against the no-voucher group." },
        { step: "Compare fairly", text: "Adjusted for voucher groups of different sizes, and used a statistical test to check that differences were real rather than down to chance." },
        { step: "Follow up", text: "Tracked whether voucher-won buyers were still logging in, ordering and spending 30, 60 and 90 days later, compared with users who bought without one." },
      ],
      outcome: [
        "Weekly campaign results delivered across 10 markets, with short written findings and filterable Excel reports",
        "Guided voucher values and targeting for the next campaign rounds",
        "Showed whether campaigns built lasting customers, not just one-off spikes",
      ],
      tools: [
        { name: "Presto SQL", use: "Pulled campaign, user and order data from Shopee's data tables." },
        { name: "A/B Testing", use: "The test design: random voucher and no-voucher groups to measure the real effect." },
        { name: "Excel", use: "Reports with filters and pivot tables so teams could explore results by market and user group." },
      ],
    },
    {
      title: "Buyer & Voucher Tracker",
      summary: "A self-serve tracker that shows what is behind every swing in cost or sales.",
      background:
        "When sales or voucher costs jumped between campaign rounds, someone had to dig in by hand to work out whether buyers, vouchers or other costs were behind it.",
      problem:
        "Swings came up often. In some campaigns the cost of winning each extra buyer spiked, or even went negative, and each case meant another one-off deep dive, sometimes down to the 500 most expensive orders, to find whether a few users, platform-wide promotions or the voucher setup were to blame.",
      cost: [
        "Repeated manual investigations every time the numbers moved",
        "Campaign teams waiting on analysts for answers",
      ],
      built: [
        { step: "Break down", text: "A Spark SQL script that splits cost per user, for both voucher and no-voucher groups, into Shopee vouchers, other vouchers and other costs, down to item, voucher, coin and shipping rebates." },
        { step: "Voucher view", text: "A second script for the 10 most-used vouchers in each round: minimum spend, cap, discount, orders and cost per order." },
        { step: "Automate", text: "Both scripts run monthly and refresh an Excel tracker that teams filter by campaign round, market and user group. Each was tested and peer reviewed before launch." },
      ],
      outcome: [
        "Manual reporting cut by 30%",
        "Presented to stakeholders and now used in campaign reviews",
        "Campaign teams find the cause of cost or sales swings themselves, without waiting on analysts",
      ],
      tools: [
        { name: "Spark SQL", use: "Crunches the high volume of campaign data across markets quickly." },
        { name: "Airflow", use: "Runs both scripts on a monthly schedule so the tracker stays current." },
        { name: "Excel", use: "The tracker itself, with filters and pivot tables for self-serve answers." },
      ],
    },
  ],
  // Source: IS493 work-study final report (Jan–May 2026) and the role summary slide
  sephora: [
    {
      title: "Brand Portal Migration",
      summary: "Moving the Southeast Asia Brand Portal's data logic out of DOMO and into BigQuery.",
      background:
        "Sephora sells products from hundreds of beauty brands. The Southeast Asia Brand Portal is a set of dashboards that shows how each brand's products are selling across the region. The dashboards run on DOMO, and until now the data behind them was also cleaned and calculated inside DOMO's own processing steps.",
      problemLabel: "Why it needed to change",
      problem:
        "With the calculations buried inside DOMO, dependencies were hidden, changes were hard to make safely, and the logic could not be reused in other tools. The setup was also expensive and slow on complex dashboards, and Sephora was moving globally towards Power BI.",
      cost: [
        "High DOMO licensing and processing costs",
        "Slow dashboards, weighed down by complex logic",
        "Business logic locked into one tool, making any future move harder",
      ],
      built: [
        { step: "Map (Jan–Mar)", text: "Documented the migration scope across 30+ data tables, traced how DOMO processed the data, and pinned down the key columns, KPI calculations and rules to carry over. Agreed a rollout plan with data managers, BI analysts and data engineers." },
        { step: "Design", text: "Drew entity-relationship diagrams to reshape core data, such as orders and transactions, into business-ready tables. Checked the technical design with the Data Manager, and the fit with business needs with the director." },
        { step: "Build and launch (Apr–May)", text: "Moved the most critical datasets first. Tested the outputs in BigQuery, built them as dbt models, deployed them and connected them back to the DOMO dashboards, so reporting never stopped during the move." },
      ],
      outcome: [
        "Data logic now lives in one place, in version-controlled dbt models on BigQuery, with clear lineage",
        "Less reliance on costly DOMO processing, and faster dashboards from pre-built tables",
        "Tables are ready to reuse in Power BI as Sephora moves across",
        "Business reporting for Southeast Asia kept running throughout",
      ],
      tools: [
        { name: "DOMO", use: "Where the old logic was traced from, and where the dashboards still display the data." },
        { name: "BigQuery", use: "The data warehouse that now holds the business-ready tables." },
        { name: "dbt", use: "Turns raw data into those tables through tested SQL models." },
        { name: "GitHub and CI/CD", use: "Records every change and checks it automatically before it goes live." },
        { name: "Airflow", use: "Runs the pipeline steps on schedule." },
      ],
    },
    {
      title: "Timezone Mismatch Investigation",
      summary: "Finding out why two datasets that should agree did not.",
      background:
        "Each market counts its sales by its own local day, but many systems record time in UTC, the world's reference clock. In Singapore, for example, a sale at 7am local time is still the previous day in UTC.",
      problem:
        "Two datasets that were expected to give the same results did not. One recorded timestamps in UTC and the other in local time, so the same activity landed on different days. On top of that, the source systems refreshed at different times, which widened the gap.",
      cost: [
        "The same numbers came out differently depending on which dataset was used",
        "Comparisons across datasets and regions could not be trusted",
      ],
      built: [
        { step: "Compare", text: "Lined the datasets up, across tables with millions of rows, to see where and by how much they drifted, keeping queries lean to hold down processing costs." },
        { step: "Diagnose", text: "Traced the gap to the UTC-versus-local timestamps, made worse by different refresh times." },
        { step: "Fix", text: "Proposed a standardised timestamp field, checked with the data team that it would not disrupt existing pipelines, tested it locally and deployed it through dbt and GitHub." },
      ],
      outcome: [
        "Datasets can now be compared on the same clock",
        "Fix validated by Sephora's global data team",
      ],
      tools: [
        { name: "BigQuery", use: "Where the datasets were compared, with queries trimmed to scan only the columns and rows needed." },
        { name: "dbt", use: "Where the standardised timestamp field was added." },
        { name: "GitHub", use: "Carried the change through review and deployment." },
      ],
    },
  ],
  sembcorp: [
    {
      title: "Manufacturer Manual Tracker",
      summary: "Engineers now hear about equipment manual changes the same day, instead of months later.",
      background:
        "Sembcorp runs solar panels on rooftops of businesses across Singapore. Each system depends on equipment such as inverters (the box that turns solar power into electricity a building can use), and every part comes with an installation manual from its manufacturer.",
      problem:
        "One manufacturer quietly added a new wiring rule to an inverter manual, together with a software update that limits the inverter's output if a site is not wired the new way. No one was told. The monitoring system mistook the drop for shading, so fixes went after the wrong cause, and it took 11 months before anyone realised the manual had changed. Keeping up meant checking manufacturers' websites by hand.",
      cost: [
        "32 rooftops ran about 6% below their potential for 11 months",
        "Roughly S$120,000 a year in lost output, plus the cost of rewiring",
        "3–4 hours a day spent checking manufacturer websites by hand",
      ],
      built: [
        { step: "Collect", text: "Every day, an automated workflow pulls the latest manuals and guides straight from manufacturers' websites for 155+ parts and components, and files them in one shared library." },
        { step: "Compare", text: "When a manual changes, AI reads the new version against the old one and writes a short summary of what changed." },
        { step: "Alert", text: "The engineers responsible get an email the same day, with the summary and a link to the new document." },
      ],
      outcome: [
        "Presented the solution to senior management, who approved it for launch",
        "Now live: engineers get an email whenever a manufacturer updates a manual on its website",
        "A change that once took 11 months to notice is now flagged the same day",
        "No more daily hand-checking of manufacturer websites",
      ],
      tools: [
        { name: "Power Automate", use: "Runs the whole process on a schedule: fetches the manuals, starts the comparison and sends the emails." },
        { name: "SharePoint", use: "Stores every manual and its earlier versions in one shared library, so there is always a previous version to compare against." },
        { name: "AI (large language model)", use: "Reads the old and new versions side by side and summarises the differences in plain English." },
        { name: "Outlook", use: "Delivers the update emails to the engineers." },
      ],
    },
    {
      title: "Billing & Collections Reporting",
      summary: "A week of monthly spreadsheet work turned into a live dashboard with an AI assistant.",
      background:
        "Every month, the Billing team reports how many invoices went out, and the Collections team reports which customers still owe money and for how long. These reports cover gas, solar and other businesses and go to senior stakeholders.",
      problem:
        "The numbers came from raw system exports that had to be cleaned and combined by hand in large spreadsheets, then emailed out as long working files. Anyone with a question had to email the team and wait for a reply.",
      cost: [
        "About a week of work every month to prepare the billing report",
        "Repeated rounds of emailed reports and follow-up questions",
        "Less time left for following up customers with overdue payments",
      ],
      built: [
        { step: "Clean", text: "Excel macros clean and combine the raw billing and collections data in minutes instead of days." },
        { step: "Show", text: "A dashboard that stakeholders open directly, showing the headline numbers instead of long working files." },
        { step: "Ask", text: "An AI assistant on top of the dashboard, so managers can ask questions about the numbers in plain language instead of emailing the team." },
      ],
      outcome: [
        "Monthly report preparation cut from about a week to 20–30 minutes",
        "Rolled out across all business units, used by the Billing and Collections teams and 30+ stakeholders up to senior management",
        "Collections' reporting emails to stakeholders roughly halved",
        "Teams now spend that time on exceptions and chasing overdue payments",
      ],
      tools: [
        { name: "VBA", use: "Excel macros that clean, check and combine the raw billing and collections data automatically." },
        { name: "SharePoint", use: "Where the teams upload their weekly data, and where the dashboard reads it from." },
        { name: "Power BI", use: "The dashboard stakeholders open to see the headline numbers at a glance." },
        { name: "Copilot Studio", use: "The AI assistant that answers managers' questions about the dashboard data." },
      ],
    },
  ],
};
