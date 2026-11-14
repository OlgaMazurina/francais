(function () {
'use strict';
const W = window.WORDS, P = window.PHRASES, V = window.VERBS, R = window.PREPS, PH = window.PHONETICS, G = window.GRAMMAR;
const app = document.getElementById('app');

// ---------- icons ----------
const I = {
  back: '<svg width="12" height="20" viewBox="0 0 12 20" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M10 2L2 10l8 8"/></svg>',
  chev: '<svg class="chev" viewBox="0 0 8 14" fill="none" stroke="#C4B8AF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M1 1l6 6-6 6"/></svg>',
  spk: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 9v6h4l5 4V5L8 9z M16 9a4 4 0 0 1 0 6 M19 6a8 8 0 0 1 0 12"/></svg>',
  mark: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round" aria-hidden="true"><path d="M6 3h12v18l-6-4-6 4z"/></svg>',
  x: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>',
  flame: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 2c1 4 6 6 6 12a6 6 0 0 1-12 0c0-3 2-5 3-6 0 2 1 3 2 3 0-4-1-6 1-9z"/></svg>',
  search: '<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" aria-hidden="true"><path d="M11 4a7 7 0 1 0 0 14a7 7 0 1 0 0-14 M16 16l5 5"/></svg>',
  check: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12l5 5 9-10"/></svg>'
};
const glyph = (d) => '<svg viewBox="0 0 24 24" fill="none" stroke="#3A3350" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="' + d + '"/></svg>';
const TABS = [
  { id: 'home', label: 'Учить', d: 'M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2z M6 19h13' },
  { id: 'review', label: 'Повторение', d: 'M17 2l4 4-4 4 M3 11V9a3 3 0 0 1 3-3h15 M7 22l-4-4 4-4 M21 13v2a3 3 0 0 1-3 3H3' },
  { id: 'saved', label: 'Мои слова', d: 'M6 3h12v18l-6-4-6 4z' },
  { id: 'search', label: 'Поиск', d: 'M11 4a7 7 0 1 0 0 14a7 7 0 1 0 0-14 M16 16l5 5' }
];
const TOPICS = [
  ['food', '🍎', 'Еда и напитки'], ['home', '🏠', 'Дом'], ['family', '👨‍👩‍👧', 'Семья'], ['people', '🧑', 'Люди'],
  ['body', '🖐️', 'Тело и здоровье'], ['clothes', '👗', 'Одежда'], ['city', '🏙️', 'Город и покупки'], ['transport', '🚆', 'Транспорт и путешествия'],
  ['nature', '🌳', 'Природа и погода'], ['animals', '🐈', 'Животные'], ['work', '💼', 'Работа и учёба'], ['time', '⏰', 'Время и даты'], ['seasons', '🍂', 'Времена года и месяцы'],
  ['feelings', '❤️', 'Чувства'], ['colors', '🎨', 'Цвета'], ['numbers', '🔢', 'Числа']
];

// ---------- helpers ----------
const esc = (s) => String(s == null ? '' : s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const today = () => { const d = new Date(); return d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate(); };
const DAY = 86400000;
const shuffle = (a) => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const pick = (a) => a[Math.floor(Math.random() * a.length)];
const plural = (n, a, b, c) => { const m10 = n % 10, m100 = n % 100; return m10 === 1 && m100 !== 11 ? a : (m10 >= 2 && m10 <= 4 && (m100 < 10 || m100 >= 20) ? b : c); };
function toast(t) { const el = document.getElementById('toast'); el.textContent = t; el.classList.add('show'); clearTimeout(toast.t); toast.t = setTimeout(() => el.classList.remove('show'), 1600); }

// ---------- storage ----------
const KEY = 'francais-v1';
let S = { saved: {}, known: {}, day: '', done: 0, streak: 0, last: '', goal: 20 };
try { const raw = localStorage.getItem(KEY); if (raw) S = Object.assign(S, JSON.parse(raw)); } catch (e) { /* storage unavailable */ }
function save() { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) { /* ignore */ } }
function bump() {
  const t = today();
  if (S.day !== t) { S.day = t; S.done = 0; }
  S.done++;
  if (S.last !== t) {
    const y = new Date(Date.now() - DAY); const ys = y.getFullYear() + '-' + (y.getMonth() + 1) + '-' + y.getDate();
    S.streak = S.last === ys ? S.streak + 1 : 1; S.last = t;
  }
  save();
}
function doneToday() { return S.day === today() ? S.done : 0; }
function streakNow() {
  const y = new Date(Date.now() - DAY); const ys = y.getFullYear() + '-' + (y.getMonth() + 1) + '-' + y.getDate();
  return (S.last === today() || S.last === ys) ? S.streak : 0;
}

// ---------- items ----------
// every learnable thing has a key: w:, p:, v:, r:
const byKey = {};
W.forEach((w, i) => { w.k = 'w:' + w.fr; w.i = i; byKey[w.k] = w; });
P.forEach((p) => { p.k = 'p:' + p.fr; byKey[p.k] = p; });
V.forEach((v) => { v.k = 'v:' + v.inf; byKey[v.k] = v; });
R.forEach((r) => { r.k = 'r:' + r.v; r.base = r.p === '∅' ? r.v : r.v.replace(new RegExp('\\s+' + r.p + '$'), ''); byKey[r.k] = r; });
function front(k) { const it = byKey[k]; if (!it) return ''; const t = k[0];
  if (t === 'v') return it.inf; if (t === 'r') return it.v; return it.fr; }
function back(k) { const it = byKey[k]; return it ? it.ru : ''; }
function sayText(k) { const it = byKey[k]; if (!it) return ''; if (k[0] === 'v') return it.inf; if (k[0] === 'r') return it.exFr; return it.fr; }
function isSaved(k) { return !!S.saved[k]; }
function toggleSave(k) {
  if (S.saved[k]) { delete S.saved[k]; toast('Убрано из «Моих слов»'); }
  else { S.saved[k] = { b: 0, due: Date.now() }; toast('Сохранено в «Мои слова»'); }
  save();
}
function addSaved(k) { if (!S.saved[k]) { S.saved[k] = { b: 0, due: Date.now() }; save(); } else { S.saved[k].b = 0; S.saved[k].due = Date.now(); save(); } }
const GAPS = [0, 1, 3, 7, 14, 30, 60];
function dueKeys() { const now = Date.now(); return Object.keys(S.saved).filter((k) => byKey[k] && S.saved[k].due <= now); }

// ---------- speech ----------
let voice = null;
function pickVoice() {
  if (!('speechSynthesis' in window)) return;
  const vs = speechSynthesis.getVoices().filter((v) => /^fr(-|_|$)/i.test(v.lang));
  voice = vs.find((v) => /fr[-_]FR/i.test(v.lang) && /(Amélie|Thomas|Audrey|Marie|Google)/i.test(v.name)) || vs.find((v) => /fr[-_]FR/i.test(v.lang)) || vs[0] || null;
}
if ('speechSynthesis' in window) { pickVoice(); speechSynthesis.onvoiceschanged = pickVoice; }
function say(text) {
  if (!('speechSynthesis' in window)) { toast('Озвучка не поддерживается в этом браузере'); return; }
  text = String(text).replace(/\[_\]/g, ' ').replace(/[\[\]]/g, '').replace(/\(.*?\)/g, '').replace(/…/g, '').replace(/\s*\/\s*/g, ', ');
  try {
    speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'fr-FR'; if (voice) u.voice = voice; u.rate = 0.88;
    speechSynthesis.speak(u);
  } catch (e) { toast('Не удалось воспроизвести'); }
}

// ---------- verbs ----------
const PRON = ['je', 'tu', 'il / elle', 'nous', 'vous', 'ils / elles'];
const TENSES = ['Présent', 'Passé composé', 'Imparfait', 'Futur simple'];
const AUX = { avoir: ['ai', 'as', 'a', 'avons', 'avez', 'ont'], 'être': ['suis', 'es', 'est', 'sommes', 'êtes', 'sont'] };
const vowel = (s) => /^[aeiouyhàâéèêëîïôûœ]/i.test(s);
function conj(v, t) {
  const imp = v.pres.filter((x) => x !== '-').length === 1;
  const out = [];
  for (let i = 0; i < 6; i++) {
    if (imp && i !== 2) continue;
    let f;
    if (t === 0) f = v.pres[i];
    else if (t === 1) f = AUX[v.aux][i] + ' ' + v.pp + (v.aux === 'être' ? (i < 3 ? '(e)' : '(e)s') : '');
    else if (t === 2) f = v.imp + ['ais', 'ais', 'ait', 'ions', 'iez', 'aient'][i];
    else f = v.fut + ['ai', 'as', 'a', 'ons', 'ez', 'ont'][i];
    let p = imp ? 'il' : PRON[i];
    if (i === 0 && vowel(f)) p = 'j’';
    out.push({ p, f, full: (p === 'j’' ? 'j’' : p.split(' / ')[0] + ' ') + f.replace(/\(e\)s?/, (m) => m === '(e)s' ? 's' : '') });
  }
  return out;
}

// ---------- gender hints ----------
const HINTS = [
  [/tion$|sion$/, 'f', 'Слова на -tion / -sion почти всегда женского рода.'],
  [/té$/, 'f', 'Слова на -té обычно женского рода.'],
  [/ure$/, 'f', 'Слова на -ure обычно женского рода.'],
  [/ette$|elle$/, 'f', 'Слова на -ette / -elle обычно женского рода.'],
  [/ence$|ance$/, 'f', 'Слова на -ence / -ance обычно женского рода.'],
  [/ière$|ée$/, 'f', 'Слова на -ière / -ée обычно женского рода.'],
  [/age$/, 'm', 'Слова на -age обычно мужского рода (но: la plage, la page, l’image).'],
  [/ment$/, 'm', 'Слова на -ment мужского рода.'],
  [/eau$/, 'm', 'Слова на -eau обычно мужского рода (но: l’eau — ж. р.).'],
  [/oir$|isme$/, 'm', 'Слова на -oir / -isme мужского рода.'],
  [/[^e]$/, 'm', 'Слова, оканчивающиеся на согласную, чаще мужского рода.'],
  [/e$/, 'f', 'Слова на -e чаще женского рода, но исключений много.']
];
const bare = (fr) => fr.replace(/^(le |la |les |l’)/, '');
function hintFor(w) { const b = bare(w.fr); const h = HINTS.find((x) => x[0].test(b)); if (!h) return ''; return h[1] === w.g ? h[2] : 'Это исключение из правила: ' + h[2].charAt(0).toLowerCase() + h[2].slice(1); }
const GENDER_POOL = W.filter((w) => (w.g === 'm' || w.g === 'f') && /^(le |la |l’)/.test(w.fr));

// ---------- navigation ----------
let stack = [{ v: 'home' }];
let tab = 'home';
const cur = () => stack[stack.length - 1];
function go(view) { stack.push(view); render(true); }
function goBack() { if (stack.length > 1) stack.pop(); render(true); }
function setTab(t) { tab = t; stack = [{ v: t }]; render(true); }

// ---------- pieces ----------
const nav = (title, right) => '<div class="nav"><button class="back" data-a="back">' + I.back + 'Назад</button><div class="navTitle">' + (title || '') + '</div><div class="navR">' + (right || '') + '</div></div>';
const sayBtn = (text, small) => '<button class="say' + (small ? ' s' : '') + '" data-a="say" data-t="' + esc(text) + '" aria-label="Произнести">' + I.spk + '</button>';
const markBtn = (k) => '<button class="iconBtn' + (isSaved(k) ? ' saved' : '') + '" data-a="mark" data-k="' + esc(k) + '" aria-label="' + (isSaved(k) ? 'Убрать из «Моих слов»' : 'Сохранить в «Мои слова»') + '">' + I.mark + '</button>';
function row(o) {
  return '<button class="row" ' + (o.attrs || '') + '>' + (o.ico ? '<span class="ico" style="background:' + o.bg + '">' + glyph(o.ico) + '</span>' : (o.emoji != null ? '<span style="width:30px;font-size:24px;text-align:center;flex-shrink:0">' + o.emoji + '</span>' : '')) +
    '<span class="rb">' + (o.sub ? '<span class="two"><span class="main">' + o.title + '</span><span class="small">' + o.sub + '</span></span>' : '<span class="main">' + o.title + '</span>') +
    '<span class="val">' + (o.val != null ? o.val : '') + (o.noChev ? '' : I.chev) + '</span></span></button>';
}
const tabbar = () => {
  const due = dueKeys().length;
  return '<nav class="tabbar" aria-label="Разделы"><div class="tabs">' + TABS.map((t) => '<button class="tab' + (tab === t.id ? ' on' : '') + '" data-a="tab" data-t="' + t.id + '"' + (tab === t.id ? ' aria-current="page"' : '') + '><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="' + t.d + '"/></svg>' + t.label + (t.id === 'review' && due ? '<span class="badge">' + (due > 99 ? '99+' : due) + '</span>' : '') + '</button>').join('') + '</div></nav>';
};
const tag = (g) => g === 'f' ? '<span class="tag f">ж. р.</span>' : g === 'm' ? '<span class="tag m">м. р.</span>' : '';

// ---------- views ----------
const VIEWS = {};

VIEWS.home = () => {
  const d = doneToday(), goal = S.goal, pct = Math.min(100, Math.round(d / goal * 100));
  const nextI = W.findIndex((w) => !S.known[w.k] && !S.saved[w.k]);
  const knownN = W.filter((w) => S.known[w.k]).length;
  const date = new Date().toLocaleDateString('ru-RU', { weekday: 'long', day: 'numeric', month: 'long' });
  const learn = [
    { a: 'words', title: 'Слова', val: knownN + ' / ' + W.length, bg: '#DEE7FF', ico: 'M4 7h12v13H4z M8 4h12v13' },
    { a: 'topics', title: 'Темы', val: TOPICS.length, bg: '#DDF5E4', ico: 'M4 4h7v7H4z M13 4h7v7h-7z M4 13h7v7H4z M13 13h7v7h-7z' },
    { a: 'phrases', title: 'Фразы на каждый день', val: P.length, bg: '#FFE9D2', ico: 'M4 5h16v11H9l-5 4z' },
    { a: 'phon', title: 'Фонетика', val: PH.length, bg: '#FFE2E9', ico: 'M4 12h1 M8 8v8 M12 5v14 M16 9v6 M20 12h0' }
  ];
  const gram = [
    { a: 'grammar', title: 'Правила', val: G.length, bg: '#E6E3FC', ico: 'M5 6h14 M12 6v13 M9 19h6' },
    { a: 'verbs', title: 'Спряжения', val: V.length, bg: '#F3E4FA', ico: 'M4 5h16v14H4z M4 10h16 M4 15h16 M10 5v14' },
    { a: 'preps', title: 'Предлоги после глаголов', val: R.length, bg: '#DCF3F7', ico: 'M5 12h14 M13 6l6 6-6 6' },
    { a: 'gender', title: 'Род существительных', val: '', bg: '#FFE4E1', ico: 'M8 8a4 4 0 1 0 0 8a4 4 0 1 0 0-8 M16 8a4 4 0 1 0 0 8a4 4 0 1 0 0-8' }
  ];
  const st = streakNow();
  return '<div class="screen"><div class="sub">' + esc(date) + '</div><h1>Français</h1>' +
    '<div class="card goal"><div class="goalTop"><div><div style="font-size:15px;color:var(--muted)">Цель на сегодня</div><div class="big">' + d + ' <span>из ' + goal + ' слов</span></div></div>' +
    (st ? '<div class="pill">' + I.flame + st + ' ' + plural(st, 'день', 'дня', 'дней') + '</div>' : '') + '</div>' +
    '<div class="bar"><i style="width:' + pct + '%"></i></div>' +
    '<button class="btn" data-a="deck" data-src="all">' + (nextI < 0 ? 'Повторить все слова' : 'Продолжить · Слова ' + (nextI + 1) + ' / ' + W.length) + '</button></div>' +
    '<div class="secH">Учить</div><div class="group">' + learn.map((x) => row(Object.assign({ attrs: 'data-a="open" data-v="' + x.a + '"' }, x))).join('') + '</div>' +
    '<div class="secH">Грамматика</div><div class="group">' + gram.map((x) => row(Object.assign({ attrs: 'data-a="open" data-v="' + x.a + '"' }, x))).join('') + '</div>' +
    '</div>';
};

VIEWS.words = () => {
  const knownN = W.filter((w) => S.known[w.k]).length;
  return '<div class="screen noTabs">' + nav('') + '<h1>Слова</h1>' +
    '<div class="card"><div style="display:flex;justify-content:space-between;font-size:15px;color:var(--muted);margin-bottom:10px"><span>Знаю</span><span>' + knownN + ' из ' + W.length + '</span></div><div class="bar"><i style="width:' + (knownN / W.length * 100) + '%"></i></div></div>' +
    '<div class="secH">Как учить</div><div class="group">' +
    row({ title: 'По порядку (самые частые)', attrs: 'data-a="deck" data-src="all"' }) +
    row({ title: 'Вперемешку', attrs: 'data-a="deck" data-src="shuffle"' }) +
    row({ title: 'Обратно: с русского', sub: 'Видите перевод — вспоминаете слово', attrs: 'data-a="deck" data-src="all" data-rev="1"' }) +
    row({ title: 'По темам', attrs: 'data-a="open" data-v="topics"' }) +
    '</div><div class="secH">Сброс</div><div class="group">' +
    row({ title: '<span style="color:var(--bad)">Начать слова заново</span>', noChev: true, attrs: 'data-a="resetKnown"' }) + '</div></div>';
};

VIEWS.topics = () => {
  return '<div class="screen noTabs">' + nav('') + '<h1>Темы</h1><div class="grid2">' + TOPICS.map(([id, e, name]) => {
    const list = W.filter((w) => w.t === id); const kn = list.filter((w) => S.known[w.k]).length;
    return '<button class="tile" data-a="deck" data-src="topic" data-topic="' + id + '"><span class="te">' + e + '</span><span class="tn">' + name + '</span><span class="tc">' + kn + ' из ' + list.length + ' слов</span><span class="bar thin"><i style="width:' + (list.length ? kn / list.length * 100 : 0) + '%;background:#A8E2BC"></i></span></button>';
  }).join('') + '</div></div>';
};

// deck: generic flashcards for keys
function startDeck(src, opts) {
  opts = opts || {};
  let keys;
  if (src === 'all') { const first = W.findIndex((w) => !S.known[w.k]); keys = W.slice(first < 0 ? 0 : first).filter((w) => !S.known[w.k]).map((w) => w.k); if (!keys.length) keys = W.map((w) => w.k); }
  else if (src === 'shuffle') { keys = shuffle(W.filter((w) => !S.known[w.k]).map((w) => w.k)); if (!keys.length) keys = shuffle(W.map((w) => w.k)); }
  else if (src === 'topic') { const all = W.filter((w) => w.t === opts.topic); const un = all.filter((w) => !S.known[w.k]); keys = (un.length ? un : all).map((w) => w.k); }
  else if (src === 'phrases') { keys = (opts.topic ? P.filter((p) => p.t === opts.topic) : P).map((p) => p.k); }
  else if (src === 'review') { keys = shuffle(dueKeys()); }
  go({ v: 'deck', keys, i: 0, flip: false, rev: !!opts.rev, review: src === 'review', title: opts.title || (src === 'review' ? 'Повторение' : src === 'phrases' ? 'Фразы' : 'Слова') });
}

VIEWS.deck = (st) => {
  if (st.i >= st.keys.length) {
    return '<div class="screen noTabs">' + nav(st.title) + '<div class="empty"><div class="e">🎉</div><b>Готово!</b><br>' + (st.review ? 'Все слова на сегодня повторены.' : 'Вы прошли все карточки в этом наборе.') + '</div><button class="btn" data-a="back">Вернуться</button></div>';
  }
  const k = st.keys[st.i], it = byKey[k], t = k[0];
  const isWord = t === 'w';
  const fr = front(k), ru = back(k);
  const em = isWord ? it.e : t === 'p' ? '💬' : t === 'v' ? '🔤' : '🔗';
  const frontSide = st.rev
    ? '<div class="tr" style="font-size:30px">' + esc(ru) + '</div>'
    : (em ? '<div class="emoji">' + em + '</div>' : '') + (isWord && it.g ? '<div>' + tag(it.g) + '</div>' : '') + '<div class="fw' + (fr.length > 18 ? ' long' : '') + '">' + esc(fr) + '</div>';
  let backSide = '';
  if (st.flip) {
    backSide = '<div class="divider"></div>' + (st.rev
      ? '<div class="emoji' + (em ? '' : ' none') + '" style="font-size:64px;min-height:70px">' + (em || '') + '</div>' + (isWord && it.g ? '<div>' + tag(it.g) + '</div>' : '') + '<div class="fw' + (fr.length > 18 ? ' long' : '') + '">' + esc(fr) + '</div>'
      : '<div class="tr">' + esc(ru) + '</div>');
    if (t === 'r') backSide += '<div style="font-size:16px;margin-top:6px"><b>' + esc(it.exFr) + '</b><br><span style="color:var(--muted)">' + esc(it.exRu) + '</span></div>';
    if (t === 'v') backSide += '<div style="font-size:16px;margin-top:6px"><b>' + esc(it.exFr) + '</b><br><span style="color:var(--muted)">' + esc(it.exRu) + '</span></div>';
  }
  const showSay = !st.rev || st.flip;
  return '<div class="screen noTabs">' + nav(esc(st.title) + ' · ' + (st.i + 1) + ' / ' + st.keys.length, markBtn(k)) +
    '<div class="progressTop"><i style="width:' + (st.i / st.keys.length * 100) + '%"></i></div>' +
    '<div class="flash" data-a="flip" role="button" aria-label="Перевернуть карточку">' + frontSide + (showSay ? sayBtn(sayText(k)) : '') + backSide + '</div>' +
    '<div class="hint">' + (st.flip ? '&nbsp;' : 'Нажмите на карточку, чтобы увидеть ' + (st.rev ? 'слово' : 'перевод')) + '</div>' +
    '<div class="btns2"><button class="btn btnBad" data-a="ans" data-ok="0">' + (st.review ? 'Не помню' : 'Не знаю') + '</button><button class="btn btnGood" data-a="ans" data-ok="1">' + (st.review ? 'Помню' : 'Знаю') + '</button></div></div>';
};

function answer(ok) {
  const st = cur(); const k = st.keys[st.i];
  if (st.review) {
    const s = S.saved[k];
    if (s) { if (ok) { s.b = Math.min(s.b + 1, GAPS.length - 1); } else { s.b = 0; } s.due = Date.now() + (ok ? GAPS[s.b] * DAY : 0) - 60000; if (ok && s.b === GAPS.length - 1) { S.known[k] = 1; } }
    if (!ok) st.keys.push(k);
  } else {
    if (ok) { S.known[k] = 1; } else { addSaved(k); delete S.known[k]; toast('Добавлено в «Мои слова»'); }
  }
  if (k[0] === 'w' || st.review) bump(); else save();
  st.i++; st.flip = false; render(false);
}

VIEWS.phrases = (st) => {
  const topics = [...new Set(P.map((p) => p.t))];
  const sel = st.topic || topics[0];
  return '<div class="screen noTabs">' + nav('') + '<h1 class="sm">Фразы на каждый день</h1>' +
    '<div class="chips">' + topics.map((t) => '<button class="chip' + (t === sel ? ' on' : '') + '" data-a="setv" data-key="topic" data-val="' + esc(t) + '">' + esc(t) + '</button>').join('') + '</div>' +
    '<button class="btn" data-a="deck" data-src="phrases" data-topic="' + esc(sel) + '">Учить карточками</button>' +
    '<div class="exs mt">' + P.filter((p) => p.t === sel).map((p) => '<div class="exr"><div class="rb"><div><div class="fr">' + esc(p.fr) + '</div><div class="ru">' + esc(p.ru) + '</div></div><div style="display:flex">' + sayBtn(p.fr, true) + markBtn(p.k) + '</div></div></div>').join('') + '</div></div>';
};

VIEWS.phon = (st) => {
  const cats = [...new Set(PH.map((p) => p.c))];
  const sel = st.cat || cats[0];
  const hl = (w) => esc(w).replace(/\[_\]/g, '‿').replace(/\[(.*?)\]/g, '<span class="hl">$1</span>');
  return '<div class="screen noTabs">' + nav('') + '<h1>Фонетика</h1>' +
    '<div class="chips">' + cats.map((c) => '<button class="chip' + (c === sel ? ' on' : '') + '" data-a="setv" data-key="cat" data-val="' + esc(c) + '">' + esc(c) + '</button>').join('') + '</div>' +
    '<button class="btn" data-a="open" data-v="phonQuiz">Проверить себя: как читается?</button>' +
    PH.filter((p) => p.c === sel).map((p) => '<div class="card mt"><div class="ph"><div class="phL">' + esc(p.l) + '</div><div style="flex:1"><div style="font-size:19px;font-weight:700">' + esc(p.ipa) + ' — ' + esc(p.ru) + '</div><div style="font-size:15px;color:#3C3530;line-height:1.4;margin-top:3px">' + esc(p.d) + '</div></div></div>' +
      '<div class="exs" style="background:var(--fill);margin:12px 0 0">' + p.ex.map((e) => '<div class="exr"><div class="rb"><div><span class="fr" style="font-size:17px;font-weight:600">' + hl(e.w) + '</span> <span class="ipa">' + esc(e.ipa) + '</span><div class="ru">' + esc(e.ru) + '</div></div>' + sayBtn(e.w, true) + '</div></div>').join('') + '</div></div>').join('') + '</div>';
};

function newPhonQ() {
  const all = []; PH.forEach((p) => p.ex.forEach((e) => { if (e.ipa && e.ipa.length > 2) all.push(e); }));
  const q = pick(all); const opts = shuffle([q.ipa].concat(shuffle(all.filter((x) => x.ipa !== q.ipa)).slice(0, 2).map((x) => x.ipa)));
  return { q, opts, ans: null };
}
VIEWS.phonQuiz = (st) => {
  if (!st.cur) { st.cur = newPhonQ(); st.n = 0; st.ok = 0; }
  const c = st.cur, w = c.q.w.replace(/\[_\]/g, ' ').replace(/[\[\]]/g, '');
  return '<div class="screen noTabs">' + nav('Как читается?', '<span style="font-size:15px;color:var(--muted);padding-right:8px">' + st.ok + ' / ' + st.n + '</span>') +
    '<div class="flash" style="min-height:220px;cursor:default"><div class="fw">' + esc(w) + '</div><div style="color:var(--muted)">' + esc(c.q.ru) + '</div>' + (c.ans != null ? sayBtn(c.q.w) : '') + '</div>' +
    '<div class="opts">' + c.opts.map((o, i) => { let cls = ''; if (c.ans != null) { cls = o === c.q.ipa ? ' ok' : (i === c.ans ? ' no' : ' dim'); } return '<button class="opt' + cls + '" style="font-size:22px;font-weight:600" data-a="phonAns" data-i="' + i + '">' + (c.ans != null && o === c.q.ipa ? I.check : '') + esc(o) + '</button>'; }).join('') + '</div>' +
    (c.ans != null ? '<button class="btn mt" data-a="phonNext">Дальше</button>' : '<div class="hint">Выберите правильное произношение</div>') + '</div>';
};

VIEWS.grammar = () => {
  const groups = [...new Set(G.map((g) => g.g))];
  return '<div class="screen noTabs">' + nav('') + '<h1>Грамматика</h1>' + groups.map((gr) => '<div class="secH">' + esc(gr) + '</div><div class="group">' + G.map((g, i) => g.g === gr ? row({ title: esc(g.title), attrs: 'data-a="open" data-v="rule" data-i="' + i + '"' }) : '').join('') + '</div>').join('') + '</div>';
};
VIEWS.rule = (st) => {
  const g = G[st.i];
  const body = g.b.map((b) => {
    if (b[0] === 'p') return b[1] ? '<p>' + b[1] + '</p>' : '';
    if (b[0] === 'table') return '<table>' + b[1].map((r) => '<tr>' + r.map((c) => '<td>' + esc(c) + '</td>').join('') + '</tr>').join('') + '</table>';
    if (b[0] === 'ex') return '<div class="exs">' + b[1].map((e) => '<div class="exr"><div class="rb"><div><div class="fr">' + esc(e[0]) + '</div><div class="ru">' + esc(e[1]) + '</div></div>' + sayBtn(e[0], true) + '</div></div>').join('') + '</div>';
    return '';
  }).join('');
  return '<div class="screen noTabs">' + nav('Грамматика') + '<h1 class="sm">' + esc(g.title) + '</h1><div class="rule">' + body + '</div></div>';
};

VIEWS.verbs = () => '<div class="screen noTabs">' + nav('') + '<h1>Спряжения</h1>' +
  '<button class="btn" data-a="open" data-v="verbQuiz">Тренировка: все глаголы</button>' +
  '<div class="secH">Неправильные глаголы</div><div class="group">' + V.map((v, i) => row({ title: '<b style="font-weight:600">' + esc(v.inf) + '</b>', sub: esc(v.ru), attrs: 'data-a="open" data-v="verb" data-i="' + i + '"' })).join('') + '</div></div>';

VIEWS.verb = (st) => {
  const v = V[st.i], t = st.t || 0, forms = conj(v, t);
  return '<div class="screen noTabs">' + nav('Глаголы', markBtn(v.k)) +
    '<div style="display:flex;align-items:flex-end;justify-content:space-between;margin:4px 4px 14px"><div><h1 style="margin:0">' + esc(v.inf) + '</h1><div style="font-size:17px;color:var(--muted)">' + esc(v.ru) + '</div></div>' + sayBtn(v.inf) + '</div>' +
    '<div class="seg" role="tablist" style="grid-template-columns:repeat(4,1fr)">' + TENSES.map((n, i) => '<button role="tab" class="' + (i === t ? 'on' : '') + '" data-a="setv" data-key="t" data-val="' + i + '">' + (i === 1 ? 'Passé c.' : i === 3 ? 'Futur' : n) + '</button>').join('') + '</div>' +
    '<div class="table">' + forms.map((f) => '<div class="trow"><div class="rb"><div style="display:flex;align-items:baseline"><span class="pron">' + esc(f.p) + '</span><span class="form">' + esc(f.f) + '</span></div>' + sayBtn(f.full, true) + '</div></div>').join('') + '</div>' +
    (t === 1 ? '<div class="hint" style="text-align:left;margin:10px 4px">Вспомогательный глагол: <b>' + v.aux + '</b>' + (v.aux === 'être' ? '. Причастие согласуется: (e) — ж. р., s — мн. ч.' : '') + '</div>' : '') +
    '<div class="card mt"><div style="font-size:13px;color:var(--muted);text-transform:uppercase;margin-bottom:6px">Пример</div><div style="display:flex;align-items:center;justify-content:space-between;gap:8px"><div><div style="font-size:16px;font-weight:500">' + esc(v.exFr) + '</div><div style="font-size:15px;color:var(--muted)">' + esc(v.exRu) + '</div></div>' + sayBtn(v.exFr, true) + '</div></div>' +
    '<button class="btn mt" data-a="open" data-v="verbQuiz" data-i="' + st.i + '">Тренировать «' + esc(v.inf) + '»</button></div>';
};

function newVerbQ(only) {
  const v = only != null ? V[only] : pick(V); const t = Math.floor(Math.random() * 4); const forms = conj(v, t); const f = pick(forms);
  return { v, t, f, show: false };
}
VIEWS.verbQuiz = (st) => {
  if (!st.cur) { st.cur = newVerbQ(st.i); st.n = 0; st.ok = 0; }
  const c = st.cur;
  return '<div class="screen noTabs">' + nav(st.i != null ? esc(V[st.i].inf) : 'Спряжения', '<span style="font-size:15px;color:var(--muted);padding-right:8px">' + st.ok + ' / ' + st.n + '</span>') +
    '<div class="flash" data-a="vflip" role="button" style="min-height:300px"><div style="font-size:15px;color:var(--muted);text-transform:uppercase;letter-spacing:.3px">' + TENSES[c.t] + '</div>' +
    '<div class="fw">' + esc(c.f.p === 'j’' ? 'je' : c.f.p) + ' · ' + esc(c.v.inf) + '</div><div style="color:var(--muted)">' + esc(c.v.ru) + '</div>' +
    (c.show ? '<div class="divider"></div><div class="fw" style="color:var(--accent)">' + esc((c.f.p === 'j’' ? 'j’' : c.f.p + ' ') + c.f.f) + '</div>' + sayBtn(c.f.full) : '') + '</div>' +
    (c.show ? '<div class="btns2 mt"><button class="btn btnBad" data-a="vans" data-ok="0">Ошиблась</button><button class="btn btnGood" data-a="vans" data-ok="1">Верно</button></div>' : '<div class="hint">Назовите форму вслух, потом нажмите на карточку</div>') + '</div>';
};

VIEWS.preps = (st) => {
  const mode = st.mode || 0;
  const head = '<div class="screen noTabs">' + nav('') + '<h1 class="sm">Предлоги после глаголов</h1><div class="seg" role="tablist" style="grid-template-columns:1fr 1fr"><button role="tab" class="' + (mode === 0 ? 'on' : '') + '" data-a="setv" data-key="mode" data-val="0">Список</button><button role="tab" class="' + (mode === 1 ? 'on' : '') + '" data-a="setv" data-key="mode" data-val="1">Тренировка</button></div>';
  if (mode === 0) {
    const grp = [['à', 'Глагол + à', '#1F5AA6'], ['de', 'Глагол + de', '#A0428F'], ['∅', 'Без предлога (в отличие от русского)', '#1B7A35']];
    return head + grp.map(([p, title, col]) => '<div class="secH">' + title + '</div><div class="exs">' + R.filter((r) => r.p === p).map((r) => '<div class="exr"><div class="rb"><div><div class="fr" style="font-size:17px">' + esc(r.base) + (p !== '∅' ? ' <b style="color:' + col + '">' + p + '</b>' : '') + ' <span style="font-weight:400;color:var(--muted);font-size:14px">— ' + esc(r.ru) + '</span></div><div class="ru" style="color:#3C3530">' + esc(r.exFr) + '</div><div class="ru">' + esc(r.exRu) + '</div></div><div style="display:flex">' + sayBtn(r.exFr, true) + markBtn(r.k) + '</div></div></div>').join('') + '</div>').join('') + '</div>';
  }
  if (!st.cur) { st.cur = { r: pick(R), ans: null }; st.n = st.n || 0; st.ok = st.ok || 0; }
  const c = st.cur, opts = ['à', 'de', '∅'];
  return head + '<div style="text-align:right;color:var(--muted);font-size:15px;margin:0 4px 8px">' + st.ok + ' / ' + st.n + '</div>' +
    '<div class="flash" style="min-height:200px;cursor:default"><div class="fw">' + esc(c.r.base) + ' <span style="color:var(--faint)">___</span></div><div style="color:var(--muted)">' + esc(c.r.ru) + '</div></div>' +
    '<div class="opts" style="grid-template-columns:repeat(3,1fr)">' + opts.map((o, i) => { let cls = ''; if (c.ans != null) cls = o === c.r.p ? ' ok' : (i === c.ans ? ' no' : ' dim'); return '<button class="opt' + cls + '" data-a="pAns" data-i="' + i + '">' + (o === '∅' ? '—' : o) + '</button>'; }).join('') + '</div>' +
    (c.ans != null ? '<div class="card fb"><div class="h ' + (opts[c.ans] === c.r.p ? 'ok">Верно!' : 'no">Правильно: ' + (c.r.p === '∅' ? 'без предлога' : c.r.p)) + '</div><div style="display:flex;align-items:center;justify-content:space-between;gap:8px"><p><b>' + esc(c.r.exFr) + '</b><br>' + esc(c.r.exRu) + '</p>' + sayBtn(c.r.exFr, true) + '</div></div><button class="btn mt" data-a="pNext">Дальше</button>' : '<div class="hint">«—» значит без предлога</div>') + '</div>';
};

VIEWS.gender = (st) => {
  if (!st.cur) { st.cur = { w: pick(GENDER_POOL), ans: null }; st.n = 0; st.ok = 0; st.res = []; }
  const c = st.cur, w = c.w, b = bare(w.fr), elided = w.fr.startsWith('l’');
  const art = (g) => (elided ? 'l’ (' + (g === 'm' ? 'le' : 'la') + ')' : (g === 'm' ? 'le' : 'la'));
  const okAns = c.ans != null && c.ans === w.g;
  return '<div class="screen noTabs">' + nav('Le или la?', '<span style="font-size:15px;color:var(--muted);padding-right:8px">' + st.ok + ' / ' + st.n + '</span>') +
    '<div class="flash" style="min-height:300px;cursor:default">' + (w.e ? '<div class="emoji">' + w.e + '</div>' : '') + '<div class="fw">' + (c.ans != null ? '<span style="color:' + (w.g === 'f' ? 'var(--fem)' : 'var(--masc)') + '">' + esc(elided ? 'l’' : (w.g === 'm' ? 'le ' : 'la ')) + '</span>' : '<span style="color:var(--faint)">___ </span>') + esc(b) + '</div><div style="color:var(--muted)">' + esc(w.ru) + '</div>' + sayBtn(c.ans != null ? w.fr : b) + '</div>' +
    '<div class="opts" style="grid-template-columns:1fr 1fr">' + ['m', 'f'].map((g) => { let cls = ''; if (c.ans != null) cls = g === w.g ? ' ok' : (g === c.ans ? ' no' : ' dim'); return '<button class="opt' + cls + '" data-a="gAns" data-g="' + g + '">' + (c.ans != null && g === w.g ? I.check : '') + (g === 'm' ? 'le' : 'la') + '</button>'; }).join('') + '</div>' +
    (c.ans != null ? '<div class="card fb"><div class="h ' + (okAns ? 'ok">Верно! ' : 'no">Неверно. ') + (w.g === 'f' ? 'Женский род' : 'Мужской род') + '</div>' + (hintFor(w) ? '<p>' + esc(hintFor(w)) + '</p>' : '') + (elided ? '<p>Перед гласной или h артикль сокращается до l’, поэтому род нужно запомнить: ' + art(w.g) + '.</p>' : '') + '</div><button class="btn mt" data-a="gNext">Дальше</button>' : '') + '</div>';
};

VIEWS.review = () => {
  const due = dueKeys(), total = Object.keys(S.saved).length;
  return '<div class="screen"><h1>Повторение</h1>' + (due.length
    ? '<div class="card" style="text-align:center;padding:28px 16px"><div style="font-size:54px;font-weight:700;color:var(--accent)">' + due.length + '</div><div style="color:var(--muted);margin-bottom:18px">' + plural(due.length, 'карточка ждёт', 'карточки ждут', 'карточек ждут') + ' повторения</div><button class="btn" data-a="deck" data-src="review">Начать повторение</button></div>'
    : '<div class="empty"><div class="e">✨</div>' + (total ? 'На сегодня всё повторено.<br>Следующие карточки появятся позже.' : 'Здесь появятся слова, которые вы отметили «Не знаю» или сохранили закладкой.') + '</div>') +
    '<div class="secH">Как это работает</div><div class="card" style="font-size:15px;line-height:1.5;color:#3C3530">Каждое сохранённое слово возвращается через 1, 3, 7, 14, 30 и 60 дней. Если ответили «Не помню», слово начинает цикл заново. После 60 дней без ошибок оно считается выученным.</div></div>';
};

VIEWS.saved = (st) => {
  const f = st.f || 0;
  const typ = ['', 'w', 'p', 'vr'][f];
  const keys = Object.keys(S.saved).filter((k) => byKey[k] && (!typ || typ.includes(k[0]))).sort((a, b) => S.saved[b].due - S.saved[a].due);
  const total = Object.keys(S.saved).filter((k) => byKey[k]).length;
  const em = (k) => k[0] === 'w' ? (byKey[k].e || '🔤') : k[0] === 'p' ? '💬' : k[0] === 'v' ? '🔤' : '🔗';
  return '<div class="screen"><h1>Мои слова</h1>' +
    '<div class="seg" role="tablist" style="grid-template-columns:repeat(4,1fr)">' + ['Все', 'Слова', 'Фразы', 'Глаголы'].map((n, i) => '<button role="tab" class="' + (i === f ? 'on' : '') + '" data-a="setv" data-key="f" data-val="' + i + '">' + n + '</button>').join('') + '</div>' +
    (dueKeys().length ? '<button class="btn" data-a="deck" data-src="review">Повторить сегодня · ' + dueKeys().length + '</button>' : '') +
    (keys.length ? '<div class="secH">' + total + ' ' + plural(total, 'сохранено', 'сохранено', 'сохранено') + '</div><div class="group">' + keys.map((k) => {
      const s = S.saved[k], lvl = Math.min(3, Math.ceil(s.b / 2));
      return '<div class="row" style="cursor:default"><span style="width:30px;font-size:24px;text-align:center;flex-shrink:0">' + em(k) + '</span><span class="rb" style="padding-right:4px"><button class="two" style="text-align:left;flex:1" data-a="say" data-t="' + esc(sayText(k)) + '"><span class="main">' + esc(front(k)) + '</span><span class="small">' + esc(back(k)) + '</span></button><span class="dots" role="img" aria-label="Выучено на ' + lvl + ' из 3">' + [0, 1, 2].map((i) => '<i class="' + (i < lvl ? 'on' : '') + '"></i>').join('') + '</span><button class="del" data-a="unsave" data-k="' + esc(k) + '" aria-label="Удалить">' + I.x + '</button></span></div>';
    }).join('') + '</div>' : '<div class="empty"><div class="e">🔖</div>Пока пусто. Нажмите «Не знаю» на карточке или значок закладки, и слово появится здесь.</div>') +
    '<div class="secH">Перенос на другое устройство</div><div class="group">' +
    row({ title: 'Сохранить прогресс в файл', noChev: true, attrs: 'data-a="export"' }) +
    '<label class="row" style="cursor:pointer"><span class="rb"><span class="main" style="color:var(--accent)">Загрузить прогресс из файла</span></span><input type="file" accept=".json,application/json" class="vis" data-a="import"></label>' +
    '</div></div>';
};

VIEWS.search = (st) => {
  const q = (st.q || '').trim().toLowerCase();
  const norm = (s) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
  let res = [];
  if (q.length >= 2) {
    const nq = norm(q);
    const hit = (a, b) => norm(a).includes(nq) || norm(b).includes(nq);
    W.forEach((w) => hit(w.fr, w.ru) && res.push(w.k));
    P.forEach((p) => hit(p.fr, p.ru) && res.push(p.k));
    V.forEach((v) => hit(v.inf, v.ru) && res.push(v.k));
    R.forEach((r) => hit(r.v, r.ru) && res.push(r.k));
    res = res.slice(0, 60);
  }
  return '<div class="screen"><h1>Поиск</h1><label class="search">' + I.search + '<span class="vis">Поиск</span><input id="q" type="search" placeholder="Слово по-французски или по-русски" value="' + esc(st.q || '') + '" autocomplete="off" autocapitalize="off"></label>' +
    '<div id="sres">' + searchList(res, q) + '</div></div>';
};
function searchList(res, q) {
  if (q.length < 2) return '<div class="empty"><div class="e">🔎</div>Введите хотя бы две буквы</div>';
  if (!res.length) return '<div class="empty">Ничего не найдено</div>';
  return '<div class="group">' + res.map((k) => '<div class="row" style="cursor:default"><span class="rb" style="padding-right:4px"><button class="two" style="text-align:left;flex:1" data-a="say" data-t="' + esc(sayText(k)) + '"><span class="main">' + (k[0] === 'w' && byKey[k].e ? byKey[k].e + ' ' : '') + esc(front(k)) + '</span><span class="small">' + esc(back(k)) + '</span></button>' + markBtn(k) + '</span></div>').join('') + '</div>';
}

// ---------- render ----------
function render(top) {
  const st = cur();
  const root = ['home', 'review', 'saved', 'search'].includes(st.v);
  app.innerHTML = VIEWS[st.v](st) + (root ? tabbar() : '');
  if (top) window.scrollTo(0, 0);
  if (st.v === 'search') {
    const inp = document.getElementById('q');
    inp.addEventListener('input', () => { st.q = inp.value; const box = document.getElementById('sres'); const tmp = document.createElement('div'); tmp.innerHTML = VIEWS.search(st); box.innerHTML = tmp.querySelector('#sres').innerHTML; });
  }
}

// ---------- events ----------
app.addEventListener('click', (e) => {
  const el = e.target.closest('[data-a]'); if (!el) return;
  const a = el.dataset.a, st = cur();
  if (a === 'import') return;
  if (a === 'say') { e.stopPropagation(); say(el.dataset.t); return; }
  if (a === 'mark') { e.stopPropagation(); toggleSave(el.dataset.k); render(false); return; }
  switch (a) {
    case 'back': goBack(); break;
    case 'tab': setTab(el.dataset.t); break;
    case 'open': go({ v: el.dataset.v, i: el.dataset.i != null ? +el.dataset.i : undefined }); break;
    case 'setv': st[el.dataset.key] = isNaN(+el.dataset.val) ? el.dataset.val : +el.dataset.val; if (el.dataset.key === 'mode') st.cur = null; render(false); break;
    case 'deck': startDeck(el.dataset.src, { topic: el.dataset.topic, rev: el.dataset.rev === '1', title: el.dataset.topic ? (TOPICS.find((t) => t[0] === el.dataset.topic) || [0, 0, el.dataset.topic])[2] : '' }); break;
    case 'flip': st.flip = !st.flip; if (st.flip && st.rev) say(sayText(st.keys[st.i])); render(false); break;
    case 'ans': answer(el.dataset.ok === '1'); break;
    case 'vflip': if (!st.cur.show) { st.cur.show = true; say(st.cur.f.full); render(false); } break;
    case 'vans': st.n++; if (el.dataset.ok === '1') st.ok++; bump(); st.cur = newVerbQ(st.i); render(false); break;
    case 'pAns': if (st.cur.ans == null) { st.cur.ans = +el.dataset.i; st.n++; if (['à', 'de', '∅'][st.cur.ans] === st.cur.r.p) st.ok++; else addSaved(st.cur.r.k); bump(); render(false); } break;
    case 'pNext': st.cur = { r: pick(R), ans: null }; render(false); break;
    case 'gAns': if (st.cur.ans == null) { st.cur.ans = el.dataset.g; st.n++; if (st.cur.ans === st.cur.w.g) st.ok++; bump(); say(st.cur.w.fr); render(false); } break;
    case 'gNext': st.cur = { w: pick(GENDER_POOL), ans: null }; render(false); break;
    case 'phonAns': if (st.cur.ans == null) { st.cur.ans = +el.dataset.i; st.n++; if (st.cur.opts[st.cur.ans] === st.cur.q.ipa) st.ok++; say(st.cur.q.w); render(false); } break;
    case 'phonNext': st.cur = newPhonQ(); render(false); break;
    case 'unsave': delete S.saved[el.dataset.k]; save(); render(false); break;
    case 'resetKnown': if (st.confirm) { S.known = {}; save(); st.confirm = false; toast('Прогресс по словам сброшен'); render(false); } else { st.confirm = true; toast('Нажмите ещё раз, чтобы сбросить'); setTimeout(() => { st.confirm = false; }, 3000); } break;
    case 'export': {
      try {
        const blob = new Blob([JSON.stringify({ app: 'francais', v: 1, data: S })], { type: 'application/json' });
        const url = URL.createObjectURL(blob); const link = document.createElement('a'); link.href = url; link.download = 'francais-progress-' + today() + '.json';
        document.body.appendChild(link); link.click(); link.remove(); setTimeout(() => URL.revokeObjectURL(url), 2000);
      } catch (err) { toast('Не удалось сохранить файл'); }
      break;
    }
  }
});
app.addEventListener('change', (e) => {
  const el = e.target; if (el.dataset.a !== 'import' || !el.files[0]) return;
  const r = new FileReader();
  r.onload = () => { try { const o = JSON.parse(r.result); if (o.app !== 'francais' || !o.data) throw 0; S = Object.assign(S, o.data); save(); toast('Прогресс загружен'); render(false); } catch (err) { toast('Это не файл прогресса'); } };
  r.readAsText(el.files[0]);
});

render(true);
if ('serviceWorker' in navigator && location.protocol === 'https:') { navigator.serviceWorker.register('sw.js', { updateViaCache: 'none' }).then((r) => r.update()).catch(() => {}); let reloaded = false; navigator.serviceWorker.addEventListener('controllerchange', () => { if (!reloaded) { reloaded = true; location.reload(); } }); }
})();
