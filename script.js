'use strict';

/* ==========================================================================
   yasmine.os: desktop, file tree and window manager
   ========================================================================== */

const EMAIL = 'yasminekoulam2004@gmail.com';
const PHONE = '+212 7 20 27 34 63';
const PHONE_HREF = 'tel:+212720273463';
const GITHUB = 'https://github.com/YasmineKoulam';
const LINKEDIN = 'https://www.linkedin.com/in/yasmine-koulam';
const CV_PDF = 'assets/yasmine-koulam-cv.pdf';

const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
const clamp = (v, min, max) => Math.max(min, Math.min(max, v));
const mobileMQ = matchMedia('(max-width: 700px)');
const touchMQ = matchMedia('(hover: none)');

/* ---------------------------------------------------------------- icons */

const INK = '#2a2a22';

const svgFolder = () => `<svg viewBox="0 0 64 56" aria-hidden="true">
  <path d="M5 11a4 4 0 0 1 4-4h14.3a3 3 0 0 1 2.2.95L30 12.5h25a4 4 0 0 1 4 4V47a4 4 0 0 1-4 4H9a4 4 0 0 1-4-4z" fill="#e9c94f" stroke="${INK}" stroke-width="2.5" stroke-linejoin="round"/>
  <path d="M6 20.5h53.5a2.5 2.5 0 0 1 2.45 3L57 48a4 4 0 0 1-3.9 3H10a4 4 0 0 1-3.95-3.4L3.6 23.4A2.5 2.5 0 0 1 6 20.5z" fill="#f8e58f" stroke="${INK}" stroke-width="2.5" stroke-linejoin="round"/>
  <rect x="12.5" y="26" width="19" height="6.5" rx="1.6" fill="#86aee0" stroke="${INK}" stroke-width="2"/>
</svg>`;

const svgFile = (label, color) => `<svg viewBox="0 0 56 64" aria-hidden="true">
  <path d="M10 3h25l15 15v39a4 4 0 0 1-4 4H10a4 4 0 0 1-4-4V7a4 4 0 0 1 4-4z" fill="#fffdf5" stroke="${INK}" stroke-width="2.5" stroke-linejoin="round"/>
  <path d="M35 3v11a4 4 0 0 0 4 4h11" fill="#ece5cd" stroke="${INK}" stroke-width="2.5" stroke-linejoin="round"/>
  <path d="M13 25h20M13 32h28M13 39h16" stroke="#cdc5ab" stroke-width="2.5" stroke-linecap="round"/>
  <rect x="2" y="44" width="33" height="14" rx="3.5" fill="${color}" stroke="${INK}" stroke-width="2"/>
  <text x="18.5" y="54.3" text-anchor="middle" font-family="Red Hat Mono, monospace" font-size="9" font-weight="700" fill="#fff">${label}</text>
</svg>`;

const svgProfile = () => `<svg viewBox="0 0 64 64" aria-hidden="true">
  <rect x="4" y="4" width="56" height="56" rx="13" fill="#5f6743" stroke="${INK}" stroke-width="2.5"/>
  <rect x="9.5" y="9.5" width="45" height="45" rx="9" fill="none" stroke="#8b946b" stroke-width="2"/>
  <text x="32" y="41" text-anchor="middle" font-family="Sora, sans-serif" font-size="34" font-weight="700" fill="#fbf8ee">y</text>
</svg>`;

const svgTerminal = () => `<svg viewBox="0 0 64 56" aria-hidden="true">
  <rect x="4" y="5" width="56" height="46" rx="8" fill="#2b2c23" stroke="${INK}" stroke-width="2.5"/>
  <path d="M12 5h40a8 8 0 0 1 8 8v3H4v-3a8 8 0 0 1 8-8z" fill="#6b7350" stroke="${INK}" stroke-width="2.5" stroke-linejoin="round"/>
  <path d="M14 26l8 6-8 6" fill="none" stroke="#b8c48c" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M27 40h13" stroke="#f4b97a" stroke-width="3" stroke-linecap="round"/>
</svg>`;

const svgFontlab = () => `<svg viewBox="0 0 64 64" aria-hidden="true">
  <rect x="4" y="4" width="56" height="56" rx="13" fill="#f4b97a" stroke="${INK}" stroke-width="2.5"/>
  <text x="32" y="42" text-anchor="middle" font-family="Georgia, serif" font-size="27" font-weight="700" fill="${INK}">Aa</text>
  <path d="M15 49h34" stroke="${INK}" stroke-width="2.5" stroke-linecap="round" stroke-dasharray="1 5"/>
</svg>`;

