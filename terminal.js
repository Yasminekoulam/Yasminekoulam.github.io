'use strict';

/* ==========================================================================
   terminal.exe: a tiny shell (ysh) over the portfolio's file tree
   ========================================================================== */

/* ---------------------------------------------------------------- ascii art */

// "ANSI Shadow" letters, only the ones the name needs
const ANSI_SHADOW = {
  Y: ['██╗   ██╗', '╚██╗ ██╔╝', ' ╚████╔╝ ', '  ╚██╔╝  ', '   ██║   ', '   ╚═╝   '],
  A: [' █████╗ ', '██╔══██╗', '███████║', '██╔══██║', '██║  ██║', '╚═╝  ╚═╝'],
  S: ['███████╗', '██╔════╝', '███████╗', '╚════██║', '███████║', '╚══════╝'],
  M: ['███╗   ███╗', '████╗ ████║', '██╔████╔██║', '██║╚██╔╝██║', '██║ ╚═╝ ██║', '╚═╝     ╚═╝'],
  I: ['██╗', '██║', '██║', '██║', '██║', '╚═╝'],
  N: ['███╗   ██╗', '████╗  ██║', '██╔██╗ ██║', '██║╚██╗██║', '██║ ╚████║', '╚═╝  ╚═══╝'],
  E: ['███████╗', '██╔════╝', '█████╗  ', '██╔══╝  ', '███████╗', '╚══════╝'],
  K: ['██╗  ██╗', '██║ ██╔╝', '█████╔╝ ', '██╔═██╗ ', '██║  ██╗', '╚═╝  ╚═╝'],
  O: [' ██████╗ ', '██╔═══██╗', '██║   ██║', '██║   ██║', '╚██████╔╝', ' ╚═════╝ '],
  U: ['██╗   ██╗', '██║   ██║', '██║   ██║', '██║   ██║', '╚██████╔╝', ' ╚═════╝ '],
  L: ['██╗     ', '██║     ', '██║     ', '██║     ', '███████╗', '╚══════╝'],
};

const bigBanner = (words) => words
  .map((word) => ANSI_SHADOW.Y.map((_, row) => [...word].map((ch) => ANSI_SHADOW[ch][row]).join('')).join('\n'))
  .join('\n');

const LOGO = [
  '╭────────────╮',
  '│            │',
  '│  ██    ██  │',
  '│   ██  ██   │',
  '│    ████    │',
  '│     ██     │',
  '│    ██      │',
  '│  ███       │',
  '│            │',
  '╰────────────╯',
].join('\n');

// Web fonts don't ship the box-drawing / block range (Google serves Latin only), so the
// browser would borrow those glyphs from whatever system font it finds and the art
// would come out differently on every machine. Drawing the character grid as SVG keeps
// it identical everywhere and lets it scale down to narrow terminals.
const CELL_W = 10;
const CELL_H = 20;
const STROKES = {
  '═': 'M0 8H10M0 12H10',
  '║': 'M3 0V20M7 0V20',
  '╗': 'M0 8H7V20M0 12H3V20',
  '╔': 'M10 8H3V20M10 12H7V20',
  '╚': 'M3 0V12H10M7 0V8H10',
  '╝': 'M7 0V12H0M3 0V8H0',
  '─': 'M0 10H10',
  '│': 'M5 0V20',
  '╭': 'M10 10H8Q5 10 5 13V20',
  '╮': 'M0 10H2Q5 10 5 13V20',
  '╰': 'M5 0V7Q5 10 8 10H10',
  '╯': 'M5 0V7Q5 10 2 10H0',
};

