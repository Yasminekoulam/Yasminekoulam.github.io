'use strict';

/* ==========================================================================
   fontlab.exe (dev only): try fonts live, then copy the CSS to lock them in.
   Turn dev mode on with ?dev in the url (or `dev on` in the terminal),
   off with ?dev=0 (or `dev off`). Choices live in this browser only.
   ========================================================================== */

const MONO_FONTS = [
  'Red Hat Mono', 'Space Mono', 'JetBrains Mono', 'IBM Plex Mono', 'DM Mono', 'Fira Code', 'Martian Mono',
  'Geist Mono', 'Azeret Mono', 'Victor Mono', 'Spline Sans Mono', 'Sometype Mono', 'Reddit Mono',
  'Kode Mono', 'Courier Prime', 'Cutive Mono', 'Xanh Mono', 'Syne Mono', 'Share Tech Mono', 'VT323',
];

const FONT_ROLES = {
  display: {
    label: 'display',
    use: 'the big PORTFOLIO wallpaper, avatar initials, big numbers',
    sample: 'PORTFOLIO 3,000',
    fallback: 'var(--sans)',
    default: 'Jersey 10',
    fonts: [
      'Jersey 10', 'Saira', 'Silkscreen', 'Pixelify Sans', 'Micro 5', 'DotGothic16', 'Workbench', 'Sixtyfour',
      'Doto', 'Press Start 2P', 'VT323', 'Major Mono Display', 'Rubik Mono One', 'Bungee', 'Monoton',
      'Tilt Warp', 'Unbounded', 'Big Shoulders Display', 'Tektur', 'Orbitron', 'Audiowide', 'Righteous',
      'Instrument Serif', 'Fraunces',
    ],
  },
  sans: {
    label: 'interface',
    use: 'body copy, headings, icon labels',
    sample: 'hi! i’m Yasmine Koulam, full-stack developer',
    fallback: "system-ui, -apple-system, 'Segoe UI', sans-serif",
    default: 'Sora',
    fonts: [
      'Sora', 'DM Sans', 'Space Grotesk', 'Rubik', 'Outfit', 'Bricolage Grotesque', 'Schibsted Grotesk',
      'Familjen Grotesk', 'Instrument Sans', 'Hanken Grotesk', 'Gabarito', 'Onest', 'Manrope', 'Lexend',
      'Work Sans', 'IBM Plex Sans', 'Archivo', 'Atkinson Hyperlegible', 'Nunito', 'Pixelify Sans',
    ],
  },
  mono: {
    label: 'mono',
    use: 'window titles, tags, buttons, status bars',
    sample: 'C:\\YASMINE\\projects\\deepdame.md',
    fallback: 'ui-monospace, SFMono-Regular, Menlo, monospace',
    default: 'Red Hat Mono',
    fonts: MONO_FONTS,
  },
  term: {
    label: 'terminal',
    use: 'everything inside terminal.exe (the neofetch art is drawn as SVG, so any font works)',
    sample: 'C:\\YASMINE> cat experience',
    fallback: "'DejaVu Sans Mono', Menlo, Consolas, monospace",
    default: 'JetBrains Mono',
    fonts: ['JetBrains Mono', 'IBM Plex Mono', 'Fira Code', 'Fira Mono', 'Source Code Pro', 'Roboto Mono',
      'Ubuntu Mono', 'Noto Sans Mono', ...MONO_FONTS.filter((f) => !['JetBrains Mono', 'IBM Plex Mono', 'Fira Code'].includes(f))],
  },
};

const DEFAULT_WEIGHT = 400;
const DEV_KEY = 'yasmine-os:dev';
const FONT_KEY = 'yasmine-os:fonts';

const store = {
  get(k) { try { return localStorage.getItem(k); } catch { return null; } },
  set(k, v) { try { if (v == null) localStorage.removeItem(k); else localStorage.setItem(k, v); } catch { /* storage unavailable */ } },
};

let DEV = false;
let fontState = {}; // { display, sans, mono, term, weight }
let redrawLab = null;

/* ---------------------------------------------------------------- loading */