const svg = {
  min: '<svg viewBox="0 0 12 12"><path d="M2 9h8" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
  max: '<svg viewBox="0 0 12 12"><rect x="2" y="2" width="8" height="8" rx="1.5" fill="none" stroke="currentColor" stroke-width="1.8"/></svg>',
  close: '<svg viewBox="0 0 12 12"><path d="M2.5 2.5l7 7M9.5 2.5l-7 7" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
  mail: '<svg viewBox="0 0 24 24"><rect x="3" y="5.5" width="18" height="13" rx="2.5" fill="none" stroke="currentColor" stroke-width="2"/><path d="M4 7.5l8 6 8-6" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/></svg>',
  phone: '<svg viewBox="0 0 24 24"><path d="M6.6 3.5h3l1.5 4.2-2.2 1.5a11 11 0 0 0 5.9 5.9l1.5-2.2 4.2 1.5v3a2 2 0 0 1-2.2 2A16.5 16.5 0 0 1 4.6 5.7a2 2 0 0 1 2-2.2z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/></svg>',
  pin: '<svg viewBox="0 0 24 24"><path d="M12 21s-6.5-6-6.5-11a6.5 6.5 0 0 1 13 0c0 5-6.5 11-6.5 11z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><circle cx="12" cy="10" r="2.4" fill="none" stroke="currentColor" stroke-width="2"/></svg>',
  github: '<svg viewBox="0 0 16 16"><path fill="currentColor" d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/></svg>',
  linkedin: '<svg viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="3" fill="none" stroke="currentColor" stroke-width="2"/><path d="M8 10.5V16M8 7.8v.1M11.5 16v-3.2a2.3 2.3 0 0 1 4.6 0V16M11.5 10.5V16" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
  download: '<svg viewBox="0 0 24 24"><path d="M12 4v11M7 10.5l5 5 5-5M5 20h14" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  external: '<svg viewBox="0 0 24 24"><path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  send: '<svg viewBox="0 0 24 24"><path d="M4 12l16-8-6 16-2.5-6.5z" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linejoin="round"/></svg>',
};

/* ---------------------------------------------------------------- content */

const COLOR = {
  md: '#e8802a',
  txt: '#3b7fc4',
  edu: '#6b7350',
  lang: '#4f9a52',
  vcf: '#d9689c',
  pdf: '#d0493f',
};

