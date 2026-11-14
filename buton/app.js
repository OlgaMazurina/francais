(function () {
'use strict';
const app = document.getElementById('app');

// ---------- dates ----------
const pad = (n) => (n < 10 ? '0' : '') + n;
const ds = (d) => d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
const parse = (s) => { const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d); };
const addDays = (s, n) => { const d = parse(s); d.setDate(d.getDate() + n); return ds(d); };
const wdi = (s) => (parse(s).getDay() + 6) % 7; // Monday = 0
const TODAY = () => ds(new Date());
const WD = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
const WD1 = ['П', 'В', 'С', 'Ч', 'П', 'С', 'В'];
const MONTHS = ['январь', 'февраль', 'март', 'апрель', 'май', 'июнь', 'июль', 'август', 'сентябрь', 'октябрь', 'ноябрь', 'декабрь'];
const MONTHS_G = ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'];
const WDL = ['понедельник', 'вторник', 'среда', 'четверг', 'пятница', 'суббота', 'воскресенье'];
const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);
const longDate = (s) => { const d = parse(s); return cap(WDL[wdi(s)]) + ', ' + d.getDate() + ' ' + MONTHS_G[d.getMonth()]; };
const plural = (n, a, b, c) => { const m10 = n % 10, m100 = n % 100; return m10 === 1 && m100 !== 11 ? a : (m10 >= 2 && m10 <= 4 && (m100 < 10 || m100 >= 20) ? b : c); };
const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const uid = () => Math.random().toString(36).slice(2, 9);

// ---------- palette ----------
const COLORS = [['#F2B8B5', 'роза'], ['#F7C9A8', 'персик'], ['#F5DE9A', 'лютик'], ['#C8E3C2', 'мята'], ['#BFD8EE', 'незабудка'], ['#9DB8E6', 'василёк'], ['#D5C6EE', 'лаванда'], ['#E4CFC0', 'миндаль']];
const MOODS = [['Плохо', '#C9C3D9'], ['Так себе', '#BFD8EE'], ['Нормально', '#F5DE9A'], ['Хорошо', '#F7C9A8'], ['Отлично', '#F2B8B5']];
const FEELINGS = ['Спокойствие', 'Радость', 'Благодарность', 'Усталость', 'Тревога', 'Вдохновение', 'Одиночество', 'Любовь', 'Раздражение', 'Энергия'];
const RARE = [['daisy', 3, '#F5DE9A'], ['tulip', 7, '#F7C9A8'], ['peony', 14, '#F2B8B5'], ['lily', 30, '#D5C6EE'], ['lotus', 60, '#F2B8B5'], ['orchid', 100, '#E4B6D6']];
const tagColors = (hex) => {
  // light background + darker readable text derived from category color
  const n = parseInt(hex.slice(1), 16), r = n >> 16, g = (n >> 8) & 255, b = n & 255;
  const mix = (c, t, k) => Math.round(c + (t - c) * k);
  const bg = 'rgb(' + mix(r, 255, .7) + ',' + mix(g, 255, .7) + ',' + mix(b, 255, .7) + ')';
  const fg = 'rgb(' + mix(r, 0, .62) + ',' + mix(g, 0, .62) + ',' + mix(b, 0, .62) + ')';
  return [bg, fg];
};

// ---------- storage ----------
const KEY = 'buton-v1';
function seed() {
  const t = TODAY();
  return {
    name: '',
    cats: [{ id: 'home', name: 'Дом', color: '#F7C9A8' }, { id: 'work', name: 'Работа', color: '#9DB8E6' }, { id: 'study', name: 'Учёба', color: '#D5C6EE' }, { id: 'health', name: 'Здоровье', color: '#C8E3C2' }, { id: 'me', name: 'Личное', color: '#F2B8B5' }],
    tasks: [{ id: uid(), title: 'Добавить свои задачи', date: t, time: '', rep: 'none', days: [], imp: 0, cat: 'me', done: {}, skip: {} }],
    habits: [
      { id: uid(), name: 'Пить воду', color: '#BFD8EE', target: 8, days: [1, 1, 1, 1, 1, 1, 1], log: {}, created: t },
      { id: uid(), name: 'Читать 20 минут', color: '#F2B8B5', target: 1, days: [1, 1, 1, 1, 1, 1, 1], log: {}, created: t }
    ],
    mood: {}
  };
}
let S;
try { S = JSON.parse(localStorage.getItem(KEY) || 'null'); } catch (e) { S = null; }
if (!S || !S.tasks) S = seed();
function save() { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) { toast('Не удалось сохранить: память браузера недоступна'); } }
const catById = (id) => S.cats.find((c) => c.id === id);

// ---------- tasks ----------
function occurs(t, d) {
  if (t.skip && t.skip[d]) return false;
  if (t.rep === 'none') return t.date === d;
  if (d < t.date) return false;
  if (t.until && d > t.until) return false;
  if (t.rep === 'daily') return true;
  if (t.rep === 'weekdays') return wdi(d) < 5;
  if (t.rep === 'weekly') return (t.days || []).includes(wdi(d));
  if (t.rep === 'monthly') return parse(d).getDate() === parse(t.date).getDate();
  return false;
}
const tasksOn = (d) => S.tasks.filter((t) => occurs(t, d)).sort((a, b) => (a.done[d] ? 1 : 0) - (b.done[d] ? 1 : 0) || (a.time || '99').localeCompare(b.time || '99') || b.imp - a.imp);
function repText(t) {
  if (t.rep === 'daily') return 'каждый день';
  if (t.rep === 'weekdays') return 'по будням';
  if (t.rep === 'monthly') return 'каждый месяц';
  if (t.rep === 'weekly') { const d = (t.days || []).slice().sort(); return d.length === 7 ? 'каждый день' : d.map((i) => WD[i].toLowerCase()).join(', '); }
  return '';
}

// ---------- habits ----------
const scheduled = (h, d) => d >= h.created && !!h.days[wdi(d)];
const count = (h, d) => (h.log[d] || 0);
const complete = (h, d) => count(h, d) >= h.target;
function stage(h, d) { const r = count(h, d) / h.target; return r >= 1 ? 3 : r >= 0.5 ? 2 : r > 0 ? 1 : 0; }
function streak(h) {
  let d = TODAY(), n = 0;
  if (scheduled(h, d) && !complete(h, d)) d = addDays(d, -1);
  for (let i = 0; i < 1000 && d >= h.created; i++, d = addDays(d, -1)) {
    if (!scheduled(h, d)) continue;
    if (complete(h, d)) n++; else break;
  }
  return n;
}
function runs(h, from, to) { // returns map date -> run length on completed days, and best
  const out = {}; let run = 0, best = 0;
  for (let d = h.created; d <= to; d = addDays(d, 1)) {
    if (!scheduled(h, d)) continue;
    if (complete(h, d)) { run++; best = Math.max(best, run); if (d >= from) out[d] = run; } else if (d < TODAY()) run = 0;
  }
  return { map: out, best };
}
const bestStreak = (h) => runs(h, TODAY(), TODAY()).best;
const bestAll = () => S.habits.reduce((m, h) => Math.max(m, bestStreak(h)), 0);
function kindFor(run) { let k = 'daisy'; RARE.forEach(([kind, n]) => { if (run === n) k = kind; }); return run >= 3 && RARE.some(([, n]) => n === run) ? k : 'daisy'; }