// family specs already requested by index.html
const fontSpec = new Map([
  ['Jersey 10', 'Jersey+10'],
  ['Sora', 'Sora:wght@400;500;700'],
  ['Red Hat Mono', 'Red+Hat+Mono:wght@400;500;700'],
  ['JetBrains Mono', 'JetBrains+Mono:wght@400;700'],
]);
const fontPending = new Set();

// Google Fonts returns whichever of these weights a family has, and a 400 for unknown names.
function loadFont(name) {
  if (fontSpec.has(name) || fontPending.has(name)) return;
  fontPending.add(name);
  const spec = `${name.trim().replace(/\s+/g, '+')}:wght@200;300;400;500;700`;
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = `https://fonts.googleapis.com/css2?family=${spec}&display=swap`;
  link.onload = () => { fontPending.delete(name); fontSpec.set(name, spec); };
  link.onerror = () => {
    fontPending.delete(name);
    link.remove();
    toast(`"${name}" isn't on Google Fonts. check the exact name`);
    // undo the choice so the site doesn't sit on a fallback font
    for (const role of Object.keys(FONT_ROLES)) if (fontState[role] === name) delete fontState[role];
    saveFonts();
    applyFonts();
    if (wins.has('fontlab')) redrawLab?.();
  };
  document.head.append(link);
}

const stackFor = (role, name) => `'${name}', ${FONT_ROLES[role].fallback}`;
const chosen = (role) => fontState[role] || FONT_ROLES[role].default;

function applyFonts() {
  const root = document.documentElement.style;
  for (const role of Object.keys(FONT_ROLES)) {
    if (fontState[role] && fontState[role] !== FONT_ROLES[role].default) {
      loadFont(fontState[role]);
      root.setProperty(`--${role}`, stackFor(role, fontState[role]));
    } else {
      root.removeProperty(`--${role}`);
    }
  }
  if (fontState.weight) root.setProperty('--display-weight', fontState.weight);
  else root.removeProperty('--display-weight');
}

function clearFonts() {
  const root = document.documentElement.style;
  for (const role of Object.keys(FONT_ROLES)) root.removeProperty(`--${role}`);
  root.removeProperty('--display-weight');
}

const saveFonts = () => store.set(FONT_KEY, JSON.stringify(fontState));

/* ---------------------------------------------------------------- dev mode */

function initDev() {
  const q = new URLSearchParams(location.search);
  if (q.has('dev')) store.set(DEV_KEY, /^(0|off|false)$/i.test(q.get('dev')) ? null : '1');
  DEV = store.get(DEV_KEY) === '1';
  try { fontState = JSON.parse(store.get(FONT_KEY)) || {}; } catch { fontState = {}; }
  document.documentElement.classList.toggle('dev', DEV);
  if (DEV) applyFonts();
}

function setDev(on) {
  DEV = on;
  store.set(DEV_KEY, on ? '1' : null);
  document.documentElement.classList.toggle('dev', on);
  if (on) {
    applyFonts();
  } else {
    clearFonts();
    const lab = wins.get('fontlab');
    if (lab) close(lab);
  }
  renderDesktop();
  buildStart();
}

/* ---------------------------------------------------------------- css export */

function cssSnippet() {
  const vars = Object.keys(FONT_ROLES).map((role) => `  --${role}: ${stackFor(role, chosen(role))};`);
  const families = [...new Set(Object.keys(FONT_ROLES).map(chosen))]
    .map((n) => `family=${fontSpec.get(n) || n.replace(/\s+/g, '+')}`);
  return [
    '/* style.css, inside :root */',
    ...vars,
    `  --display-weight: ${fontState.weight || DEFAULT_WEIGHT};`,
    '',
    '<!-- index.html, replace the Google Fonts <link> -->',
    `<link href="https://fonts.googleapis.com/css2?${families.join('&')}&display=swap" rel="stylesheet">`,
  ].join('\n');
}

/* ---------------------------------------------------------------- window */