const TREE = [
  {
    id: 'about', kind: 'app', name: 'profile.exe', label: 'profile',
    w: 680, h: 590, render: renderAbout,
  },
  {
    id: 'experience', kind: 'folder', name: 'experience',
    blurb: 'Where I have shipped code for real users.',
    children: [
      {
        id: 'pasteur', kind: 'file', name: 'institut-pasteur.md', ext: 'md', color: COLOR.md,
        w: 620, h: 560, render: renderRole, text: textRole,
        data: {
          kicker: 'experience · internship',
          title: 'Full-Stack Developer Intern',
          org: 'Institut Pasteur du Maroc',
          place: 'Casablanca',
          when: 'Summer 2025',
          lead: 'Built a payment collection platform that replaced a fully manual process (email, phone calls and in-person visits).',
          bullets: [
            'Modeled the domain in UML (class and sequence diagrams) and designed the PostgreSQL schema.',
            'Implemented the Clients, Invoices, Collection Attempts and Dashboard modules in Spring Boot.',
            'Secured the platform with Admin / Agent role-based access control via Spring Security.',
            'Designed and documented the REST API, and tested it with Postman.',
          ],
          stack: ['Spring Boot', 'Spring Security', 'PostgreSQL', 'REST', 'UML', 'Postman'],
        },
      },
    ],
  },
  {
    id: 'projects', kind: 'folder', name: 'projects',
    blurb: 'Things I designed and built end to end.',
    children: [
      {
        id: 'deepdame', kind: 'file', name: 'deepdame.md', ext: 'md', color: COLOR.md,
        w: 620, h: 580, render: renderProject, text: textProject,
        data: {
          title: 'DeepDame',
          lead: 'Real-time multiplayer checkers platform.',
          stat: ['3,000', 'concurrent users handled in load tests'],
          bullets: [
            'Game state synchronised between players over WebSockets / STOMP.',
            'Random matchmaking and private invitations to play with a friend.',
            'A local AI opponent powered by Ollama for solo games.',
            'Load-tested with up to 3,000 concurrent users.',
          ],
          stack: ['Spring Boot', 'WebSockets/STOMP', 'Redis', 'MongoDB', 'Flutter', 'Docker'],
        },
      },
      {
        id: 'narrative', kind: 'file', name: 'narrative.md', ext: 'md', color: COLOR.md,
        w: 620, h: 540, render: renderProject, text: textProject,
        data: {
          title: 'Narrative',
          lead: 'Full-stack blogging platform with real-time features.',
          bullets: [
            'Readers save articles to private collections and message each other in real time.',
            'Authors draft posts, group them into series and moderate comments.',
          ],
          stack: ['Spring Boot', 'JWT', 'Oracle', 'Redis', 'WebSocket', 'Docker', 'Angular 21', 'Tailwind CSS v4'],
        },
      },
      {
        id: 'ecotrack', kind: 'file', name: 'ecotrack.md', ext: 'md', color: COLOR.md,
        w: 620, h: 520, render: renderProject, text: textProject,
        data: {
          title: 'EcoTrack',
          lead: 'Carbon footprint tracker.',
          bullets: [
            'Secure REST backend that calculates CO₂ emissions automatically.',
            'Gamification with badges to keep users engaged.',
            'Dynamic statistics dashboards built with Recharts.',
          ],
          stack: ['Spring Boot', 'JWT', 'PostgreSQL', 'Docker', 'React', 'Recharts', 'Tailwind CSS'],
        },
      },
    ],
  },
  {
    id: 'education', kind: 'folder', name: 'education',
    blurb: 'From maths in Casablanca to engineering in Settat.',
    children: [
      {
        id: 'fst-settat', kind: 'file', name: 'fst-settat.txt', ext: 'txt', color: COLOR.edu,
        w: 560, h: 420, render: renderSchool, text: textSchool,
        data: {
          kicker: 'education · 2024-2027 (expected)',
          title: 'Engineering Degree',
          field: 'Computer Science Engineering',
          school: 'FST Settat',
          place: 'Settat',
          note: 'Final year. Looking for an end-of-studies internship (PFE).',
        },
      },
      {
        id: 'fst-mohammedia', kind: 'file', name: 'fst-mohammedia.txt', ext: 'txt', color: COLOR.edu,
        w: 560, h: 380, render: renderSchool, text: textSchool,
        data: {
          kicker: 'education · 2021-2024',
          title: 'DEUST',
          field: 'Sciences and Technology',
          school: 'FST Mohammedia',
          place: 'Mohammedia',
        },
      },
      {
        id: 'lycee', kind: 'file', name: 'baccalaureat.txt', ext: 'txt', color: COLOR.edu,
        w: 560, h: 420, render: renderSchool, text: textSchool,
        data: {
          kicker: 'education · 2021',
          title: 'Baccalauréat',
          field: 'Mathematical Sciences A (French track)',
          school: 'Lycée Othman Ibn Affan',
          place: 'Casablanca',
          note: 'Graduated with honours (Mention Bien).',
        },
      },
    ],
  },
  {
    id: 'activities', kind: 'folder', name: 'activities',
    blurb: 'Outside the classroom.',
    children: [
      {
        id: 'code-club', kind: 'file', name: 'code-club.md', ext: 'md', color: COLOR.md,
        w: 580, h: 420, render: renderRole, text: textRole,
        data: {
          kicker: 'activities · student club',
          title: 'Secretary General',
          org: 'Club of Development Enthusiasts (CODE), FST Settat',
          place: 'Settat',
          lead: 'Coordinated club activities and administration for the student tech community.',
        },
      },
    ],
  },
  {
    id: 'skills', kind: 'file', name: 'skills.txt', ext: 'txt', color: COLOR.txt, side: 'right',
    w: 660, h: 600, render: renderSkills, text: textSkills,
  },
  {
    id: 'languages', kind: 'file', name: 'languages.txt', ext: 'txt', color: COLOR.lang, side: 'right',
    w: 500, h: 470, render: renderLanguages, text: textLanguages,
  },
  {
    id: 'contact', kind: 'file', name: 'contact.vcf', ext: 'vcf', color: COLOR.vcf, side: 'right',
    w: 540, h: 620, render: renderContact, text: textContact,
  },
  {
    id: 'resume', kind: 'file', name: 'resume.pdf', ext: 'pdf', color: COLOR.pdf, side: 'right',
    w: 760, h: 760, flush: true, render: renderResume,
  },
  {
    id: 'terminal', kind: 'app', name: 'terminal.exe', label: 'terminal', icon: 'terminal', side: 'right',
    w: 760, h: 520, mount: mountTerminal, status: 'ysh 1.0 · type help',
  },
  {
    id: 'fontlab', kind: 'app', name: 'fontlab.exe', label: 'fontlab', icon: 'fontlab', side: 'right', dev: true,
    w: 580, h: 640, mount: mountFontlab, status: 'dev tool · choices are saved in this browser only',
  },
];