// ---------- flower svg ----------
function flower(stg, color, size, kind, locked, extra) {
  kind = kind || 'daisy'; size = size || 56;
  const grey = '#E4DCD5';
  const c = locked ? grey : color;
  const heart = locked ? '#D6CCC4' : (kind === 'orchid' ? '#C2577D' : kind === 'lily' ? '#B5651D' : '#F5DE9A');
  const stem = locked ? '#D6CCC4' : '#8FB28A', leaf = locked ? '#E0D7CF' : '#A9C9A3';
  const leaves = '<path d="M30 60 C22 59 18 52 19 48 C26 49 30 54 30 60Z" fill="' + leaf + '"/><path d="M30 64 C38 63 42 56 41 52 C34 53 30 58 30 64Z" fill="' + leaf + '"/>';
  let g = '<ellipse cx="30" cy="76" rx="18" ry="3.5" fill="#EADBCF"/>';
  if (stg === 0) g += '<ellipse cx="30" cy="72" rx="4.5" ry="2.8" fill="#B98D6A"/>';
  else if (stg === 1) g += '<path d="M30 76 V62" stroke="' + stem + '" stroke-width="2.5" stroke-linecap="round" fill="none"/><path d="M30 64 C25 63 22 59 23 55 C27 56 30 60 30 64Z" fill="' + leaf + '"/><path d="M30 64 C35 63 38 59 37 55 C33 56 30 60 30 64Z" fill="' + leaf + '"/>';
  else if (stg === 2) g += '<path d="M30 76 C30 62 31 48 30 36" stroke="' + stem + '" stroke-width="2.5" stroke-linecap="round" fill="none"/>' + leaves + '<ellipse cx="30" cy="27" rx="6.5" ry="10" fill="' + c + '"/><path d="M23 33 Q30 41 37 33 Q30 37 23 33Z" fill="' + stem + '"/>';
  else {
    g += '<path d="M30 76 C30 62 31 46 30 32" stroke="' + stem + '" stroke-width="2.5" stroke-linecap="round" fill="none"/>' + leaves;
    const rot = (el, n, cx, cy) => { let s = ''; for (let i = 0; i < n; i++) s += el.replace('/>', ' transform="rotate(' + (i * 360 / n) + ' ' + cx + ' ' + cy + ')"/>'); return s; };
    if (kind === 'tulip') g += '<path d="M19 12 Q20 34 30 36 Q40 34 41 12 L35.5 20 L30 8 L24.5 20 Z" fill="' + c + '"/><path d="M24.5 20 L30 8 L35.5 20 Q34 31 30 33 Q26 31 24.5 20Z" fill="#fff" opacity=".25"/>';
    else if (kind === 'peony') g += '<circle cx="30" cy="22" r="12" fill="' + c + '"/>' + [[39, 22], [34.5, 29.8], [25.5, 29.8], [21, 22], [25.5, 14.2], [34.5, 14.2]].map(([x, y]) => '<circle cx="' + x + '" cy="' + y + '" r="7" fill="' + c + '"/>').join('') + '<circle cx="30" cy="22" r="8" fill="#fff" opacity=".3"/><circle cx="30" cy="22" r="4" fill="' + c + '"/>';
    else if (kind === 'lily') g += rot('<path d="M30 22 C26 15 26 7 30 1 C34 7 34 15 30 22Z" fill="' + c + '"/>', 6, 30, 22) + '<path d="M30 22 L26 13 M30 22 L34 13 M30 22 L30 12" stroke="' + heart + '" stroke-width="1" stroke-linecap="round"/><circle cx="26" cy="13" r="1.4" fill="' + heart + '"/><circle cx="34" cy="13" r="1.4" fill="' + heart + '"/><circle cx="30" cy="12" r="1.4" fill="' + heart + '"/>';
    else if (kind === 'lotus') g += [[-62, .7], [62, .7], [-32, .85], [32, .85]].map(([a, o]) => '<path d="M30 34 C24 28 24 18 30 10 C36 18 36 28 30 34Z" fill="' + c + '" opacity="' + o + '" transform="rotate(' + a + ' 30 34)"/>').join('') + '<path d="M30 34 C24 28 24 16 30 6 C36 16 36 28 30 34Z" fill="' + c + '"/>';
    else if (kind === 'orchid') g += '<ellipse cx="30" cy="10" rx="4" ry="10" fill="' + c + '"/><ellipse cx="30" cy="10" rx="4" ry="10" fill="' + c + '" transform="rotate(125 30 20)"/><ellipse cx="30" cy="10" rx="4" ry="10" fill="' + c + '" transform="rotate(235 30 20)"/><ellipse cx="20" cy="17" rx="9" ry="7" fill="' + c + '"/><ellipse cx="40" cy="17" rx="9" ry="7" fill="' + c + '"/><path d="M25 21 Q30 34 35 21 Q30 25 25 21Z" fill="' + heart + '"/><circle cx="30" cy="19" r="2.2" fill="#fff"/>';
    else g += rot('<ellipse cx="30" cy="13" rx="6.5" ry="9.5" fill="' + c + '"/>', 6, 30, 22) + '<circle cx="30" cy="22" r="5.2" fill="' + heart + '"/>' + (locked ? '' : '<circle cx="28.5" cy="20.5" r="1.3" fill="#FFF6D8"/>');
  }
  return '<svg viewBox="0 0 60 80" width="' + size + '" height="' + Math.round(size * 4 / 3) + '" aria-hidden="true"' + (extra || '') + '>' + g + '</svg>';
}

// ---------- icons ----------
const ic = (d, w, sw) => '<svg width="' + (w || 22) + '" height="' + (w || 22) + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="' + (sw || 2) + '" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="' + d + '"/></svg>';
const I = {
  back: '<svg width="12" height="20" viewBox="0 0 12 20" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M10 2L2 10l8 8"/></svg>',
  fwd: '<svg width="12" height="20" viewBox="0 0 12 20" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M2 2l8 8-8 8"/></svg>',
  plus: ic('M12 5v14 M5 12h14', 24, 2.4),
  check: '<svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12l5 5 9-10"/></svg>',
  rep: ic('M17 2l4 4-4 4 M3 11V9a3 3 0 0 1 3-3h15 M7 22l-4-4 4-4 M21 13v2a3 3 0 0 1-3 3H3', 12, 2.2),
  edit: ic('M4 20h4L19 9l-4-4L4 16z M13 7l4 4', 20),
  trash: ic('M4 7h16 M9 7V4h6v3 M6 7l1 13h10l1-13', 20),
  arrow: ic('M4 12h14 M13 6l6 6-6 6', 20),
  chev: '<svg width="8" height="14" viewBox="0 0 8 14" fill="none" stroke="#B5A89E" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M1 1l6 6-6 6"/></svg>'
};
const TABS = [
  ['today', 'Сегодня', 'M12 4V2 M12 22v-2 M4 12H2 M22 12h-2 M5.6 5.6L4.2 4.2 M19.8 19.8l-1.4-1.4 M5.6 18.4l-1.4 1.4 M19.8 4.2l-1.4 1.4 M12 8a4 4 0 1 0 0 8a4 4 0 1 0 0-8'],
  ['habits', 'Привычки', 'M12 21V11 M12 14c-4 0-6-3-6-7 4 0 6 3 6 7z M12 11c0-4 2-7 6-7 0 4-2 7-6 7z'],
  ['calendar', 'Календарь', 'M4 6h16v14H4z M4 10h16 M8 3v4 M16 3v4'],
  ['stats', 'Графики', 'M5 20V11 M11 20V5 M17 20v-7 M3 20h18'],
  ['garden', 'Сад', 'M12 22v-8 M12 10a3 3 0 1 0 0-6a3 3 0 1 0 0 6 M12 4V2 M15 7h2 M7 7h2 M12 14c-3 0-5 2-5 4 M12 14c3 0 5 2 5 4']
];

// ---------- ui state ----------
const U = { tab: 'today', stack: [], day: TODAY(), calMonth: null, calDay: TODAY(), period: 'week', season: null, sheet: null, openSwipe: null };
function toast(t) { const el = document.getElementById('toast'); el.textContent = t; el.classList.add('show'); clearTimeout(toast.t); toast.t = setTimeout(() => el.classList.remove('show'), 1800); }
const cur = () => U.stack.length ? U.stack[U.stack.length - 1] : { v: U.tab };
function go(v) { U.stack.push(v); render(true); }
function back() { U.stack.pop(); render(true); }

// ---------- pieces ----------
function taskRow(t, d) {
  const done = !!t.done[d], cat = catById(t.cat);
  const [tb, tf] = cat ? tagColors(cat.color) : ['', ''];
  return '<div class="task" data-id="' + t.id + '"><div class="acts"><button class="tm" data-a="tomorrow" data-id="' + t.id + '">' + I.arrow + 'На завтра</button><button class="del" data-a="delTask" data-id="' + t.id + '">' + I.trash + 'Удалить</button></div>' +
    '<div class="face"><button class="check' + (done ? ' on' : '') + '" data-a="toggleTask" data-id="' + t.id + '" aria-label="' + (done ? 'Отменить выполнение' : 'Отметить выполненной') + '">' + I.check + '</button>' +
    '<button class="tbody" data-a="editTask" data-id="' + t.id + '"><span class="ttl' + (done ? ' done' : '') + '"><span class="tt">' + esc(t.title) + '</span>' + (t.imp ? '<span class="imp imp' + t.imp + '">' + (t.imp === 2 ? 'Очень важно' : 'Важно') + '</span>' : '') + '</span>' +
    '<span class="meta">' + (cat ? '<span class="tag" style="background:' + tb + ';color:' + tf + '">' + esc(cat.name) + '</span>' : '') + (t.time ? '<span>' + t.time + '</span>' : '') + (t.rep !== 'none' ? '<span class="rep">' + I.rep + repText(t) + '</span>' : '') + '</span></button></div></div>';
}
function tabbar() {
  return '<nav class="tabbar" aria-label="Разделы">' + TABS.map(([id, l, d]) => '<button class="tab' + (U.tab === id ? ' on' : '') + '" data-a="tab" data-t="' + id + '"' + (U.tab === id ? ' aria-current="page"' : '') + '>' + ic(d, 24, 1.8) + l + '</button>').join('') + '</nav>';
}
function greet() { const h = new Date().getHours(); const g = h < 5 ? 'Доброй ночи' : h < 12 ? 'Доброе утро' : h < 18 ? 'Добрый день' : 'Добрый вечер'; return g + (S.name ? ', ' + esc(S.name) : ''); }
const navTop = (label, right) => '<div class="navTop"><button class="back" data-a="back">' + I.back + label + '</button>' + (right || '<span></span>') + '</div>';