function mountFontlab(body) {
  let role = 'display';
  body.classList.add('flush');
  body.innerHTML = `
    <div class="lab">
      <div class="lab-tabs" role="tablist">
        ${Object.entries(FONT_ROLES).map(([k, r]) => `<button type="button" role="tab" data-role="${k}">${r.label}</button>`).join('')}
      </div>
      <div class="lab-head"></div>
      <div class="lab-list" role="listbox"></div>
      <details class="lab-css"><summary>css to lock it in</summary><pre></pre></details>
      <div class="lab-foot">
        <button type="button" class="mini" data-lab="shuffle">shuffle all</button>
        <button type="button" class="mini" data-lab="reset">reset</button>
        <button type="button" class="btn" data-lab="copy">copy css</button>
      </div>
    </div>`;

  const lab = $('.lab', body);
  const list = $('.lab-list', lab);

  const draw = (keepScroll = false) => {
    const r = FONT_ROLES[role];
    const current = chosen(role);
    const weight = fontState.weight || DEFAULT_WEIGHT;
    const fonts = r.fonts.includes(current) ? r.fonts : [current, ...r.fonts];
    const scroll = list.scrollTop;

    $$('[role="tab"]', lab).forEach((b) => b.setAttribute('aria-selected', String(b.dataset.role === role)));

    $('.lab-head', lab).innerHTML = `
      <p class="lab-use">${r.use}</p>
      ${role === 'display' ? `
        <label class="lab-weight">weight
          <input type="range" min="100" max="900" step="100" value="${weight}">
          <output>${weight}</output>
        </label>` : ''}
      <form class="lab-custom">
        <input name="font" type="text" placeholder="any Google Font, e.g. Bagel Fat One" autocomplete="off" spellcheck="false">
        <button class="mini" type="submit">try it</button>
      </form>`;

    fonts.forEach(loadFont);
    list.innerHTML = fonts.map((name) => `
      <button type="button" class="lab-opt${name === current ? ' on' : ''}" role="option" aria-selected="${name === current}" data-font="${name}">
        <span class="lab-sample lab-${role}" style="font-family:'${name}', ${r.fallback};${role === 'display' ? ` font-weight:${weight}` : ''}">${r.sample}</span>
        <span class="lab-name">${name}${name === r.default ? ' · default' : ''}</span>
      </button>`).join('');
    if (keepScroll) list.scrollTop = scroll;

    $('.lab-css pre', lab).textContent = cssSnippet();
  };

  const choose = (name) => {
    if (name === FONT_ROLES[role].default) delete fontState[role];
    else fontState[role] = name;
    saveFonts();
    applyFonts();
    draw(true);
  };

  lab.addEventListener('click', (e) => {
    const tab = e.target.closest('[data-role]');
    if (tab) { role = tab.dataset.role; draw(); list.scrollTop = 0; return; }

    const opt = e.target.closest('[data-font]');
    if (opt) { choose(opt.dataset.font); return; }

    const action = e.target.closest('[data-lab]')?.dataset.lab;
    if (action === 'shuffle') {
      for (const [k, r] of Object.entries(FONT_ROLES)) fontState[k] = r.fonts[Math.floor(Math.random() * r.fonts.length)];
      saveFonts(); applyFonts(); draw();
    } else if (action === 'reset') {
      fontState = {};
      saveFonts(); applyFonts(); draw();
    } else if (action === 'copy') {
      navigator.clipboard.writeText(cssSnippet())
        .then(() => toast('css copied, paste it into style.css and index.html'))
        .catch(() => { $('.lab-css', lab).open = true; toast('copy blocked, the css is shown below'); });
    }
  });

  lab.addEventListener('input', (e) => {
    if (e.target.type !== 'range') return;
    const w = Number(e.target.value);
    $('output', e.target.parentElement).textContent = w;
    if (w === DEFAULT_WEIGHT) delete fontState.weight;
    else fontState.weight = w;
    $$('.lab-sample', list).forEach((s) => { s.style.fontWeight = w; });
    saveFonts();
    applyFonts();
    $('.lab-css pre', lab).textContent = cssSnippet();
  });

  lab.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = e.target.font.value.trim().replace(/\s+/g, ' ');
    if (!/^[\w ]{2,60}$/.test(name)) return toast('letters, numbers and spaces only');
    choose(name);
  });

  redrawLab = () => draw(true);
  draw();
}
