// ─── Theme toggle ───
const html = document.documentElement;
const toggleBtn = document.getElementById('theme-toggle');
const moonIcon = toggleBtn.querySelector('.icon-moon');
const sunIcon = toggleBtn.querySelector('.icon-sun');

const savedTheme = localStorage.getItem('theme') || 'dark';
html.setAttribute('data-theme', savedTheme);
updateToggleIcon(savedTheme);

toggleBtn.addEventListener('click', () => {
  const current = html.getAttribute('data-theme');
  const next = current === 'dark' ? 'light' : 'dark';
  html.setAttribute('data-theme', next);
  localStorage.setItem('theme', next);
  updateToggleIcon(next);
});

function updateToggleIcon(theme) {
  if (theme === 'dark') {
    moonIcon.style.display = 'block';
    sunIcon.style.display = 'none';
  } else {
    moonIcon.style.display = 'none';
    sunIcon.style.display = 'block';
  }
}

// ─── Typing effect ───
const phrases = [
  'Data & AI Analyst @ Sembcorp',
  'Aspiring Data Scientist',
  'Aspiring Analytics Engineer',
  'SMU Information Systems Graduate · 2026',
];
let pi = 0, ci = 0, deleting = false;
const typedEl = document.getElementById('typed');

function type() {
  const phrase = phrases[pi];
  if (!deleting) {
    typedEl.textContent = phrase.slice(0, ++ci);
    if (ci === phrase.length) { deleting = true; setTimeout(type, 2000); return; }
  } else {
    typedEl.textContent = phrase.slice(0, --ci);
    if (ci === 0) { deleting = false; pi = (pi + 1) % phrases.length; }
  }
  setTimeout(type, deleting ? 40 : 80);
}
type();

// ─── Scroll reveal ───
const observer = new IntersectionObserver((entries) => {
  entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
}, { threshold: 0.1 });

document.querySelectorAll('.exp-card, .project-card, .about-grid, .skills-wrapper, .contact-wrap, .about-timeline')
  .forEach(el => { el.classList.add('reveal'); observer.observe(el); });

// ─── Nav active link on scroll ───
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.nav-links a');
window.addEventListener('scroll', () => {
  let current = '';
  sections.forEach(s => { if (window.scrollY >= s.offsetTop - 100) current = s.id; });
  navLinks.forEach(a => {
    a.style.color = a.getAttribute('href') === `#${current}` ? 'var(--blue)' : '';
  });
}, { passive: true });

// ─── Mobile hamburger ───
document.getElementById('hamburger').addEventListener('click', () => {
  document.querySelector('.nav-links').classList.toggle('open');
});