// ---------- views ----------
const V = {};

V.today = () => {
  const d = U.day, t0 = TODAY();
  const monday = addDays(d, -wdi(d));
  const week = WD.map((w, i) => { const x = addDays(monday, i); const ts = tasksOn(x); const all = ts.length && ts.every((t) => t.done[x]);
    return '<button class="day' + (x === d ? ' on' : '') + '" data-a="pickDay" data-d="' + x + '"' + (x === t0 ? ' aria-current="date"' : '') + '><span class="wd">' + w + '</span><span class="n" style="' + (x === t0 && x !== d ? 'color:var(--accent)' : '') + '">' + parse(x).getDate() + '</span><span class="dot" style="background:' + (all ? '#8FB28A' : ts.length ? '#E2D6CD' : 'transparent') + '"></span></button>'; }).join('');
  const hs = S.habits.filter((h) => scheduled(h, d));
  const tasks = tasksOn(d), doneN = tasks.filter((t) => t.done[d]).length;
  const m = (S.mood[d] || {}).v;
  return '<div class="screen"><div class="between" style="align-items:flex-end"><div style="display:flex;flex-direction:column;gap:4px"><div class="eyebrow">' + longDate(d) + '</div><h1>' + greet() + '</h1></div>' + flower(3, '#F2B8B5', 44) + '</div>' +
    '<div class="week">' + week + '</div>' +
    (d !== t0 ? '<button class="link" data-a="pickDay" data-d="' + t0 + '" style="align-self:flex-start;margin-top:-8px">← Вернуться к сегодня</button>' : '') +
    '<section class="card pad" style="display:flex;flex-direction:column;gap:10px"><div class="between"><h2>Мой сад сегодня</h2><button class="link" data-a="tab" data-t="habits">Все привычки</button></div>' +
    (hs.length ? '<div class="gardenRow">' + hs.slice(0, 8).map((h) => '<button class="hbtn" data-a="waterHabit" data-id="' + h.id + '" aria-label="' + esc(h.name) + ': ' + count(h, d) + ' из ' + h.target + '">' + flower(stage(h, d), h.color, 54, 'daisy', false, ' data-h="' + h.id + '"') + '<span class="nm">' + esc(h.name) + '</span><span class="pr">' + (complete(h, d) ? 'готово' : count(h, d) + ' / ' + h.target) + '</span></button>').join('') + '</div><div class="hint" style="margin-top:-4px">Нажмите на цветок, чтобы полить</div>'
      : '<div class="empty" style="padding:10px">На этот день привычек нет. <button class="link" data-a="newHabit">Добавить привычку</button></div>') + '</section>' +
    '<section style="display:flex;flex-direction:column;gap:10px"><div class="between" style="padding:0 4px"><h2>Задачи</h2><span class="muted" style="font-size:14px">' + (tasks.length ? doneN + ' из ' + tasks.length : '') + '</span></div>' +
    (tasks.length ? '<div class="card tasks">' + tasks.map((t) => taskRow(t, d)).join('') + '</div><div class="hint">Свайп влево — перенести на завтра или удалить</div>' : '<div class="card empty">Задач нет. Нажмите «+», чтобы добавить.</div>') + '</section>' +
    '<section class="card pad" style="display:flex;flex-direction:column;gap:12px"><div class="between"><h2>Как настроение?</h2><button class="link" data-a="open" data-v="mood">История</button></div><div class="moods">' +
    MOODS.map(([l, c], i) => '<button class="mood' + (m === i + 1 ? ' on' : '') + '" data-a="setMood" data-v="' + (i + 1) + '" aria-pressed="' + (m === i + 1) + '"><span class="c" style="background:' + c + '"></span><span>' + l + '</span></button>').join('') + '</div></section>' +
    '</div><button class="fab" data-a="newTask" aria-label="Добавить">' + I.plus + '</button>';
};

V.habits = () => {
  const d = TODAY(), monday = addDays(d, -wdi(d));
  return '<div class="screen"><div class="between" style="align-items:center"><h1>Привычки</h1><button class="plusBtn" data-a="newHabit" aria-label="Новая привычка">' + I.plus + '</button></div>' +
    (S.habits.length ? S.habits.map((h) => {
      const st = streak(h), dots = WD1.map((l, i) => { const x = addDays(monday, i); const ok = complete(h, x), sc = scheduled(h, x);
        return '<span style="' + (ok ? 'background:' + h.color + ';color:#3A2A22' : x === d ? 'background:#fff;box-shadow:inset 0 0 0 1.5px #E2D6CD' : !sc ? 'opacity:.45' : '') + '">' + l + '</span>'; }).join('');
      const c = count(h, d), done = complete(h, d);
      return '<div class="card row" style="gap:0"><button class="habit" data-a="open" data-v="habit" data-id="' + h.id + '">' + flower(stage(h, d), h.color, 56) + '<span class="hb"><span class="between"><span class="hn">' + esc(h.name) + '</span><span class="muted" style="font-size:12px;white-space:nowrap">' + (st ? 'серия ' + st + ' ' + plural(st, 'день', 'дня', 'дней') : 'начните сегодня') + '</span></span><span class="dots7">' + dots + '</span></span></button>' +
        '<button class="hcheck' + (done ? ' on' : '') + '" data-a="waterHabit" data-id="' + h.id + '" data-d="' + d + '" style="margin-right:14px" aria-label="Отметить: ' + esc(h.name) + '">' + (done ? '<span style="width:18px;height:18px;display:flex">' + I.check + '</span>' : (h.target > 1 ? c + '/' + h.target : '')) + '</button></div>';
    }).join('') + '<p style="margin:4px 8px 0;font-size:14px;line-height:1.45;color:var(--muted);text-align:center;font-family:var(--serif);font-style:italic">Каждый выполненный день — ещё один цветок в саду.</p>'
      : '<div class="card empty">Пока нет привычек.<br><button class="link" data-a="newHabit">Создать первую</button></div>') + '</div>';
};

V.habit = (st) => {
  const h = S.habits.find((x) => x.id === st.id); if (!h) { U.stack.pop(); return V[cur().v](cur()); }
  const d = TODAY(), c = count(h, d), r = runs(h, d, d);
  const mStart = d.slice(0, 8) + '01'; const md = parse(mStart); const dim = new Date(md.getFullYear(), md.getMonth() + 1, 0).getDate();
  let sch = 0, ok = 0; const cells = [];
  for (let i = 0; i < wdi(mStart); i++) cells.push('<div class="c"></div>');
  for (let i = 1; i <= dim; i++) {
    const x = mStart.slice(0, 8) + pad(i); const sc = scheduled(h, x), cp = complete(h, x), past = x <= d;
    if (sc && past) { sch++; if (cp) ok++; }
    const part = !cp && count(h, x) > 0;
    cells.push('<div class="c"><span class="' + (cp ? 'done' : '') + (sc && past && !cp && x < d ? ' miss' : '') + (x === d ? ' today' : '') + '" style="' + (cp ? 'background:' + h.color : part ? 'background:' + h.color + '66' : '') + '">' + i + '</span></div>');
  }
  const pct = sch ? Math.round(ok / sch * 100) : 0;
  return '<div class="screen sub">' + navTop('Привычки', '<button class="iconBtn" data-a="editHabit" data-id="' + h.id + '" aria-label="Изменить">' + I.edit + '</button>') +
    '<div class="card" style="display:flex;flex-direction:column;align-items:center;gap:4px;padding:18px 16px 16px;border-radius:28px">' + flower(stage(h, d), h.color, 120) + '<h1 style="font-size:26px;text-align:center;margin-top:4px">' + esc(h.name) + '</h1><div class="muted" style="font-size:14px">' + (h.target > 1 ? h.target + ' раз в день' : 'один раз в день') + ' · ' + (h.days.every(Boolean) ? 'каждый день' : WD.filter((_, i) => h.days[i]).join(', ').toLowerCase()) + '</div>' +
    (scheduled(h, d) ? (complete(h, d) ? '<div style="margin-top:8px;display:flex;align-items:center;gap:8px;background:var(--okBg);color:var(--okText);border-radius:999px;padding:8px 14px;font-size:14px;font-weight:600"><span style="width:16px;height:16px;display:flex;filter:invert(35%) sepia(20%) saturate(900%) hue-rotate(60deg)">' + I.check + '</span>Сегодня выполнено — цветок распустился</div>' : '') +
      '<div class="stepper" style="margin-top:10px"><button data-a="habitMinus" data-id="' + h.id + '" aria-label="Минус">−</button><b>' + c + ' / ' + h.target + '</b><button data-a="waterHabit" data-id="' + h.id + '" data-d="' + d + '" aria-label="Плюс">+</button></div>' : '<div class="muted" style="margin-top:8px;font-size:14px">Сегодня по плану отдых</div>') + '</div>' +
    '<div class="tiles"><div class="tile"><b>' + streak(h) + '</b><span>' + plural(streak(h), 'день', 'дня', 'дней') + ' подряд</span></div><div class="tile"><b>' + r.best + '</b><span>лучшая серия</span></div><div class="tile"><b>' + pct + '%</b><span>за месяц</span></div></div>' +
    '<section class="card" style="padding:14px 14px 10px;display:flex;flex-direction:column;gap:8px"><div class="between"><h2 style="font-size:18px">' + cap(MONTHS[md.getMonth()]) + ' ' + md.getFullYear() + '</h2><span class="muted" style="font-size:13px">' + ok + ' из ' + sch + ' ' + plural(sch, 'дня', 'дней', 'дней') + '</span></div><div class="mcal">' + WD.map((w) => '<div class="h">' + w + '</div>').join('') + cells.join('') + '</div></section>' +
    '<button class="btn danger" data-a="delHabit" data-id="' + h.id + '">Удалить привычку</button></div>';
};

