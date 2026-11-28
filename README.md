# VuDucCong18.github.io

My portfolio, served as a sushi conveyor belt. Each plate is a stop on my career. The plate's colour shows its category:

| Plate | Category |
| --- | --- |
| White marble | Education |
| Black with a gold rim | Experience |
| Speckled gold | Projects |

Pick a plate to open its card. Cards hold certificates, project write-ups, reports and links. **Chef's Skills** shows every tool I use and where I used it.

Live at **https://vuduccong18.github.io**

Built with React 19, TypeScript and Tailwind CSS v4, bundled with esbuild, and deployed to GitHub Pages by GitHub Actions.

---

## Where things live

```
index.html                  page shell, title and meta description
src/
  main.tsx                  mounts <App />
  App.tsx                   wires content into the belt; holds which pop-up is open
  data/                     ← all the words, dates and links. Edit here.
    profile.ts              name, role, headshot, resume, contact links
    plates.ts               the 9 plates: name, dates, description, chips, category
    projects.ts             project write-ups (the "Projects" / "Inside the project" buttons)
    documents.ts            certificates, transcripts, award letters, downloadable reports, extra links
    skills.ts               Chef's Skills: courses, skills and where each was used
    glossary.ts             hover explanations for companies, terms and tools
  components/
    site/                   pieces made for this site
      hero.tsx              headshot, Download CV, Chef's Skills
      contact-links.tsx     GitHub, LinkedIn, email, WhatsApp
      plate-card-actions.tsx  buttons at the foot of each plate card
      icons.tsx             line icons
      styles.ts             shared button styles
    ui/                     reusable components
      sushi-conveyor-menu.tsx  the belt, colour board and plate card (based on 21st.dev)
      project-viewer.tsx    project write-up pop-up
      skills-viewer.tsx     Chef's Skills pop-up
      doc-viewer.tsx        certificate and transcript viewer
      term.tsx              hover / tap explanation bubble
  lib/
    glossary.tsx            finds glossary words in text and adds the hover bubbles
    use-dialog.ts           shared pop-up behaviour: focus, Esc, Tab
  styles/globals.css        theme colours and fonts
public/assets/              copied as-is into the site
  headshot.webp
  dishes/                   the dish on each plate (one image per plate id)
  plates/                   plate designs: plate-education / -experience / -projects
  docs/                     certificates and transcripts as page images (personal IDs blacked out), resume.pdf
  projects/                 diagrams used inside project write-ups
  reports/                  project reports offered as downloads
scripts/
  build.mjs                 builds the site into dist/
  dishes/dishes.mjs         draws the dish images
  dishes/plates.mjs         draws the plate designs
.github/workflows/deploy.yml  builds and publishes on every push to main
```

## Common edits

| To change | Edit |
| --- | --- |
| A plate's text, dates or chips | `src/data/plates.ts` |
| Add a plate | Add an entry to `PLATES` in `src/data/plates.ts` with `tier` 1, 2 or 3. Add a dish image at `public/assets/dishes/<id>.webp`. |
| A project write-up | `src/data/projects.ts`, under the plate's id |
| A certificate or report | Put the file in `public/assets/docs` or `public/assets/reports`, then list it in `src/data/documents.ts` |
| A hover explanation | `src/data/glossary.ts`. Any phrase listed there gets a bubble wherever it appears. |
| Chef's Skills | `src/data/skills.ts`. Each skill's `used` lists plate ids, or `"smu"` for coursework. |
| Resume | Replace `public/assets/docs/resume.pdf` |
| Contact details | `src/data/profile.ts` |
| Colours and fonts | `src/styles/globals.css` |

Documents are shown as images, never as the original PDFs. Black out IDs, certificate numbers, signatures and dates of birth before adding a new one.

## Run it locally

Needs Node 20 or newer.

```bash
npm install
npm run build      # writes the site to dist/
npm run preview    # serves dist/ at http://localhost:3000
```

`npm run dishes` redraws the dish and plate images. It needs `sharp`, which `npm install` adds.

## Deploying

Pushing to `main` runs `.github/workflows/deploy.yml`. The workflow builds the site and publishes `dist/` to GitHub Pages. It only works if **Settings → Pages → Source** is set to **GitHub Actions**.

The previous version of the site is kept on the `v1-classic` branch.

## Credits

The conveyor belt started from the [Sushi Conveyor Menu](https://21st.dev) component on 21st.dev. It was then reworked for this site.