const SKILLS = [
  ['backend', ['Spring Boot', 'Spring Security', 'Spring Data JPA', 'Hibernate', 'JWT', 'REST', 'WebSockets/STOMP']],
  ['frontend & mobile', ['Angular', 'React', 'Flutter', 'HTML/CSS', 'Tailwind CSS']],
  ['languages', ['Java', 'C', 'SQL', 'JavaScript', 'Dart']],
  ['databases', ['PostgreSQL', 'Oracle', 'SQL Server', 'MongoDB', 'Redis']],
  ['devops', ['Docker', 'Docker Compose', 'Linux', 'Bash', 'Git', 'Vercel']],
  ['ai & ml', ['PyTorch', 'TensorFlow', 'VAE', 'LLM integration', 'Ollama', 'Hugging Face']],
  ['methods & tools', ['OOP', 'UML', 'LaTeX', 'IntelliJ', 'Postman']],
];

// level: 1 to 6 on the CEFR scale (A1 ... C2)
const LANGUAGES = [
  { name: 'Arabic', code: 'ar', native: 'العربية', level: 6, label: 'Native' },
  { name: 'French', code: 'fr', native: 'Français', level: 5, label: 'Fluent · C1' },
  { name: 'English', code: 'en', native: '', level: 4, label: 'Professional · B2' },
];

/* index the tree */
const ITEMS = {};
(function index(list, parent) {
  for (const item of list) {
    item.parent = parent;
    ITEMS[item.id] = item;
    if (item.children) index(item.children, item);
  }
})(TREE, null);

function pathOf(item) {
  const parts = [];
  for (let it = item; it; it = it.parent) parts.unshift(it.name);
  return 'C:\\YASMINE\\' + parts.join('\\');
}

const visible = (item) => !item.dev || DEV;

function iconSvg(item) {
  if (item.icon === 'terminal') return svgTerminal();
  if (item.icon === 'fontlab') return svgFontlab();
  if (item.kind === 'folder') return svgFolder();
  if (item.kind === 'app') return svgProfile();
  return svgFile(item.ext.toUpperCase(), item.color);
}

const iconHTML = (item) => `
  <button class="icon" type="button" role="listitem" data-id="${item.id}">
    <span class="icon-img">${iconSvg(item)}</span>
    <span class="icon-label">${item.label || item.name}</span>
  </button>`;

/* ---------------------------------------------------------------- renderers */

const section = (title, html) => `<h3><span>##</span>${title}</h3>${html}`;
const list = (items) => `<ul class="bullets">${items.map((t) => `<li>${t}</li>`).join('')}</ul>`;
const chips = (items) => `<div class="chips">${items.map((t) => `<span class="chip-tag">${t}</span>`).join('')}</div>`;

function renderAbout() {
  return `
  <div class="about">
    <div class="avatar" aria-hidden="true"><span>YK</span></div>
    <div>
      <p class="hi">hi! i’m</p>
      <h2 class="name">Yasmine Koulam</h2>
      <p class="role">Full-stack developer · Java &amp; Spring Boot</p>
    </div>
  </div>
  <p class="summary">
    Final-year Computer Science Engineering student at FST Settat, focused on backend and full-stack
    development with Java and Spring Boot: secure REST APIs (Spring Security, JWT, RBAC), relational data
    modeling, real-time features with WebSockets/STOMP, and Docker.
  </p>
  <p class="note"><strong>Currently:</strong> looking for an end-of-studies internship (PFE).</p>
  <ul class="facts">
    <li>Casablanca, Morocco</li>
    <li>FST Settat · class of 2027</li>
    <li>ar · fr · en</li>
  </ul>
  <div class="actions">
    <button class="btn" type="button" data-open="projects">open projects/</button>
    <button class="btn alt" type="button" data-open="resume">resume.pdf</button>
    <button class="btn orange" type="button" data-open="contact">say hello ${svg.send}</button>
  </div>`;
}

function renderRole(item) {
  const d = item.data;
  return `
  <article class="doc">
    <p class="kicker">${d.kicker}</p>
    <h2>${d.title}</h2>
    <p class="meta"><strong>${d.org}</strong><span>${d.place}</span>${d.when ? `<span>${d.when}</span>` : ''}</p>
    ${d.lead ? `<p class="lead">${d.lead}</p>` : ''}
    ${d.bullets ? section('what i did', list(d.bullets)) : ''}
    ${d.stack ? section('stack', chips(d.stack)) : ''}
  </article>`;
}