const SEASONS = [['spring', 'Весна', 'Весенний сад'], ['summer', 'Лето', 'Летний сад'], ['autumn', 'Осень', 'Осенний сад'], ['winter', 'Зима', 'Зимний сад']];
const seasonOf = (m) => (m === 11 || m < 2) ? 3 : m < 5 ? 0 : m < 8 ? 1 : 2;
function seasonDeco(i) {
  const leaf = (x, y, c, r) => '<path d="M' + x + ' ' + y + ' c6 -6 14 -4 16 2 c-6 6 -14 4 -16 -2z" fill="' + c + '" opacity=".8" transform="rotate(' + r + ' ' + x + ' ' + y + ')"/>';
  if (i === 0) return { bg: 'linear-gradient(#FFF5F7,#FFF5F7 76%,#E3D7C6 76%)', svg: [[30, 20], [300, 40], [180, 14], [90, 300], [250, 296], [330, 150], [120, 60]].map(([x, y]) => '<g transform="translate(' + x + ' ' + y + ')">' + [0, 72, 144, 216, 288].map((a) => '<ellipse cx="0" cy="-4" rx="2.6" ry="4" fill="#F6C1CC" transform="rotate(' + a + ')"/>').join('') + '<circle r="1.6" fill="#F5DE9A"/></g>').join('') };
  if (i === 1) return { bg: 'linear-gradient(#F3F9FF,#F3F9FF 76%,#D9E6C8 76%)', svg: [[40, 30, '#F7C9A8'], [290, 50, '#D5C6EE'], [200, 18, '#BFD8EE']].map(([x, y, c]) => '<g transform="translate(' + x + ' ' + y + ')"><ellipse cx="-5" cy="-3" rx="5" ry="6" fill="' + c + '"/><ellipse cx="5" cy="-3" rx="5" ry="6" fill="' + c + '"/><ellipse cx="-4" cy="5" rx="3.5" ry="4" fill="' + c + '"/><ellipse cx="4" cy="5" rx="3.5" ry="4" fill="' + c + '"/><path d="M0 -8 V9" stroke="#5E534B" stroke-width="1.4" stroke-linecap="round"/></g>').join('') + '<circle cx="320" cy="22" r="14" fill="#F5DE9A" opacity=".7"/>' };
  if (i === 2) return { bg: 'linear-gradient(#FFF4E8,#FFF4E8 76%,#E9D3BE 76%)', svg: leaf(30, 20, '#E8A26A', 10) + leaf(300, 40, '#D98B5F', -30) + leaf(180, 12, '#F0B56E', 40) + leaf(90, 300, '#D98B5F', 0) + leaf(250, 296, '#E8A26A', 20) + leaf(330, 150, '#F0B56E', -10) };
  return { bg: 'linear-gradient(#F4F7FB,#F4F7FB 76%,#FFFFFF 76%)', svg: [[30, 20], [300, 40], [180, 14], [90, 120], [250, 90], [330, 160], [60, 200], [210, 220]].map(([x, y]) => '<g transform="translate(' + x + ' ' + y + ')" stroke="#C9D8EA" stroke-width="1.6" stroke-linecap="round"><path d="M-6 0H6 M0 -6V6 M-4 -4L4 4 M-4 4L4 -4"/></g>').join('') };
}
function monthFlowers(monthStart) {
  const md = parse(monthStart), end = ds(new Date(md.getFullYear(), md.getMonth() + 1, 0)), to = end < TODAY() ? end : TODAY();
  const list = [];
  S.habits.forEach((h) => { const r = runs(h, monthStart, to); Object.keys(r.map).forEach((d) => list.push({ d, h, kind: kindFor(r.map[d]) })); });
  return list.sort((a, b) => a.d.localeCompare(b.d));
}
V.garden = () => {
  const t = TODAY(), mStart = t.slice(0, 8) + '01', m = parse(t).getMonth();
  const si = U.season == null ? seasonOf(m) : U.season, deco = seasonDeco(si);
  const fl = monthFlowers(mStart);
  const show = fl.slice(-40);
  const per = S.habits.map((h) => [h, fl.filter((f) => f.h === h).length]);
  const best = bestAll(); const got = RARE.filter(([, n]) => best >= n).length; const next = RARE.find(([, n]) => best < n);
  return '<div class="screen"><div style="display:flex;flex-direction:column;gap:4px"><h1>' + SEASONS[si][2] + '</h1><div class="muted" style="font-size:15px">' + cap(MONTHS[m]) + ' · выросло <b style="color:var(--text)">' + fl.length + ' ' + plural(fl.length, 'цветок', 'цветка', 'цветов') + '</b></div></div>' +
    '<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:6px">' + SEASONS.map(([, l], i) => '<button class="chip' + (i === si ? ' on' : '') + '" style="justify-content:center" data-a="season" data-i="' + i + '">' + l + '</button>').join('') + '</div>' +
    '<section class="bed" style="background:' + deco.bg + '"><svg class="deco" viewBox="0 0 350 330" preserveAspectRatio="none" width="100%" height="100%" aria-hidden="true">' + deco.svg + '</svg><div class="grid">' +
    (show.length ? show.map((f) => flower(3, f.h.color, 56, f.kind)).join('') : '<div style="grid-column:1/-1;align-self:center" class="empty">Выполняйте привычки — и здесь вырастут цветы</div>') + '</div></section>' +
    (fl.length > 40 ? '<div class="hint" style="margin-top:-8px">Показаны последние 40 цветов</div>' : '') +
    '<button class="card row" style="padding:12px 14px;gap:10px;text-align:left" data-a="open" data-v="rare"><span class="row">' + RARE.slice(0, 3).map(([k, n, c]) => flower(3, c, 40, k, best < n)).join('') + '</span><span style="flex:1;display:flex;flex-direction:column;gap:2px"><span style="font-size:16px;font-weight:600">Редкие цветы</span><span class="muted" style="font-size:13px">' + got + ' из ' + RARE.length + (next ? ' · до следующего ' + (next[1] - best) + ' ' + plural(next[1] - best, 'день', 'дня', 'дней') : ' · все собраны!') + '</span></span>' + I.chev + '</button>' +
    (per.length ? '<section class="card list" style="padding:4px 0">' + per.map(([h, n]) => '<div class="li"><span style="width:14px;height:14px;border-radius:999px;background:' + h.color + '"></span><span style="flex:1;font-size:15px">' + esc(h.name) + '</span><b style="font-size:15px">' + n + '</b></div>').join('') + '</section>' : '') + '</div>';
};

V.rare = () => {
  const best = bestAll();
  return '<div class="screen sub">' + navTop('Сад') + '<div style="display:flex;flex-direction:column;gap:4px"><h1>Редкие цветы</h1><div class="muted" style="font-size:15px">Распускаются за серии без пропусков. Ваша лучшая серия: ' + best + ' ' + plural(best, 'день', 'дня', 'дней') + '</div></div>' +
    '<div class="rare">' + RARE.map(([k, n, c]) => { const got = best >= n; return '<div class="it">' + flower(3, c, 78, k, !got) + '<b style="font-size:14px">' + n + ' ' + plural(n, 'день', 'дня', 'дней') + ' подряд</b><span class="st" style="background:' + (got ? 'var(--okBg)' : 'var(--fill)') + ';color:' + (got ? 'var(--okText)' : 'var(--muted)') + '">' + (got ? 'получено' : 'ещё ' + (n - best) + ' ' + plural(n - best, 'день', 'дня', 'дней')) + '</span>' + (got ? '' : '<div class="bar" style="width:100%;height:6px;margin-top:6px"><i style="width:' + Math.round(best / n * 100) + '%;background:#E8A988"></i></div>') + '</div>'; }).join('') + '</div></div>';
};