function artSvg(text, cls, label = '') {
  const rows = text.split('\n');
  const cols = Math.max(...rows.map((r) => [...r].length));
  let solid = '';
  let strokes = '';
  rows.forEach((row, y) => [...row].forEach((ch, x) => {
    const ox = x * CELL_W;
    const oy = y * CELL_H;
    if (ch === '█') solid += `M${ox} ${oy}h${CELL_W + 0.4}v${CELL_H + 0.4}h-${CELL_W + 0.4}z`;
    else if (STROKES[ch]) strokes += `<path transform="translate(${ox} ${oy})" d="${STROKES[ch]}"/>`;
  }));
  return `<svg class="art ${cls}" viewBox="0 0 ${cols * CELL_W} ${rows.length * CELL_H}" style="max-width:${cols * 0.62}em"
    ${label ? `role="img" aria-label="${label}"` : 'aria-hidden="true"'}>
    <path class="art-solid" d="${solid}"/>
    <g class="art-line" fill="none" stroke-width="1.6" stroke-linecap="square">${strokes}</g>
  </svg>`;
}

/* ---------------------------------------------------------------- helpers */

const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const escRe = (s) => s.replace(/[.+?^${}()|[\]\\]/g, '\\$&');
const h1 = (s) => `<span class="t-h"># ${esc(s)}</span>`;
const h2 = (s) => `<span class="t-h2">## ${esc(s)}</span>`;
const bullet = (s) => `  <span class="t-acc">-</span> ${esc(s)}`;
const lines = (...ls) => ls.flat(Infinity).filter((l) => l != null && l !== false).join('\n');

const ROOT = { id: 'root', kind: 'folder', name: '' };
const childrenOf = (node) => (node === ROOT ? TREE.filter(visible) : node.children || []);
const parentOf = (node) => (node === ROOT ? ROOT : node.parent || ROOT);
const termPath = (node) => (node === ROOT ? 'C:\\YASMINE' : pathOf(node));