function renderProject(item) {
  const d = item.data;
  return `
  <article class="doc">
    <p class="kicker">project</p>
    <h2>${d.title}</h2>
    <p class="lead">${d.lead}</p>
    ${d.stat ? `<p class="stat"><b>${d.stat[0]}</b><span>${d.stat[1]}</span></p>` : ''}
    ${section('highlights', list(d.bullets))}
    ${section('stack', chips(d.stack))}
  </article>`;
}

function renderSchool(item) {
  const d = item.data;
  return `
  <article class="doc">
    <p class="kicker">${d.kicker}</p>
    <h2>${d.title}</h2>
    <p class="lead">${d.field}</p>
    <p class="meta"><strong>${d.school}</strong><span>${d.place}</span></p>
    ${d.note ? `<p class="note">${d.note}</p>` : ''}
  </article>`;
}

function renderSkills() {
  return `
  <p class="txt-comment"># what I build with, grouped by layer</p>
  <dl class="skills">
    ${SKILLS.map(([k, v]) => `<div class="skill-row"><dt>${k}</dt><dd>${chips(v)}</dd></div>`).join('')}
  </dl>`;
}

function renderLanguages() {
  const scale = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
  return `
  <p class="txt-comment"># spoken languages, on the CEFR scale</p>
  <ul class="langs">
    ${LANGUAGES.map((l) => `
      <li>
        <div class="lang-head">
          <span class="lang-name">${l.name}${l.native ? `<small lang="${l.code}">${l.native}</small>` : ''}</span>
          <span class="lang-level">${l.label}</span>
        </div>
        <div class="meter" role="img" aria-label="${l.name}: ${l.label}">
          ${scale.map((_, i) => `<i class="${i < l.level ? 'on' : ''}"></i>`).join('')}
        </div>
      </li>`).join('')}
  </ul>
  <div class="meter-scale" aria-hidden="true">${scale.map((s) => `<span>${s}</span>`).join('')}</div>`;
}

function renderContact() {
  const row = (icon, k, v, href, extra = '') => `
    <li class="vrow">
      <span class="vrow-ico">${icon}</span>
      <span><span class="vrow-k">${k}</span>${href
        ? `<a class="vrow-v" href="${href}"${href.startsWith('http') ? ' target="_blank" rel="noopener"' : ''}>${v}</a>`
        : `<span class="vrow-v">${v}</span>`}</span>
      ${extra}
    </li>`;
  return `
  <article class="doc">
    <p class="kicker">BEGIN:VCARD</p>
    <h2>Let’s <span class="accent">talk</span>.</h2>
    <p class="lead">Open to a PFE internship in backend or full-stack development.</p>
    <ul class="vcard">
      ${row(svg.mail, 'email', EMAIL, `mailto:${EMAIL}`, `<button class="mini" type="button" data-copy="${EMAIL}">copy</button>`)}
      ${row(svg.phone, 'phone', PHONE, PHONE_HREF, `<button class="mini" type="button" data-copy="${PHONE}">copy</button>`)}
      ${row(svg.pin, 'location', 'Casablanca, Morocco')}
      ${row(svg.github, 'github', 'github.com/YasmineKoulam', GITHUB)}
      ${row(svg.linkedin, 'linkedin', 'linkedin.com/in/yasmine-koulam', LINKEDIN)}
    </ul>
    ${section('write a message', `
      <form class="compose">
        <label>subject <input name="subject" type="text" placeholder="Internship opportunity at …" autocomplete="off"></label>
        <label>message <textarea name="body" rows="4" placeholder="Hi Yasmine,"></textarea></label>
        <button class="btn orange" type="submit">open in my mail app ${svg.send}</button>
      </form>`)}
  </article>`;
}

function renderResume() {
  return `
  <div class="pdf-bar">
    <span class="pdf-name">yasmine-koulam-cv.pdf</span>
    <a class="btn alt" href="${CV_PDF}" target="_blank" rel="noopener">${svg.external} open</a>
    <a class="btn" href="${CV_PDF}" download="Yasmine-Koulam-CV.pdf">${svg.download} download</a>
  </div>
  <object class="pdf-view" data="${CV_PDF}#view=FitH" type="application/pdf" aria-label="Yasmine Koulam CV">
    <div class="pdf-fallback">
      <p>This browser can’t preview the PDF here.</p>
      <a class="btn orange" href="${CV_PDF}" download="Yasmine-Koulam-CV.pdf">${svg.download} download the CV</a>
    </div>
  </object>`;
}