V.calendar = () => {
  const t = TODAY(); const mm = U.calMonth || t.slice(0, 7); const md = parse(mm + '-01'); const dim = new Date(md.getFullYear(), md.getMonth() + 1, 0).getDate();
  const cells = WD.map((w) => '<div class="h">' + w + '</div>');
  for (let i = 0; i < wdi(mm + '-01'); i++) cells.push('<div></div>');
  for (let i = 1; i <= dim; i++) {
    const x = mm + '-' + pad(i); const cols = [...new Set(tasksOn(x).map((tk) => (catById(tk.cat) || { color: '#D9CCC3' }).color))].slice(0, 3);
    cells.push('<button class="c' + (x === U.calDay ? ' on' : '') + (x === t ? ' today' : '') + '" data-a="calDay" data-d="' + x + '"><span class="n">' + i + '</span><span class="ds">' + cols.map((c) => '<i style="background:' + c + '"></i>').join('') + '</span></button>');
  }
  const tasks = tasksOn(U.calDay);
  return '<div class="screen"><div class="between" style="align-items:center"><h1>' + cap(MONTHS[md.getMonth()]) + (md.getFullYear() !== new Date().getFullYear() ? ' ' + md.getFullYear() : '') + '</h1><div class="row" style="gap:4px"><button class="iconBtn card" data-a="calNav" data-n="-1" aria-label="Предыдущий месяц">' + I.back + '</button><button class="iconBtn card" data-a="calNav" data-n="1" aria-label="Следующий месяц">' + I.fwd + '</button></div></div>' +
    '<section class="card" style="padding:14px 10px"><div class="cal">' + cells.join('') + '</div></section>' +
    '<div class="between" style="padding:0 4px"><h2>' + longDate(U.calDay) + '</h2><span class="muted" style="font-size:14px">' + tasks.length + ' ' + plural(tasks.length, 'дело', 'дела', 'дел') + '</span></div>' +
    (tasks.length ? '<div class="card tasks">' + tasks.map((tk) => taskRow(tk, U.calDay)).join('') + '</div>' : '<div class="card empty">Свободный день</div>') +
    '<button class="btn ghost" data-a="newTask" data-d="' + U.calDay + '">Добавить задачу на этот день</button></div>';
};

function periodDays() {
  const t = TODAY();
  if (U.period === 'week') return Array.from({ length: 7 }, (_, i) => addDays(t, i - 6));
  const s = t.slice(0, 8) + '01'; const out = []; for (let d = s; d <= t; d = addDays(d, 1)) out.push(d); return out;
}
V.stats = () => {
  const days = periodDays();
  const tasksDone = days.map((d) => tasksOn(d).filter((t) => t.done[d]).length);
  const totalDone = tasksDone.reduce((a, b) => a + b, 0);
  const flowers = days.reduce((a, d) => a + S.habits.filter((h) => scheduled(h, d) && complete(h, d)).length, 0);
  const moods = days.map((d) => (S.mood[d] || {}).v || 0);
  const mv = moods.filter(Boolean); const avg = mv.length ? Math.round(mv.reduce((a, b) => a + b, 0) / mv.length) : 0;
  // mood chart
  const W = 266, H = 130, n = days.length, step = W / n;
  const pts = moods.map((v, i) => v ? [step * i + step / 2, 125 - (v - 1) * 30, v] : null);
  let line = '', prev = null; pts.forEach((p) => { if (!p) { prev = null; return; } line += (prev ? 'L' : 'M') + p[0].toFixed(1) + ' ' + p[1] + ' '; prev = p; });
  const labels = n <= 7 ? days.map((d) => WD[wdi(d)]) : days.map((d, i) => (i % 5 === 0 || i === n - 1) ? parse(d).getDate() : '');
  const chart = mv.length ? '<div class="row" style="gap:8px;align-items:flex-start"><div style="display:flex;flex-direction:column;justify-content:space-between;height:130px;font-size:10px;color:var(--muted)"><span>отлично</span><span>хорошо</span><span>норм.</span><span>так себе</span><span>плохо</span></div><div style="flex:1"><svg viewBox="0 0 ' + W + ' ' + H + '" style="width:100%;height:auto;display:block" aria-hidden="true"><path d="M0 5H266 M0 35H266 M0 65H266 M0 95H266 M0 125H266" stroke="#F3EAE4"/><path d="' + line + '" stroke="#E8A988" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>' +
    pts.map((p) => p ? '<circle cx="' + p[0].toFixed(1) + '" cy="' + p[1] + '" r="' + (n > 7 ? 3.5 : 6) + '" fill="' + MOODS[p[2] - 1][1] + '" stroke="#fff" stroke-width="2"/>' : '').join('') + '</svg><div style="display:grid;grid-template-columns:repeat(' + n + ',1fr);font-size:10px;color:var(--muted);text-align:center">' + labels.map((l) => '<span>' + l + '</span>').join('') + '</div></div></div>'
    : '<div class="empty" style="padding:8px">Отмечайте настроение на главном экране — здесь появится график</div>';
  const hab = S.habits.map((h) => { const sc = days.filter((d) => scheduled(h, d)); const ok = sc.filter((d) => complete(h, d)).length; const p = sc.length ? Math.round(ok / sc.length * 100) : 0;
    return '<div style="display:flex;flex-direction:column;gap:4px"><div class="between" style="font-size:13px"><span>' + esc(h.name) + '</span><b>' + p + '%</b></div><div class="bar"><i style="width:' + p + '%;background:' + h.color + '"></i></div></div>'; }).join('');
  const maxT = Math.max(1, ...tasksDone);
  const bars = '<div style="display:grid;grid-template-columns:repeat(' + n + ',1fr);gap:' + (n > 7 ? 2 : 10) + 'px;align-items:end;height:120px">' + tasksDone.map((v, i) => '<div style="display:flex;flex-direction:column;align-items:center;justify-content:flex-end;gap:4px;height:120px">' + (n <= 7 ? '<span style="font-size:11px;font-weight:600">' + v + '</span>' : '') + '<div style="width:100%;height:' + Math.max(3, Math.round(v / maxT * 80)) + 'px;border-radius:' + (n > 7 ? 3 : 8) + 'px;background:' + (days[i] === TODAY() ? '#E8A988' : '#F4C7B8') + '"></div>' + (n <= 7 ? '<span style="font-size:11px;color:var(--muted)">' + labels[i] + '</span>' : '') + '</div>').join('') + '</div>';
  return '<div class="screen"><h1>Графики</h1>' +
    '<div class="seg" style="grid-template-columns:1fr 1fr"><button class="' + (U.period === 'week' ? 'on' : '') + '" data-a="period" data-p="week">Неделя</button><button class="' + (U.period === 'month' ? 'on' : '') + '" data-a="period" data-p="month">Месяц</button></div>' +
    '<div class="tiles"><div class="tile"><b>' + totalDone + '</b><span>' + plural(totalDone, 'задача выполнена', 'задачи выполнено', 'задач выполнено') + '</span></div><div class="tile"><b>' + flowers + '</b><span>' + plural(flowers, 'цветок вырос', 'цветка выросло', 'цветов выросло') + '</span></div><div class="tile"><b style="font-size:' + (avg ? 18 : 22) + 'px">' + (avg ? MOODS[avg - 1][0] : '—') + '</b><span>среднее настроение</span></div></div>' +
    '<section class="card pad" style="display:flex;flex-direction:column;gap:10px"><div class="between"><h2 style="font-size:18px">Настроение</h2><button class="link" data-a="open" data-v="mood">Подробнее</button></div>' + chart + '</section>' +
    (S.habits.length ? '<section class="card pad" style="display:flex;flex-direction:column;gap:10px"><h2 style="font-size:18px">Привычки</h2>' + hab + '</section>' : '') +
    '<section class="card pad" style="display:flex;flex-direction:column;gap:10px"><div class="between"><h2 style="font-size:18px">Задачи по дням</h2><span class="muted" style="font-size:13px">всего ' + totalDone + '</span></div>' + bars + '</section>' +
    '<section class="card list" style="padding:4px 0"><div class="li"><label for="nm" style="flex:1;font-size:15px">Ваше имя</label><input id="nm" class="inp" style="background:var(--fill);width:150px" value="' + esc(S.name) + '" placeholder="для приветствия" data-a="name"></div>' +
    '<button class="li" style="width:100%;text-align:left" data-a="open" data-v="cats"><span style="flex:1;font-size:15px">Категории задач</span>' + I.chev + '</button>' +
    '<button class="li" style="width:100%;text-align:left" data-a="export"><span style="flex:1;font-size:15px;color:var(--accent)">Сохранить данные в файл</span></button>' +
    '<label class="li" style="cursor:pointer"><span style="flex:1;font-size:15px;color:var(--accent)">Загрузить данные из файла</span><input type="file" accept=".json,application/json" class="vis" data-a="import"></label></section></div>';
};