// Accepts / or \, ~, C:\YASMINE\..., names with or without their extension.
function resolve(path, cwd) {
  let p = path.replace(/\//g, '\\');
  let node = cwd;
  if (p.startsWith('~')) { node = ROOT; p = p.slice(1); }
  else if (/^c:/i.test(p)) { node = ROOT; p = p.slice(2).replace(/^\\?yasmine(?=\\|$)/i, ''); }
  else if (p.startsWith('\\')) { node = ROOT; }

  for (const seg of p.split('\\').filter(Boolean)) {
    if (seg === '.') continue;
    if (seg === '..') { node = parentOf(node); continue; }
    if (node.kind !== 'folder') return null;
    const s = seg.toLowerCase();
    node = childrenOf(node).find((c) =>
      c.name.toLowerCase() === s || c.name.toLowerCase().replace(/\.[^.]+$/, '') === s || (c.label || '').toLowerCase() === s);
    if (!node) return null;
  }
  return node;
}

// resolve() plus a `*` wildcard in the last segment: cat projects/*
function expand(arg, cwd) {
  if (!arg.includes('*')) {
    const n = resolve(arg, cwd);
    return n ? [n] : [];
  }
  const norm = arg.replace(/\//g, '\\');
  const i = norm.lastIndexOf('\\');
  const dir = i >= 0 ? resolve(norm.slice(0, i) || '\\', cwd) : cwd;
  if (!dir || dir.kind !== 'folder') return [];
  const re = new RegExp(`^${norm.slice(i + 1).split('*').map(escRe).join('.*')}$`, 'i');
  return childrenOf(dir).filter((c) => re.test(c.name));
}

function tokenize(line) {
  return [...line.matchAll(/"([^"]*)"|'([^']*)'|(\S+)/g)].map((m) => m[1] ?? m[2] ?? m[3]);
}

const entryClass = (n) => (n.kind === 'folder' ? 'dir' : n.ext || n.kind);
const entry = (n) =>
  `<button type="button" class="t-link t-${entryClass(n)}" data-open="${n.id}" title="open ${esc(n.name)} in a window">${esc(n.name)}${n.kind === 'folder' ? '/' : ''}</button>`;

/* ---------------------------------------------------------------- file contents for cat */

function textRole(item) {
  const d = item.data;
  return lines(
    h1(d.title),
    `<span class="t-dim">${esc([d.org, d.place, d.when].filter(Boolean).join(' · '))}</span>`,
    d.lead && ['', esc(d.lead)],
    d.bullets && ['', h2('what i did'), d.bullets.map(bullet)],
    d.stack && ['', h2('stack'), `  ${esc(d.stack.join(' · '))}`],
  );
}

function textProject(item) {
  const d = item.data;
  return lines(
    h1(d.title),
    esc(d.lead),
    d.stat && ['', `  <span class="t-big">${esc(d.stat[0])}</span> <span class="t-dim">${esc(d.stat[1])}</span>`],
    '', h2('highlights'), d.bullets.map(bullet),
    '', h2('stack'), `  ${esc(d.stack.join(' · '))}`,
  );
}

function textSchool(item) {
  const d = item.data;
  return lines(
    h1(d.title),
    esc(d.field),
    `<span class="t-dim">${esc(`${d.school} · ${d.place} · ${d.kicker.replace(/^education · /, '')}`)}</span>`,
    d.note && ['', `  <span class="t-acc">*</span> ${esc(d.note)}`],
  );
}

function textSkills() {
  const width = Math.max(...SKILLS.map(([k]) => k.length)) + 3;
  return lines(
    '<span class="t-dim"># what I build with, grouped by layer</span>',
    '',
    SKILLS.map(([k, v]) => `<span class="t-key">${esc(k.padEnd(width))}</span>${esc(v.join(', '))}`),
  );
}

function textLanguages() {
  return lines(
    '<span class="t-dim"># spoken languages, CEFR scale A1 to C2</span>',
    '',
    LANGUAGES.map((l) =>
      `<span class="t-key">${l.name.padEnd(9)}</span><span class="t-acc">${'█'.repeat(l.level)}</span><span class="t-dim">${'░'.repeat(6 - l.level)}</span>  ${esc(l.label)}`),
  );
}

function textContact() {
  const kv = (k, v) => `<span class="t-key">${k}</span>:${v}`;
  return lines(
    kv('BEGIN', 'VCARD'),
    kv('VERSION', '4.0'),
    kv('FN', 'Yasmine Koulam'),
    kv('TITLE', 'Full-Stack Developer (Java &amp; Spring Boot)'),
    kv('EMAIL', `<a href="mailto:${EMAIL}">${EMAIL}</a>`),
    kv('TEL', `<a href="${PHONE_HREF}">${PHONE.replace(/\s/g, '')}</a>`),
    kv('ADR', ';;;Casablanca;;;Morocco'),
    kv('URL', `<a href="${GITHUB}" target="_blank" rel="noopener">${GITHUB}</a>`),
    kv('URL', `<a href="${LINKEDIN}" target="_blank" rel="noopener">${LINKEDIN}</a>`),
    kv('NOTE', 'Seeking a PFE internship'),
    kv('END', 'VCARD'),
  );
}

/* ---------------------------------------------------------------- commands */

const COMMANDS = {};
const command = (names, usage, desc, run, hidden = false) => {
  const spec = { usage, desc, run, hidden, name: names[0] };
  for (const n of names) COMMANDS[n] = { ...spec, alias: n !== names[0] };
};

command(['help', '?'], 'help', 'list these commands', (t) => {
  const list = Object.values(COMMANDS).filter((c) => !c.alias && !c.hidden);
  const width = Math.max(...list.map((c) => c.usage.length)) + 3;
  print(t, lines(
    list.map((c) => `<span class="t-key">${esc(c.usage.padEnd(width))}</span>${esc(c.desc)}`),
    '',
    '<span class="t-dim">tab completes, ↑ ↓ walk history, ctrl+l clears. paths take / or \\.</span>',
  ), 't-pre');
});

command(['ls', 'dir'], 'ls [dir]', 'list a directory (-l for details)', (t, args) => {
  const target = args.find((a) => !a.startsWith('-'));
  const node = target ? resolve(target, t.cwd) : t.cwd;
  if (!node) return print(t, `ls: ${esc(target)}: no such file or directory`, 't-err');
  const list = node.kind === 'folder' ? childrenOf(node) : [node];
  if (!args.some((a) => /^-\w*l/.test(a))) return print(t, list.map(entry).join(''), 't-ls');

  print(t, list.map((n) => {
    const isDir = n.kind === 'folder';
    const size = isDir ? `${n.children.length} items` : n.text ? `${(plain(n.text(n)).length / 1024).toFixed(1)}K` : 'binary';
    return `<span class="t-dim">${isDir ? 'dr-xr-xr-x' : '-r--r--r--'}  yasmine  ${size.padStart(8)}</span>  ${entry(n)}`;
  }).join('\n'), 't-pre');
});

command(['cd'], 'cd <dir>', 'change directory', (t, [arg]) => {
  if (!arg) { t.cwd = ROOT; return; }
  const n = resolve(arg, t.cwd);
  if (!n) return print(t, `cd: ${esc(arg)}: no such directory`, 't-err');
  if (n.kind !== 'folder') return print(t, `cd: ${esc(arg)}: not a directory`, 't-err');
  t.cwd = n;
});

command(['pwd'], 'pwd', 'print the current directory', (t) => print(t, esc(termPath(t.cwd))));

command(['cat', 'type'], 'cat <file...>', 'print a file. try cat experience', (t, args) => {
  const targets = args.filter((a) => !a.startsWith('-'));
  if (!targets.length) return print(t, 'usage: cat &lt;file&gt;   e.g. <b>cat experience</b> or <b>cat projects/*</b>', 't-dim');

  // a directory prints every file inside it
  const files = [];
  for (const a of targets) {
    const nodes = expand(a, t.cwd);
    if (!nodes.length) { print(t, `cat: ${esc(a)}: no such file or directory`, 't-err'); continue; }
    for (const n of nodes) {
      if (n === ROOT) print(t, 'cat: C:\\YASMINE: that is the whole desktop. try <b>tree</b>', 't-err');
      else if (n.kind === 'folder') files.push(...n.children.filter((c) => c.kind !== 'folder'));
      else files.push(n);
    }
  }

  files.forEach((n) => {
    if (files.length > 1) print(t, `==&gt; ${esc(pathOf(n))} &lt;==`, 't-file');
    if (n.text) print(t, n.text(n), 't-pre');
    else print(t, `cat: ${esc(n.name)}: binary file. try <b>explorer ${esc(n.name)}</b>`, 't-err');
  });
});

command(['explorer', 'open', 'start'], 'explorer [path]', 'open a file or folder in a window', (t, args) => {
  const arg = args.find((a) => !a.startsWith('-')) || '.';
  const nodes = expand(arg, t.cwd);
  if (!nodes.length) return print(t, `explorer: ${esc(arg)}: no such file or directory`, 't-err');
  for (const n of nodes) {
    if (n === ROOT) {
      wins.forEach((w) => w !== t.win && !w.minimized && minimize(w));
      print(t, 'explorer: showing the desktop', 't-dim');
    } else if (n.id === 'terminal') {
      print(t, 'explorer: you are already here', 't-dim');
    } else {
      open(n.id, t.win.el);
      print(t, `opening ${esc(pathOf(n))}`, 't-dim');
    }
  }
});

command(['tree'], 'tree [dir]', 'show the file tree', (t, [arg]) => {
  const root = arg ? resolve(arg, t.cwd) : t.cwd;
  if (!root || root.kind !== 'folder') return print(t, `tree: ${esc(arg)}: not a directory`, 't-err');
  const out = [`<span class="t-dir">${esc(termPath(root))}</span>`];
  let dirs = 0, files = 0;
  const walk = (node, prefix) => {
    const kids = childrenOf(node);
    kids.forEach((k, i) => {
      const last = i === kids.length - 1;
      out.push(`<span class="t-dim">${prefix}${last ? '└── ' : '├── '}</span>${entry(k)}`);
      if (k.kind === 'folder') { dirs++; walk(k, prefix + (last ? '    ' : '│   ')); } else files++;
    });
  };
  walk(root, '');
  out.push('', `<span class="t-dim">${dirs} directories, ${files} files</span>`);
  print(t, out.join('\n'), 't-pre');
});

command(['neofetch', 'fastfetch'], 'neofetch', 'system information', (t) => neofetch(t));

command(['whoami'], 'whoami', 'who is this?', (t) => print(t, lines(
  'yasmine',
  '<span class="t-dim">full-stack developer · java &amp; spring boot · casablanca</span>',
)));

command(['echo'], 'echo <text>', 'print text', (t, args) => print(t, esc(args.join(' '))));

command(['date'], 'date', 'print the date', (t) =>
  print(t, esc(new Date().toLocaleString('en-GB', { dateStyle: 'full', timeStyle: 'medium' }))));

command(['history'], 'history', 'previous commands', (t) =>
  print(t, t.history.map((h, i) => `<span class="t-dim">${String(i + 1).padStart(4)}</span>  ${esc(h)}`).join('\n'), 't-pre'));

command(['clear', 'cls'], 'clear', 'clear the screen', (t) => { t.out.innerHTML = ''; });

command(['exit'], 'exit', 'close the terminal', (t) => setTimeout(() => close(t.win), 120));

command(['dev'], 'dev [on|off]', 'toggle dev mode (font lab)', (t, [arg]) => {
  if (arg === 'on' || arg === 'off') setDev(arg === 'on');
  print(t, DEV
    ? 'dev mode <span class="t-acc">on</span>. run <b>fontlab</b> or open fontlab.exe on the desktop'
    : 'dev mode <span class="t-dim">off</span>. turn it on with <b>dev on</b> or ?dev in the url');
});

command(['fontlab'], 'fontlab', 'pick the site fonts (dev mode)', (t) => {
  if (!DEV) return print(t, 'fontlab: only available in dev mode. run <b>dev on</b> first', 't-err');
  open('fontlab', t.win.el);
});

command(['rm'], 'rm', '', (t, args) => {
  const flags = args.filter((a) => a.startsWith('-')).join('');
  if (/r/i.test(flags) && /f/.test(flags)) return print(t, 'Nice try better luck next time ;)', 't-h');
  print(t, 'rm: permission denied, this portfolio is read-only', 't-err');
}, true);

command(['sudo'], 'sudo', '', (t, args) => {
  if (args[0] === 'rm') return COMMANDS.rm.run(t, args.slice(1));
  print(t, lines(
    '[sudo] password for yasmine: ',
    '<span class="t-err">yasmine is not in the sudoers file. this incident will be reported to the recruiter.</span>',
  ));
}, true);

/* ---------------------------------------------------------------- neofetch */

const bootedAt = Date.now();

function uptime() {
  const s = Math.floor((Date.now() - bootedAt) / 1000);
  const m = Math.floor(s / 60);
  const plural = (n, unit) => `${n} ${unit}${n === 1 ? '' : 's'}`;
  return m ? `${plural(m, 'min')}, ${plural(s % 60, 'sec')}` : plural(s, 'sec');
}

const cssFont = (v) => getComputedStyle(document.documentElement).getPropertyValue(v).split(',')[0].replace(/['"]/g, '').trim();

function neofetch(t) {
  const skills = SKILLS.reduce((n, [, v]) => n + v.length, 0);
  const projects = ITEMS.projects.children.map((p) => p.data.title);
  const info = [
    ['OS', 'yasmine.os (web)'],
    ['Host', 'FST Settat, Computer Science Engineering'],
    ['Kernel', 'Java + Spring Boot'],
    ['Uptime', uptime()],
    ['Packages', `${skills} skills in ${SKILLS.length} groups`],
    ['Shell', 'ysh 1.0'],
    ['Resolution', `${innerWidth}x${innerHeight}`],
    ['Font', `${cssFont('--sans')} / ${cssFont('--term')}`],
    ['Role', 'Full-stack developer'],
    ['Location', 'Casablanca, Morocco'],
    ['Experience', 'Institut Pasteur du Maroc (2025)'],
    ['Projects', projects.join(', ')],
    ['Peak load', '3,000 concurrent users'],
    ['Languages', LANGUAGES.map((l) => l.name).join(', ')],
    ['Status', '<span class="t-ok">●</span> seeking a PFE internship'],
  ];
  const swatches = ['#2a2a22', '#e05a4f', '#6b7350', '#f8e58f', '#3b7fc4', '#ef8db8', '#e8802a', '#fbf8ee'];

  print(t, `
    <div class="nf">
      ${artSvg(bigBanner(['YASMINE', 'KOULAM']), 'nf-banner', 'Yasmine Koulam')}
      <div class="nf-body">
        ${artSvg(LOGO, 'nf-logo')}
        <div class="nf-info">
          <div><span class="t-h">yasmine</span>@<span class="t-h">portfolio</span></div>
          <div class="t-dim">-----------------</div>
          ${info.map(([k, v]) => `<div><span class="t-key">${k}</span>: ${k === 'Status' ? v : esc(v)}</div>`).join('')}
          <div class="nf-swatches" aria-hidden="true">${swatches.map((c) => `<i style="background:${c}"></i>`).join('')}</div>
        </div>
      </div>
    </div>`, 't-raw');
}

/* ---------------------------------------------------------------- shell */

function plain(html) {
  const d = document.createElement('div');
  d.innerHTML = html;
  return d.textContent;
}

function print(t, html = '', cls = '') {
  const line = document.createElement('div');
  line.className = `t-block${cls ? ` ${cls}` : ''}`;
  line.innerHTML = html;
  t.out.append(line);
  return line;
}

const promptText = (t) => `${termPath(t.cwd)}>`;

function run(t, raw) {
  print(t, `<span class="t-prompt">${esc(promptText(t))}</span>${esc(raw)}`, 't-echo');
  const line = raw.trim();
  if (line && line !== t.history[t.history.length - 1]) t.history.push(line);
  t.hi = t.history.length;
  for (const part of line.split('&&')) exec(t, part.trim());
  t.prompt.textContent = promptText(t);
  t.el.scrollTop = t.el.scrollHeight;
}

function exec(t, line) {
  const [name, ...args] = tokenize(line);
  if (!name) return;
  const cmd = COMMANDS[name.toLowerCase()];
  if (cmd) return cmd.run(t, args);

  // run an app by name: profile.exe, ./terminal.exe
  const node = resolve(name.replace(/^\.[\\/]/, ''), t.cwd);
  if (node && node !== ROOT) {
    if (node.kind === 'app' && node.id !== 'terminal') {
      open(node.id, t.win.el);
      return print(t, `starting ${esc(node.name)}`, 't-dim');
    }
    return print(t, `ysh: ${esc(name)}: not executable. try <b>cat ${esc(name)}</b> or <b>explorer ${esc(name)}</b>`, 't-err');
  }
  print(t, `ysh: command not found: ${esc(name)}. type <b>help</b>`, 't-err');
}

function complete(t) {
  const [, before, word] = t.input.value.match(/^(.*?)(\S*)$/);
  let options;
  if (!before.trim()) {
    options = Object.keys(COMMANDS)
      .filter((k) => !COMMANDS[k].hidden && k !== '?' && k.startsWith(word.toLowerCase()))
      .map((k) => ({ text: `${k} `, label: k }));
  } else {
    const norm = word.replace(/\\/g, '/');
    const i = norm.lastIndexOf('/');
    const dir = i >= 0 ? resolve(norm.slice(0, i) || '/', t.cwd) : t.cwd;
    if (!dir || dir.kind !== 'folder') return;
    const prefix = norm.slice(i + 1).toLowerCase();
    options = childrenOf(dir)
      .filter((c) => c.name.toLowerCase().startsWith(prefix))
      .map((c) => {
        const name = c.name + (c.kind === 'folder' ? '/' : '');
        return { text: word.slice(0, i + 1) + name + (c.kind === 'folder' ? '' : ' '), label: name };
      });
  }

  if (!options.length) return;
  if (options.length === 1) { t.input.value = before + options[0].text; return; }

  let common = options[0].text;
  for (const { text } of options) {
    while (!text.toLowerCase().startsWith(common.toLowerCase())) common = common.slice(0, -1);
  }
  if (common.length > word.length) {
    t.input.value = before + common;
  } else {
    print(t, `<span class="t-prompt">${esc(promptText(t))}</span>${esc(t.input.value)}`, 't-echo');
    print(t, options.map((o) => esc(o.label)).join('   '), 't-dim');
    t.el.scrollTop = t.el.scrollHeight;
  }
}

function mountTerminal(body, win) {
  body.classList.add('flush');
  body.innerHTML = `
    <div class="term">
      <div class="term-out" role="log" aria-live="polite"></div>
      <form class="term-line" autocomplete="off">
        <label class="term-prompt" for="term-input"></label>
        <input id="term-input" class="term-input" type="text" spellcheck="false" autocapitalize="off" autocorrect="off" enterkeyhint="go" aria-label="Command">
      </form>
    </div>`;

  const t = {
    win,
    cwd: ROOT,
    history: [],
    hi: 0,
    el: $('.term', body),
    out: $('.term-out', body),
    input: $('.term-input', body),
    prompt: $('.term-prompt', body),
  };
  t.prompt.textContent = promptText(t);

  print(t, lines(
    '<span class="t-h">yasmine.os</span> terminal <span class="t-dim">[ysh 1.0]</span>',
    '<span class="t-dim">type</span> help <span class="t-dim">for commands. try one of these:</span>',
  ));
  print(t, ['neofetch', 'ls', 'cat experience', 'explorer projects', 'tree']
    .map((c) => `<button type="button" class="t-chip" data-run="${c}">${c}</button>`).join(''), 't-chips');

  $('.term-line', body).addEventListener('submit', (e) => {
    e.preventDefault();
    const value = t.input.value;
    t.input.value = '';
    run(t, value);
  });

  t.input.addEventListener('keydown', (e) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      complete(t);
    } else if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
      e.preventDefault();
      t.hi = clamp(t.hi + (e.key === 'ArrowUp' ? -1 : 1), 0, t.history.length);
      t.input.value = t.history[t.hi] ?? '';
      requestAnimationFrame(() => t.input.setSelectionRange(t.input.value.length, t.input.value.length));
    } else if (e.ctrlKey && e.key.toLowerCase() === 'l') {
      e.preventDefault();
      t.out.innerHTML = '';
    } else if (e.ctrlKey && e.key.toLowerCase() === 'c' && t.input.selectionStart === t.input.selectionEnd) {
      e.preventDefault();
      print(t, `<span class="t-prompt">${esc(promptText(t))}</span>${esc(t.input.value)}^C`, 't-echo');
      t.input.value = '';
      t.el.scrollTop = t.el.scrollHeight;
    } else if (e.key === 'Escape') {
      e.stopPropagation(); // don't let the desktop close the window
      t.input.value = '';
    }
  });

  t.el.addEventListener('click', (e) => {
    const chip = e.target.closest('[data-run]');
    if (chip) run(t, chip.dataset.run);
    if (e.target.closest('a, [data-open]') || String(getSelection())) return;
    t.input.focus({ preventScroll: true });
  });

  win.focusInput = () => t.input.focus({ preventScroll: true });
}