function renderFolder(item) {
  const n = item.children.length;
  return `
  <div class="addr"><span class="addr-path">${pathOf(item)}</span><span>${n} item${n === 1 ? '' : 's'}</span></div>
  ${item.blurb ? `<p class="folder-note">${item.blurb}</p>` : ''}
  <div class="folder-grid" role="list">${item.children.map(iconHTML).join('')}</div>`;
}

/* ---------------------------------------------------------------- window manager */

const desktop = $('#desktop');
const layer = $('#windows');
const taskbar = $('#taskbar');
const wins = new Map(); // item id -> { item, el, task, minimized }
let zTop = 10;
let cascade = 0;
let active = null;

function open(id, from = null) {
  const item = ITEMS[id];
  if (!item) return;
  closeStart();

  const existing = wins.get(id);
  if (existing) {
    if (existing.minimized) restore(existing);
    focus(existing);
    existing.focusInput?.();
    existing.el.classList.remove('pulse');
    void existing.el.offsetWidth; // restart the animation
    existing.el.classList.add('pulse');
    return;
  }

  const el = document.createElement('section');
  el.className = 'win';
  el.tabIndex = -1;
  el.setAttribute('role', 'dialog');
  el.setAttribute('aria-label', item.label || item.name);
  el.innerHTML = `
    <header class="win-bar">
      <span class="win-ico">${iconSvg(item)}</span>
      <span class="win-title">${pathOf(item)}</span>
      <div class="win-ctrls">
        <button class="wc wc-min" type="button" aria-label="Minimize" title="Minimize">${svg.min}</button>
        <button class="wc wc-max" type="button" aria-label="Maximize" title="Maximize">${svg.max}</button>
        <button class="wc wc-close" type="button" aria-label="Close" title="Close">${svg.close}</button>
      </div>
    </header>
    <div class="win-body"></div>
    <footer class="win-status"></footer>
    <div class="win-grip" aria-hidden="true"></div>`;

  const body = $('.win-body', el);
  if (item.kind === 'folder') {
    body.classList.add('folder');
    body.innerHTML = renderFolder(item);
  } else if (!item.mount) {
    if (item.flush) body.classList.add('flush');
    body.innerHTML = item.render(item);
  }

  // place: next to the folder it was opened from, otherwise centred and
  // cascading so stacked windows stay visible
  const dw = desktop.clientWidth;
  const dh = desktop.clientHeight;
  const w = Math.min(item.w || (item.kind === 'folder' ? 540 : 600), dw - 24);
  const h = Math.min(item.h || (item.kind === 'folder' ? 360 : 480), dh - 24);
  const step = 28 * (cascade++ % 6);
  const fromWin = from && !from.classList.contains('maximized') ? from : null;
  const x = clamp(fromWin ? fromWin.offsetLeft + 150 : (dw - w) / 2 - 20 + step, 12, Math.max(12, dw - w - 12));
  const y = clamp(fromWin ? fromWin.offsetTop + 40 : (dh - h) / 2 - 50 + step, 12, Math.max(12, dh - h - 12));
  Object.assign(el.style, { left: `${x}px`, top: `${y}px`, width: `${w}px`, height: `${h}px` });

  const task = document.createElement('button');
  task.type = 'button';
  task.className = 'task';
  task.innerHTML = `<span>${iconSvg(item)}</span><span>${item.label || item.name}</span>`;

  const win = { item, el, task, minimized: false };
  wins.set(id, win);
  if (item.mount) item.mount(body, win);
  layer.append(el);
  taskbar.append(task);

  setStatus(win);
  wireWindow(win);
  focus(win);
  el.focus({ preventScroll: true });
  win.focusInput?.();
}

function setStatus(win) {
  const { item, el } = win;
  const status = $('.win-status', el);
  if (item.status) {
    status.innerHTML = `<span>${item.name}</span><span>${item.status}</span>`;
  } else if (item.kind === 'folder') {
    const n = item.children.length;
    status.innerHTML = `<span>${n} object${n === 1 ? '' : 's'}</span><span>${touchMQ.matches ? 'tap' : 'double-click'} a file to open it</span>`;
  } else {
    const kb = (new Blob([$('.win-body', el).textContent]).size / 1024).toFixed(1);
    const type = { app: 'application', md: 'markdown', txt: 'plain text', vcf: 'vCard', pdf: 'PDF document' }[item.ext || item.kind];
    const size = item.ext === 'pdf' ? '' : ` · ${kb} KB`;
    status.innerHTML = `<span>${item.name}</span><span>${type}${size} · read-only</span>`;
  }
}