V.mood = () => {
  const d = U.day, e = S.mood[d] || {};
  const t = TODAY(); const mm = d.slice(0, 7); const md = parse(mm + '-01'); const dim = new Date(md.getFullYear(), md.getMonth() + 1, 0).getDate();
  const cells = WD.map((w) => '<div class="h">' + w + '</div>');
  for (let i = 0; i < wdi(mm + '-01'); i++) cells.push('<div></div>');
  for (let i = 1; i <= dim; i++) { const x = mm + '-' + pad(i); const v = (S.mood[x] || {}).v;
    cells.push('<div class="c"><span class="' + (v ? 'done' : '') + (x === d ? ' today' : '') + '" style="' + (v ? 'background:' + MOODS[v - 1][1] : x <= t ? 'border:1.5px dashed #E2D6CD' : '') + '">' + i + '</span></div>'); }
  return '<div class="screen sub">' + navTop('Назад') + '<div><h1>Настроение</h1><div class="muted" style="font-size:15px;margin-top:4px">' + longDate(d) + '</div></div>' +
    '<section class="card" style="padding:14px 10px"><div class="moods" style="gap:0">' + MOODS.map(([l, c], i) => '<button class="mood' + (e.v === i + 1 ? ' on' : '') + '" style="gap:0;padding:4px 0 8px" data-a="setMood" data-v="' + (i + 1) + '" aria-pressed="' + (e.v === i + 1) + '">' + flower(3, c, 46) + '<span style="font-weight:' + (e.v === i + 1 ? 700 : 500) + '">' + l + '</span></button>').join('') + '</div></section>' +
    '<div class="field"><span class="lbl" style="padding:0 4px">Что вы чувствуете?</span><div class="chips">' + FEELINGS.map((f) => '<button class="chip' + ((e.f || []).includes(f) ? ' on' : '') + '" data-a="feel" data-f="' + f + '" aria-pressed="' + (e.f || []).includes(f) + '">' + f + '</button>').join('') + '</div></div>' +
    '<label class="card" style="padding:12px 14px;display:flex;flex-direction:column;gap:4px;border-radius:18px"><span class="lbl">Заметка дня</span><textarea class="note" id="note" rows="2" placeholder="Что хорошего было сегодня?">' + esc(e.n || '') + '</textarea></label>' +
    '<section class="card" style="padding:14px;display:flex;flex-direction:column;gap:8px"><div class="between"><h2 style="font-size:18px">' + cap(MONTHS[md.getMonth()]) + '</h2><button class="link" data-a="tab" data-t="stats">График</button></div><div class="mcal">' + cells.join('') + '</div>' +
    '<div class="between" style="padding-top:4px;flex-wrap:wrap">' + MOODS.map(([l, c]) => '<span class="row" style="gap:4px;font-size:11px;color:var(--soft)"><span style="width:10px;height:10px;border-radius:999px;background:' + c + '"></span>' + l + '</span>').join('') + '</div></section></div>';
};

V.cats = (st) => {
  const ed = st.edit ? S.cats.find((c) => c.id === st.edit) : null;
  const form = st.form || (ed ? { name: ed.name, color: ed.color } : { name: '', color: COLORS[4][0] });
  st.form = form;
  return '<div class="screen sub">' + navTop('Назад') + '<h1>Категории</h1>' +
    '<div class="card list" style="padding:0">' + S.cats.map((c) => { const n = S.tasks.filter((t) => t.cat === c.id).length; return '<div class="li" style="padding-right:4px"><span style="width:30px;height:30px;border-radius:10px;background:' + tagColors(c.color)[0] + ';display:flex;align-items:center;justify-content:center"><span style="width:12px;height:12px;border-radius:999px;background:' + c.color + '"></span></span><span style="flex:1;display:flex;flex-direction:column;gap:1px"><span style="font-size:16px;font-weight:500">' + esc(c.name) + '</span><span class="muted" style="font-size:12px">' + n + ' ' + plural(n, 'задача', 'задачи', 'задач') + '</span></span><button class="iconBtn" data-a="catEdit" data-id="' + c.id + '" aria-label="Изменить ' + esc(c.name) + '">' + I.edit + '</button><button class="iconBtn" style="color:#B42318" data-a="catDel" data-id="' + c.id + '" aria-label="Удалить ' + esc(c.name) + '">' + I.trash + '</button></div>'; }).join('') + '</div>' +
    '<section class="card pad" style="display:flex;flex-direction:column;gap:14px"><h2>' + (ed ? 'Изменить категорию' : 'Новая категория') + '</h2>' +
    '<label class="field"><span class="lbl">Название</span><input class="bigInput" style="font-family:var(--sans);font-size:18px" id="catName" value="' + esc(form.name) + '" placeholder="Например, Путешествия"></label>' +
    '<div class="field"><span class="lbl">Цвет</span><div class="swatches" role="radiogroup" aria-label="Цвет">' + COLORS.map(([hx, nm]) => '<button class="sw' + (form.color === hx ? ' on' : '') + '" role="radio" aria-checked="' + (form.color === hx) + '" aria-label="' + nm + '" style="background:' + hx + '" data-a="catColor" data-c="' + hx + '"></button>').join('') + '</div></div>' +
    '<button class="btn" data-a="catSave">' + (ed ? 'Сохранить' : 'Добавить категорию') + '</button>' + (ed ? '<button class="btn ghost" data-a="catCancel">Отмена</button>' : '') + '</section></div>';
};

// ---------- sheets ----------
function taskSheet(sh) {
  const f = sh.f;
  const whenOpts = [[TODAY(), 'Сегодня'], [addDays(TODAY(), 1), 'Завтра']];
  const isOther = !whenOpts.some(([d]) => d === f.date);
  const reps = [['none', 'Нет'], ['daily', 'Каждый день'], ['weekdays', 'По будням'], ['weekly', 'По дням недели'], ['monthly', 'Каждый месяц']];
  return '<div class="sheetBg" data-a="closeSheet"><div class="sheet" role="dialog" aria-label="' + (sh.edit ? 'Задача' : 'Новая задача') + '"><div class="grab"></div>' +
    (sh.edit ? '' : '<div class="seg" style="grid-template-columns:1fr 1fr"><button class="on">Задача</button><button data-a="sheetHabit">Привычка</button></div>') +
    '<label class="field"><span class="lbl">Что нужно сделать?</span><input class="bigInput" id="tTitle" value="' + esc(f.title) + '" placeholder="Например, купить цветы" autocomplete="off"></label>' +
    '<div class="field"><span class="lbl">Когда</span><div class="chips">' + whenOpts.map(([d, l]) => '<button class="chip' + (f.date === d ? ' on' : '') + '" data-a="fset" data-k="date" data-v="' + d + '">' + l + '</button>').join('') +
    '<label class="chip' + (isOther ? ' on' : '') + '" style="position:relative">' + (isOther ? parse(f.date).getDate() + ' ' + MONTHS_G[parse(f.date).getMonth()] : 'Дата') + '<input type="date" value="' + f.date + '" data-a="fdate" style="position:absolute;inset:0;opacity:0;width:100%"></label>' +
    '<label class="chip" style="position:relative;color:var(--accent)">' + (f.time || 'Время') + '<input type="time" value="' + f.time + '" data-a="ftime" style="position:absolute;inset:0;opacity:0;width:100%"></label>' + (f.time ? '<button class="chip" data-a="fset" data-k="time" data-v="" aria-label="Без времени">✕</button>' : '') + '</div></div>' +
    '<div class="field"><span class="lbl">Повтор</span><div class="chips scroll">' + reps.map(([k, l]) => '<button class="chip' + (f.rep === k ? ' on' : '') + '" data-a="fset" data-k="rep" data-v="' + k + '">' + l + '</button>').join('') + '</div>' +
    (f.rep === 'weekly' ? '<div class="wdays">' + WD.map((w, i) => '<button class="' + (f.days.includes(i) ? 'on' : '') + '" data-a="fday" data-i="' + i + '" aria-pressed="' + f.days.includes(i) + '">' + w + '</button>').join('') + '</div>' : '') + '</div>' +
    '<div class="field"><span class="lbl">Важность</span><div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px">' + [['Обычная', '#C9BEB5'], ['Важно', '#F08A4B'], ['Очень важно', '#E5484D']].map(([l, c], i) => '<button class="chip' + (f.imp === i ? ' ring' : '') + '" style="justify-content:center;height:40px;' + (f.imp === i && i ? 'background:' + (i === 2 ? '#FCDDDD;color:#B42318' : '#FDEBDC;color:#9A3412') : '') + '" data-a="fset" data-k="imp" data-v="' + i + '"><span class="d" style="background:' + c + '"></span>' + l + '</button>').join('') + '</div></div>' +
    '<div class="field"><div class="between"><span class="lbl">Категория</span><button class="link" data-a="openCats">Изменить</button></div><div class="chips scroll">' + '<button class="chip' + (!f.cat ? ' ring' : '') + '" data-a="fset" data-k="cat" data-v="">Без категории</button>' + S.cats.map((c) => '<button class="chip' + (f.cat === c.id ? ' ring' : '') + '" data-a="fset" data-k="cat" data-v="' + c.id + '"><span class="d" style="background:' + c.color + '"></span>' + esc(c.name) + '</button>').join('') + '</div></div>' +
    '<button class="btn" data-a="saveTask">' + (sh.edit ? 'Сохранить' : 'Добавить задачу') + '</button>' +
    (sh.edit ? '<button class="btn danger" data-a="delTask" data-id="' + sh.edit + '">Удалить задачу</button>' : '') + '</div></div>';
}
function habitSheet(sh) {
  const f = sh.f;
  return '<div class="sheetBg" data-a="closeSheet"><div class="sheet" role="dialog" aria-label="Привычка"><div class="grab"></div>' +
    (sh.edit ? '' : '<div class="seg" style="grid-template-columns:1fr 1fr"><button data-a="sheetTask">Задача</button><button class="on">Привычка</button></div>') +
    '<label class="field"><span class="lbl">Привычка</span><input class="bigInput" id="hName" value="' + esc(f.name) + '" placeholder="Например, гулять 30 минут" autocomplete="off"></label>' +
    '<div class="field"><span class="lbl">Цвет цветка</span><div class="row" style="gap:6px;align-items:flex-end">' + flower(3, f.color, 46) + '<div class="swatches">' + COLORS.map(([hx, nm]) => '<button class="sw' + (f.color === hx ? ' on' : '') + '" aria-label="' + nm + '" style="background:' + hx + '" data-a="hset" data-k="color" data-v="' + hx + '"></button>').join('') + '</div></div></div>' +
    '<div class="field"><span class="lbl">Сколько раз в день</span><div class="stepper"><button data-a="hstep" data-n="-1" aria-label="Меньше">−</button><b>' + f.target + '</b><button data-a="hstep" data-n="1" aria-label="Больше">+</button><span class="muted" style="font-size:13px">' + (f.target > 1 ? 'например, стаканов воды' : 'один раз — и цветок распустится') + '</span></div></div>' +
    '<div class="field"><span class="lbl">По каким дням</span><div class="wdays">' + WD.map((w, i) => '<button class="' + (f.days[i] ? 'on' : '') + '" data-a="hday" data-i="' + i + '" aria-pressed="' + !!f.days[i] + '">' + w + '</button>').join('') + '</div></div>' +
    '<button class="btn" data-a="saveHabit">' + (sh.edit ? 'Сохранить' : 'Посадить привычку') + '</button></div></div>';
}

// ---------- render ----------
function render(top) {
  const st = cur();
  const sub = U.stack.length > 0;
  app.innerHTML = V[st.v](st) + (sub ? '' : tabbar()) + (U.sheet ? (U.sheet.type === 'task' ? taskSheet(U.sheet) : habitSheet(U.sheet)) : '');
  if (top) window.scrollTo(0, 0);
  bindSwipes();
  const note = document.getElementById('note');
  if (note) note.addEventListener('input', () => { const e = S.mood[U.day] || (S.mood[U.day] = {}); e.n = note.value; save(); });
}

function bindSwipes() {
  app.querySelectorAll('.task .face').forEach((face) => {
    let x0 = 0, y0 = 0, dx = 0, drag = false, base = 0;
    const id = face.parentNode.dataset.id;
    if (U.openSwipe === id) { face.style.transition = 'none'; face.style.transform = 'translateX(-176px)'; requestAnimationFrame(() => { face.style.transition = ''; }); }
    face.addEventListener('touchstart', (e) => { x0 = e.touches[0].clientX; y0 = e.touches[0].clientY; dx = 0; drag = false; base = U.openSwipe === id ? -176 : 0; face.style.transition = 'none'; }, { passive: true });
    face.addEventListener('touchmove', (e) => {
      const mx = e.touches[0].clientX - x0, my = e.touches[0].clientY - y0;
      if (!drag && Math.abs(mx) > 8 && Math.abs(mx) > Math.abs(my)) drag = true;
      if (drag) { dx = mx; face.style.transform = 'translateX(' + Math.max(-176, Math.min(0, base + dx)) + 'px)'; }
    }, { passive: true });
    face.addEventListener('touchend', () => {
      face.style.transition = '';
      if (!drag) return;
      const pos = base + dx; const open = pos < -70;
      if (open && U.openSwipe && U.openSwipe !== id) { const o = app.querySelector('.task[data-id="' + U.openSwipe + '"] .face'); if (o) o.style.transform = ''; }
      U.openSwipe = open ? id : null; face.style.transform = open ? 'translateX(-176px)' : '';
      face.dataset.swiped = Date.now();
    });
  });
}

// ---------- actions ----------
function blankTask(d) { return { title: '', date: d || U.day, time: '', rep: 'none', days: [wdi(d || U.day)], imp: 0, cat: '' }; }
function readInputs() {
  if (!U.sheet) return;
  const t = document.getElementById('tTitle'); if (t) U.sheet.f.title = t.value;
  const h = document.getElementById('hName'); if (h) U.sheet.f.name = h.value;
}
function water(h, d) {
  const c = count(h, d);
  const was = complete(h, d);
  h.log[d] = c >= h.target ? 0 : c + 1;
  if (!h.log[d]) delete h.log[d];
  save();
  if (!was && complete(h, d)) {
    const s = streak(h), rare = RARE.find(([, n]) => n === s);
    toast(rare ? 'Редкий цветок! ' + s + ' ' + plural(s, 'день', 'дня', 'дней') + ' подряд' : 'Цветок распустился');
    return true;
  }
  return false;
}