function wireWindow(win) {
  const { el, task } = win;
  const bar = $('.win-bar', el);

  el.addEventListener('pointerdown', () => focus(win));
  $('.wc-close', el).addEventListener('click', () => close(win));
  $('.wc-min', el).addEventListener('click', () => minimize(win));
  $('.wc-max', el).addEventListener('click', () => toggleMax(win));
  bar.addEventListener('dblclick', (e) => {
    if (!e.target.closest('button') && !mobileMQ.matches) toggleMax(win);
  });

  task.addEventListener('click', () => {
    if (win.minimized) { restore(win); focus(win); }
    else if (active === win) minimize(win);
    else focus(win);
  });

  // drag by the title bar
  bar.addEventListener('pointerdown', (e) => {
    if (e.button !== 0 || e.target.closest('button') || el.classList.contains('maximized') || mobileMQ.matches) return;
    e.preventDefault();
    const sx = e.clientX, sy = e.clientY;
    const ox = el.offsetLeft, oy = el.offsetTop;
    bar.setPointerCapture(e.pointerId);
    el.classList.add('dragging');

    const move = (ev) => {
      const x = clamp(ox + ev.clientX - sx, 80 - el.offsetWidth, desktop.clientWidth - 80);
      const y = clamp(oy + ev.clientY - sy, 0, desktop.clientHeight - 40);
      el.style.left = `${x}px`;
      el.style.top = `${y}px`;
    };
    const end = () => {
      el.classList.remove('dragging');
      bar.removeEventListener('pointermove', move);
      bar.removeEventListener('pointerup', end);
      bar.removeEventListener('pointercancel', end);
    };
    bar.addEventListener('pointermove', move);
    bar.addEventListener('pointerup', end);
    bar.addEventListener('pointercancel', end);
  });

  // resize from the bottom-right grip
  const grip = $('.win-grip', el);
  grip.addEventListener('pointerdown', (e) => {
    if (e.button !== 0) return;
    e.preventDefault();
    const sx = e.clientX, sy = e.clientY;
    const ow = el.offsetWidth, oh = el.offsetHeight;
    grip.setPointerCapture(e.pointerId);
    el.classList.add('dragging');

    const move = (ev) => {
      el.style.width = `${clamp(ow + ev.clientX - sx, 300, desktop.clientWidth - el.offsetLeft)}px`;
      el.style.height = `${clamp(oh + ev.clientY - sy, 200, desktop.clientHeight - el.offsetTop)}px`;
    };
    const end = () => {
      el.classList.remove('dragging');
      grip.removeEventListener('pointermove', move);
      grip.removeEventListener('pointerup', end);
      grip.removeEventListener('pointercancel', end);
    };
    grip.addEventListener('pointermove', move);
    grip.addEventListener('pointerup', end);
    grip.addEventListener('pointercancel', end);
  });
}

function focus(win) {
  if (win && active !== win) win.el.style.zIndex = ++zTop;
  active = win;
  for (const w of wins.values()) {
    const on = w === win;
    w.el.classList.toggle('active', on);
    w.task.classList.toggle('active', on);
    w.task.classList.toggle('min', w.minimized);
  }
}

function focusTopmost() {
  let top = null;
  for (const w of wins.values()) {
    if (!w.minimized && (!top || +w.el.style.zIndex > +top.el.style.zIndex)) top = w;
  }
  active = null;
  focus(top);
}

function minimize(win) {
  win.minimized = true;
  win.el.classList.add('minimized');
  focusTopmost();
}

function restore(win) {
  win.minimized = false;
  win.el.classList.remove('minimized');
}

function close(win) {
  win.el.remove();
  win.task.remove();
  wins.delete(win.item.id);
  if (active === win) focusTopmost();
}

function toggleMax(win) {
  const on = win.el.classList.toggle('maximized');
  const btn = $('.wc-max', win.el);
  btn.setAttribute('aria-label', on ? 'Restore' : 'Maximize');
  btn.title = on ? 'Restore' : 'Maximize';
}

/* ---------------------------------------------------------------- start menu */

const startBtn = $('#start-btn');
const startMenu = $('#start-menu');

function buildStart() {
  const entry = (item, sub = false) => `
    <li><button class="sm-item${sub ? ' sub' : ''}" type="button" data-open="${item.id}">${iconSvg(item)}<span>${item.label || item.name}</span></button></li>`;
  startMenu.innerHTML = `
    <p class="sm-head">C:\\YASMINE</p>
    <ul class="sm-list">
      ${TREE.filter(visible).map((it) => entry(it) + (it.children ? it.children.map((c) => entry(c, true)).join('') : '')).join('')}
    </ul>
    <div class="sm-foot">
      <button type="button" data-action="show-desktop">show desktop</button>
      <button type="button" data-action="close-all">close all</button>
    </div>`;
}