app.addEventListener('click', (e) => {
  const el = e.target.closest('[data-a]'); if (!el) return;
  const a = el.dataset.a;
  if (a === 'closeSheet') { if (e.target === el) { U.sheet = null; render(false); } return; }
  if (['import', 'fdate', 'ftime', 'name'].includes(a)) return;
  const face = el.closest('.face');
  if (face && face.dataset.swiped && Date.now() - face.dataset.swiped < 350) return;
  if (U.openSwipe && !el.closest('.acts') && a !== 'toggleTask') { const id = U.openSwipe; U.openSwipe = null; const f = app.querySelector('.task[data-id="' + id + '"] .face'); if (f) { f.style.transform = ''; if (el.closest('.task')) return; } }
  readInputs();
  const id = el.dataset.id;
  const task = id && S.tasks.find((t) => t.id === id);
  const habit = id && S.habits.find((h) => h.id === id);
  const taskDay = () => { const s = cur(); return s.v === 'calendar' ? U.calDay : U.day; };
  switch (a) {
    case 'tab': U.tab = el.dataset.t; U.stack = []; U.openSwipe = null; if (U.tab === 'calendar') { U.calDay = U.day; U.calMonth = U.day.slice(0, 7); } render(true); break;
    case 'back': back(); break;
    case 'open': go({ v: el.dataset.v, id }); break;
    case 'pickDay': U.day = el.dataset.d; render(false); break;
    case 'toggleTask': { const d = taskDay(); if (task.done[d]) delete task.done[d]; else task.done[d] = true; save(); render(false); break; }
    case 'tomorrow': {
      const d = taskDay(), tm = addDays(d, 1);
      if (task.rep === 'none') task.date = tm;
      else { task.skip = task.skip || {}; task.skip[d] = true; S.tasks.push({ id: uid(), title: task.title, date: tm, time: task.time, rep: 'none', days: [], imp: task.imp, cat: task.cat, done: {}, skip: {} }); }
      U.openSwipe = null; save(); toast('Перенесено на завтра'); render(false); break;
    }
    case 'delTask': {
      const d = taskDay();
      if (task.rep !== 'none' && !U.sheet) { task.skip = task.skip || {}; task.skip[d] = true; toast('Удалено на этот день'); }
      else { S.tasks = S.tasks.filter((t) => t !== task); toast('Задача удалена'); }
      U.openSwipe = null; U.sheet = null; save(); render(false); break;
    }
    case 'newTask': U.sheet = { type: 'task', f: blankTask(el.dataset.d) }; render(false); setTimeout(() => { const i = document.getElementById('tTitle'); if (i) i.focus(); }, 60); break;
    case 'editTask': U.sheet = { type: 'task', edit: task.id, f: { title: task.title, date: task.date, time: task.time || '', rep: task.rep, days: (task.days || []).slice(), imp: task.imp || 0, cat: task.cat || '' } }; render(false); break;
    case 'sheetHabit': U.sheet = { type: 'habit', f: { name: U.sheet.f.title || '', color: COLORS[0][0], target: 1, days: [1, 1, 1, 1, 1, 1, 1] } }; render(false); break;
    case 'sheetTask': U.sheet = { type: 'task', f: Object.assign(blankTask(), { title: U.sheet.f.name || '' }) }; render(false); break;
    case 'fset': { const k = el.dataset.k; let v = el.dataset.v; if (k === 'imp') v = +v; U.sheet.f[k] = v; if (k === 'rep' && v === 'weekly' && !U.sheet.f.days.length) U.sheet.f.days = [wdi(U.sheet.f.date)]; render(false); break; }
    case 'fday': { const i = +el.dataset.i, d = U.sheet.f.days; const j = d.indexOf(i); if (j >= 0) { if (d.length > 1) d.splice(j, 1); } else d.push(i); render(false); break; }
    case 'openCats': U.sheet = null; go({ v: 'cats' }); break;
    case 'saveTask': {
      const f = U.sheet.f; if (!f.title.trim()) { toast('Напишите, что нужно сделать'); break; }
      const data = { title: f.title.trim(), date: f.date, time: f.time, rep: f.rep, days: f.days.slice(), imp: f.imp, cat: f.cat };
      if (U.sheet.edit) Object.assign(S.tasks.find((t) => t.id === U.sheet.edit), data);
      else S.tasks.push(Object.assign({ id: uid(), done: {}, skip: {} }, data));
      U.sheet = null; save(); render(false); toast('Сохранено'); break;
    }
    case 'newHabit': U.sheet = { type: 'habit', f: { name: '', color: COLORS[S.habits.length % COLORS.length][0], target: 1, days: [1, 1, 1, 1, 1, 1, 1] } }; render(false); break;
    case 'editHabit': U.sheet = { type: 'habit', edit: habit.id, f: { name: habit.name, color: habit.color, target: habit.target, days: habit.days.slice() } }; render(false); break;
    case 'hset': U.sheet.f[el.dataset.k] = el.dataset.v; render(false); break;
    case 'hstep': U.sheet.f.target = Math.max(1, Math.min(30, U.sheet.f.target + (+el.dataset.n))); render(false); break;
    case 'hday': { const i = +el.dataset.i, d = U.sheet.f.days; d[i] = d[i] ? 0 : 1; if (!d.some(Boolean)) d[i] = 1; render(false); break; }
    case 'saveHabit': {
      const f = U.sheet.f; if (!f.name.trim()) { toast('Как называется привычка?'); break; }
      if (U.sheet.edit) Object.assign(S.habits.find((h) => h.id === U.sheet.edit), { name: f.name.trim(), color: f.color, target: f.target, days: f.days.slice() });
      else S.habits.push({ id: uid(), name: f.name.trim(), color: f.color, target: f.target, days: f.days.slice(), log: {}, created: TODAY() });
      const wasEdit = !!U.sheet.edit; U.sheet = null; save(); render(false); toast(wasEdit ? 'Сохранено' : 'Семечко посажено'); break;
    }
    case 'waterHabit': {
      const d = el.dataset.d || U.day;
      if (d > TODAY()) { toast('Будущие дни пока нельзя отметить'); break; }
      const bloomed = water(habit, d); render(false);
      if (bloomed) { const svg = app.querySelector('svg[data-h="' + habit.id + '"]'); if (svg) svg.classList.add('bloom'); }
      break;
    }
    case 'habitMinus': { const d = TODAY(); const c = count(habit, d); if (c > 0) { habit.log[d] = c - 1; if (!habit.log[d]) delete habit.log[d]; save(); } render(false); break; }
    case 'delHabit': if (el.dataset.confirm) { S.habits = S.habits.filter((h) => h !== habit); save(); toast('Привычка удалена'); back(); } else { el.dataset.confirm = '1'; el.textContent = 'Нажмите ещё раз, чтобы удалить'; setTimeout(() => { if (el.isConnected) { delete el.dataset.confirm; el.textContent = 'Удалить привычку'; } }, 3000); } break;
    case 'setMood': { const v = +el.dataset.v; const m = S.mood[U.day] || (S.mood[U.day] = {}); m.v = m.v === v ? 0 : v; if (!m.v && !(m.f || []).length && !m.n) delete S.mood[U.day]; save(); render(false); break; }
    case 'feel': { const m = S.mood[U.day] || (S.mood[U.day] = {}); m.f = m.f || []; const f = el.dataset.f; const j = m.f.indexOf(f); if (j >= 0) m.f.splice(j, 1); else m.f.push(f); save(); render(false); break; }
    case 'season': U.season = +el.dataset.i; render(false); break;
    case 'calNav': { const [y, m] = (U.calMonth || TODAY().slice(0, 7)).split('-').map(Number); const nd = new Date(y, m - 1 + (+el.dataset.n), 1); U.calMonth = ds(nd).slice(0, 7); render(false); break; }
    case 'calDay': U.calDay = el.dataset.d; render(false); break;
    case 'period': U.period = el.dataset.p; render(false); break;
    case 'catEdit': { const s = cur(); s.edit = id; s.form = null; render(false); break; }
    case 'catCancel': { const s = cur(); s.edit = null; s.form = null; render(false); break; }
    case 'catColor': { const s = cur(); s.form.name = document.getElementById('catName').value; s.form.color = el.dataset.c; render(false); break; }
    case 'catSave': {
      const s = cur(); const name = document.getElementById('catName').value.trim(); if (!name) { toast('Введите название'); break; }
      if (s.edit) Object.assign(S.cats.find((c) => c.id === s.edit), { name, color: s.form.color }); else S.cats.push({ id: uid(), name, color: s.form.color });
      s.edit = null; s.form = null; save(); toast('Сохранено'); render(false); break;
    }
    case 'catDel': if (el.dataset.confirm) { S.cats = S.cats.filter((c) => c.id !== id); S.tasks.forEach((t) => { if (t.cat === id) t.cat = ''; }); save(); render(false); } else { el.dataset.confirm = '1'; toast('Нажмите ещё раз, чтобы удалить категорию'); setTimeout(() => { delete el.dataset.confirm; }, 3000); } break;
    case 'export': {
      try { const blob = new Blob([JSON.stringify({ app: 'buton', v: 1, data: S })], { type: 'application/json' }); const url = URL.createObjectURL(blob); const l = document.createElement('a'); l.href = url; l.download = 'buton-' + TODAY() + '.json'; document.body.appendChild(l); l.click(); l.remove(); setTimeout(() => URL.revokeObjectURL(url), 2000); }
      catch (err) { toast('Не удалось сохранить файл'); }
      break;
    }
  }
});
app.addEventListener('change', (e) => {
  const el = e.target, a = el.dataset.a;
  if (a === 'fdate' && el.value) { readInputs(); U.sheet.f.date = el.value; render(false); }
  if (a === 'ftime') { readInputs(); U.sheet.f.time = el.value; render(false); }
  if (a === 'name') { S.name = el.value.trim(); save(); }
  if (a === 'import' && el.files[0]) {
    const r = new FileReader();
    r.onload = () => { try { const o = JSON.parse(r.result); if (o.app !== 'buton' || !o.data || !o.data.tasks) throw 0; S = o.data; save(); toast('Данные загружены'); render(true); } catch (err) { toast('Это не файл Бутона'); } };
    r.readAsText(el.files[0]);
  }
});
let lastToday = TODAY();
document.addEventListener('visibilitychange', () => { if (!document.hidden && TODAY() !== lastToday) { if (U.day === lastToday) U.day = TODAY(); lastToday = TODAY(); if (!U.sheet) render(false); } });

render(true);
if ('serviceWorker' in navigator && location.protocol === 'https:') {
  navigator.serviceWorker.register('sw.js', { updateViaCache: 'none' }).then((r) => r.update()).catch(() => {});
  let reloaded = false; navigator.serviceWorker.addEventListener('controllerchange', () => { if (!reloaded && !U.sheet) { reloaded = true; location.reload(); } });
}
})();