function toggleStart(force) {
  const show = force ?? startMenu.hidden;
  startMenu.hidden = !show;
  startBtn.setAttribute('aria-expanded', String(show));
}
const closeStart = () => toggleStart(false);

startBtn.addEventListener('click', (e) => {
  e.stopPropagation();
  toggleStart();
});

/* ---------------------------------------------------------------- global events */

function select(icon) {
  $$('.icon.selected').forEach((i) => i !== icon && i.classList.remove('selected'));
  icon?.classList.add('selected');
}

document.addEventListener('click', (e) => {
  const icon = e.target.closest('.icon');
  if (icon) {
    // keyboard activation (detail 0) and touch screens open on a single click
    if (e.detail === 0 || touchMQ.matches) open(icon.dataset.id, icon.closest('.win'));
    else select(icon);
    return;
  }
  select(null);

  const opener = e.target.closest('[data-open]');
  if (opener) {
    e.preventDefault();
    open(opener.dataset.open);
    return;
  }

  const copyBtn = e.target.closest('[data-copy]');
  if (copyBtn) {
    copy(copyBtn.dataset.copy);
    return;
  }

  const action = e.target.closest('[data-action]')?.dataset.action;
  if (action === 'show-desktop') wins.forEach((w) => !w.minimized && minimize(w));
  if (action === 'close-all') [...wins.values()].forEach(close);

  if (!e.target.closest('#start-menu')) closeStart();
});

document.addEventListener('dblclick', (e) => {
  const icon = e.target.closest('.icon');
  if (icon && !touchMQ.matches) open(icon.dataset.id, icon.closest('.win'));
});

document.addEventListener('keydown', (e) => {
  if (e.key !== 'Escape') return;
  if (!startMenu.hidden) { closeStart(); startBtn.focus(); return; }
  if (active) close(active);
});

document.addEventListener('submit', (e) => {
  const form = e.target.closest('.compose');
  if (!form) return;
  e.preventDefault();
  const subject = form.subject.value.trim() || 'Hello Yasmine';
  const body = form.body.value.trim();
  location.href = `mailto:${EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
});

async function copy(text) {
  try {
    await navigator.clipboard.writeText(text);
    toast(`copied ${text}`);
  } catch {
    toast(text);
  }
}

function toast(msg) {
  const t = $('#toast');
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(toast.timer);
  toast.timer = setTimeout(() => t.classList.remove('show'), 1800);
}

/* ---------------------------------------------------------------- clock */

function tick() {
  const now = new Date();
  $('#clock').textContent = now.toLocaleString('en-GB', { weekday: 'short', hour: '2-digit', minute: '2-digit' });
}

/* ---------------------------------------------------------------- boot */

function boot() {
  const screen = $('#boot');
  const log = $('#boot-log');
  const lines = [
    'YASMINE-OS BIOS v2.7',
    '',
    'checking memory ............ 640K OK',
    'loading spring-boot.sys .... OK',
    'connecting stomp://ws ...... OK',
    'mounting C:\\YASMINE ........ OK',
    '',
    'starting desktop',
  ];

  const start = () => { if (!mobileMQ.matches) open('about'); };

  let seen = false;
  try { seen = sessionStorage.getItem('yasmine-os:booted') === '1'; } catch { /* storage unavailable */ }
  if (seen || matchMedia('(prefers-reduced-motion: reduce)').matches) {
    screen.remove();
    start();
    return;
  }

  let done = false;
  const timers = [];
  const finish = () => {
    if (done) return;
    done = true;
    timers.forEach(clearTimeout);
    screen.classList.add('done');
    setTimeout(() => screen.remove(), 400);
    try { sessionStorage.setItem('yasmine-os:booted', '1'); } catch { /* ignore */ }
    start();
  };

  lines.forEach((line, i) => timers.push(setTimeout(() => { log.textContent += `${line}\n`; }, 140 * i)));
  timers.push(setTimeout(finish, 140 * lines.length + 450));
  screen.addEventListener('click', finish);
  addEventListener('keydown', finish, { once: true });
}

/* ---------------------------------------------------------------- init */

function renderDesktop() {
  const shown = TREE.filter(visible);
  $('#icons-left').innerHTML = shown.filter((i) => i.side !== 'right').map(iconHTML).join('');
  $('#icons-right').innerHTML = shown.filter((i) => i.side === 'right').map(iconHTML).join('');
}

initDev();
renderDesktop();
buildStart();
tick();
setInterval(tick, 15_000);
boot();
