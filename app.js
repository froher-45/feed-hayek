// El Feed de Hayek — lógica del simulador.
// No usa machine learning: es un sistema de puntuación por temas, que es
// la idea básica detrás de muchos algoritmos de recomendación reales.

/* ---------- utilidades ---------- */

const $ = sel => document.querySelector(sel);
const pick = arr => arr[Math.floor(Math.random() * arr.length)];
const pct = x => Math.round(x * 100) + '%';
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const compact = new Intl.NumberFormat('es', { notation: 'compact', maximumFractionDigits: 1 });

/* ---------- modo claro / oscuro ---------- */
// La hoja de estilos ya sigue el tema del sistema por defecto (prefers-color-scheme).
// Este botón permite al usuario elegir uno a mano, y lo recuerda para la próxima visita.
const THEME_KEY = 'feed-hayek-theme';
const THEME_ICON = {
  // Sol: aparece en modo claro, invita a pasar a oscuro
  light: '<circle cx="12" cy="12" r="4.5"/><path d="M12 2.5v2.5M12 19v2.5M4.6 4.6l1.8 1.8M17.6 17.6l1.8 1.8M2.5 12H5M19 12h2.5M4.6 19.4l1.8-1.8M17.6 6.4l1.8-1.8"/>',
  // Luna: aparece en modo oscuro, invita a pasar a claro
  dark: '<path d="M20 14.7A8.5 8.5 0 0 1 9.3 4a8.5 8.5 0 1 0 10.7 10.7z"/>',
};

function systemPrefersDark() {
  return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
}

function effectiveTheme() {
  return document.documentElement.getAttribute('data-theme') || (systemPrefersDark() ? 'dark' : 'light');
}

function paintThemeToggle() {
  const theme = effectiveTheme();
  const btn = document.getElementById('theme-toggle');
  const icon = document.getElementById('theme-icon');
  if (!btn || !icon) return;
  icon.innerHTML = THEME_ICON[theme];
  btn.setAttribute('aria-label', theme === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro');
}

function initTheme() {
  let saved = null;
  try { saved = localStorage.getItem(THEME_KEY); } catch (e) { /* almacenamiento bloqueado: seguimos con el del sistema */ }
  if (saved === 'light' || saved === 'dark') document.documentElement.setAttribute('data-theme', saved);
  paintThemeToggle();
  const toggle = document.getElementById('theme-toggle');
  if (toggle) toggle.addEventListener('click', () => {
    const next = effectiveTheme() === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    try { localStorage.setItem(THEME_KEY, next); } catch (e) { /* no pasa nada si no se puede recordar */ }
    paintThemeToggle();
  });
}
initTheme();

function weightedPick(entries) {
  const total = entries.reduce((s, [, w]) => s + w, 0);
  let r = Math.random() * total;
  for (const [key, w] of entries) {
    r -= w;
    if (r <= 0) return key;
  }
  return entries[entries.length - 1][0];
}

// Número pseudoaleatorio estable por publicación (para contadores y horas)
function seeded(id, salt) {
  const x = Math.sin(id * 9301 + salt * 49297) * 233280;
  return x - Math.floor(x);
}

// Diversidad = entropía de Shannon normalizada (0 = un solo tema, 1 = todo variado)
function diversity(posts) {
  if (posts.length < 2) return 1;
  const counts = {};
  posts.forEach(p => { counts[p.cat] = (counts[p.cat] || 0) + 1; });
  let h = 0;
  for (const n of Object.values(counts)) {
    const p = n / posts.length;
    h -= p * Math.log(p);
  }
  return h / Math.log(Math.min(posts.length, CATEGORIES.length));
}

// Burbuja de una distribución de probabilidades: 0 = repartida entre todos los temas, 1 = todo en uno
function concentration(probs) {
  let h = 0;
  for (const p of Object.values(probs)) if (p > 0) h -= p * Math.log(p);
  return Math.max(0, 1 - h / Math.log(CATEGORIES.length));
}

// Tema dominante; si el segundo va casi parejo, nombra ambos
function topicLabel(probs) {
  const s = CATEGORIES.map(c => [c.name, probs[c.id]]).sort((a, b) => b[1] - a[1]);
  return s[1][1] >= s[0][1] * 0.6 ? `${s[0][0]} y ${s[1][0]}` : s[0][0];
}

function bubbleState(b, probs) {
  if (b < 0.35) return { text: 'Feed variado', cls: 'ok' };
  if (b < 0.65) return { text: `Feed de ${topicLabel(probs)}`, cls: 'warn' };
  return { text: `Burbuja de ${topicLabel(probs)}`, cls: 'bad' };
}

/* ---------- íconos ---------- */

const ICON = {
  reply: '<svg viewBox="0 0 24 24"><path d="M4 12a8 8 0 0 1 8-8h0a8 8 0 0 1 0 16H8l-4 3v-5"/></svg>',
  repost: '<svg viewBox="0 0 24 24"><path d="M7 7h11l-3-3M17 17H6l3 3"/><path d="M18 7v5M6 17v-5"/></svg>',
  heart: '<svg viewBox="0 0 24 24"><path d="M12 20s-7.5-4.6-9.3-9.2C1.5 7.6 3.7 4.5 7 4.5c2 0 3.4 1.1 5 3 1.6-1.9 3-3 5-3 3.3 0 5.5 3.1 4.3 6.3C19.5 15.4 12 20 12 20z"/></svg>',
  thumb: '<svg viewBox="0 0 24 24"><path d="M7 10v10H4V10h3zM7 10l4-7c1.4 0 2.5 1.1 2.5 2.5V9h5.2a2 2 0 0 1 2 2.4l-1.3 6.9a2 2 0 0 1-2 1.7H7"/></svg>',
  less: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M8 12h8"/></svg>',
  info: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h0"/></svg>',
  more: '<svg viewBox="0 0 24 24"><circle cx="5" cy="12" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/></svg>',
  spark: '<svg viewBox="0 0 24 24"><path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5 18 18M18 6l-2.5 2.5M8.5 15.5 6 18"/></svg>',
  trend: '<svg viewBox="0 0 24 24"><path d="M3 17l6-6 4 4 8-8M15 7h6v6"/></svg>',
  target: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="3"/></svg>',
  slider: '<svg viewBox="0 0 24 24"><path d="M4 8h10M18 8h2M4 16h4M12 16h8"/><circle cx="16" cy="8" r="2"/><circle cx="10" cy="16" r="2"/></svg>',
  gift: '<svg viewBox="0 0 24 24"><rect x="4" y="9" width="16" height="11" rx="1"/><path d="M12 9v11M4 13h16M12 9c-2-4-6-3-5 0M12 9c2-4 6-3 5 0"/></svg>',
};
const VERIFIED = '<svg class="verified" viewBox="0 0 24 24" aria-label="Cuenta verificada"><path d="M12 1.8l2.6 1.9 3.2-.2 1 3.1 2.6 1.9-1 3.1 1 3.1-2.6 1.9-1 3.1-3.2-.2L12 22.2l-2.6-1.9-3.2.2-1-3.1L2.6 15.5l1-3.1-1-3.1 2.6-1.9 1-3.1 3.2.2z"/><path d="M8 12.3l2.7 2.7L16.3 9" fill="none" stroke="#fff" stroke-width="2.2"/></svg>';

const AVATAR_COLORS = ['#3b5bdb', '#0c8599', '#2b8a3e', '#d9480f', '#c2255c', '#7048e8', '#1971c2', '#9c36b5', '#495057', '#e67700'];
const TIMES = ['12 min', '27 min', '48 min', '1 h', '2 h', '3 h', '5 h', '7 h', '9 h', '14 h', '1 d'];

function initials(name) {
  return name.split(/\s+/).slice(0, 2).map(w => w[0]).join('').toUpperCase();
}

/* ---------- el algoritmo ("planificador central") ---------- */

// Reacciones disponibles. Todas cuentan como interés, incluso "Me enoja";
// solo "No me gusta" es una señal negativa.
const REACTIONS = {
  like:    { emoji: '👍', label: 'Me gusta',      w: 1.5 },
  love:    { emoji: '❤️', label: 'Me encanta',    w: 2 },
  haha:    { emoji: '😂', label: 'Me divierte',   w: 1.5 },
  wow:     { emoji: '😮', label: 'Me asombra',    w: 1.5 },
  sad:     { emoji: '😢', label: 'Me entristece', w: 1 },
  angry:   { emoji: '😡', label: 'Me enoja',      w: 2 },
  dislike: { emoji: '👎', label: 'No me gusta',   neg: 0.5 },
};

// Cuánto suma cada señal positiva. Compartir dice más de ti que cualquier reacción.
const SIGNAL = { comment: 2, repost: 2.5 };
Object.entries(REACTIONS).forEach(([k, r]) => { if (r.w) SIGNAL[k] = r.w; });
// Cuánto multiplica cada señal negativa
const NEGATIVE = { pass: 0.7, less: 0.35, dislike: 0.45 };

// Qué tanto amplifica el algoritmo lo que ya te gusta (puntaje elevado a esta potencia)
const AMPLIFY = 3;

class Engine {
  constructor() { this.reset(); }

  reset() {
    this.w = {};
    this.engagedBy = {};
    CATEGORIES.forEach(c => { this.w[c.id] = 1; this.engagedBy[c.id] = 0; });
    this.interactions = 0;
    this.passes = 0;
    this.served = 0;  // publicaciones preparadas por el algoritmo
    this.steps = 0;   // publicaciones que de verdad llegaste a ver
    this.shown = [];
    this.lastShown = {};
    this.history = [0];
  }

  // Curiosidad: probabilidad de mostrar algo al azar. Baja con cada interacción.
  epsilon() { return Math.max(0.03, 0.4 * Math.pow(0.65, this.interactions)); }

  // Probabilidad real de que la próxima publicación sea de cada tema
  exposure() {
    const eps = this.epsilon();
    const sq = {};
    let total = 0;
    CATEGORIES.forEach(c => { sq[c.id] = this.w[c.id] ** AMPLIFY; total += sq[c.id]; });
    const out = {};
    CATEGORIES.forEach(c => { out[c.id] = (1 - eps) * sq[c.id] / total + eps / CATEGORIES.length; });
    return out;
  }

  // Nivel de burbuja: qué tan concentrado está lo que el algoritmo cree de ti.
  // Solo cambia cuando le das una señal (interactuar o pasar de largo).
  bubble() { return concentration(this.exposure()); }

  next() {
    const eps = this.epsilon();
    let cat, mode;
    if (Math.random() < eps) {
      cat = pick(CATEGORIES).id;
      mode = 'explore';
    } else {
      // Elevar al cubo amplifica lo que ya te gusta: el efecto "más de lo mismo"
      cat = weightedPick(CATEGORIES.map(c => [c.id, this.w[c.id] ** AMPLIFY]));
      mode = 'exploit';
    }
    const post = this.freshest(cat);
    const reason = this.reason(post, mode);
    this.served++;
    this.lastShown[post.id] = this.served;
    return { post, reason };
  }

  // Solo lo que de verdad aparece en tu pantalla cuenta para la burbuja
  markSeen(post) {
    this.steps++;
    this.shown.push(post);
  }

  // Dentro del tema, la publicación que hace más tiempo no ves
  freshest(cat) {
    let min = Infinity, cands = [];
    for (const p of POSTS) {
      if (p.cat !== cat) continue;
      const t = this.lastShown[p.id] || 0;
      if (t < min) { min = t; cands = [p]; } else if (t === min) cands.push(p);
    }
    return pick(cands);
  }

  // Señales positivas (SIGNAL) suman; negativas (NEGATIVE) multiplican.
  // undo = true revierte una señal, por ejemplo al quitar una reacción.
  feedback(post, signal, undo = false) {
    const c = post.cat;
    if (SIGNAL[signal]) {
      const d = undo ? -1 : 1;
      this.w[c] = Math.max(0.05, this.w[c] + d * SIGNAL[signal]);
      this.interactions += d;
      this.engagedBy[c] += d;
    } else if (NEGATIVE[signal]) {
      this.w[c] = undo ? this.w[c] / NEGATIVE[signal] : Math.max(0.05, this.w[c] * NEGATIVE[signal]);
      this.passes += undo ? -1 : 1;
    }
    this.history.push(this.bubble());
  }

  reason(post, mode) {
    const cat = CAT_BY_ID[post.cat].name;
    if (mode === 'explore') return { icon: 'spark', cls: 'explore', text: 'Explorando algo nuevo para ti' };
    const n = this.engagedBy[post.cat];
    if (n === 1) return { icon: 'heart', text: `Porque interactuaste con una publicación de ${cat}` };
    if (n > 1) return { icon: 'heart', text: `Porque interactuaste con ${n} publicaciones de ${cat}` };
    if (this.interactions === 0) return { icon: 'trend', text: 'Popular en la plataforma' };
    return { icon: 'target', text: 'Sugerido según tu actividad' };
  }

  topCat() {
    return CATEGORIES.reduce((a, c) => (this.w[c.id] > this.w[a.id] ? c : a), CATEGORIES[0]).id;
  }
}

/* ---------- publicaciones ---------- */

let uid = 0;
const entries = new Map(); // todas las publicaciones en pantalla, de ambos feeds

// learn = true: las interacciones le enseñan al algoritmo (feed de Inicio)
function makeEntry(post, reason, learn) {
  const r = seeded(post.id, 2) ** 2;
  const entry = {
    key: ++uid, post, reason, learn,
    reaction: null, reposted: false, comments: [], judged: false,
    base: { replies: Math.floor(r * 900) + 3, reposts: Math.floor(r * 3200) + 8, likes: Math.floor(r * 24000) + 41 },
  };
  entries.set(entry.key, entry);
  return entry;
}

const count = {
  replies: e => e.base.replies + e.comments.length,
  reposts: e => e.base.reposts + (e.reposted ? 1 : 0),
  likes: e => e.base.likes + (e.reaction && e.reaction !== 'dislike' ? 1 : 0),
};

function reactButtonHTML(entry) {
  const r = entry.reaction && REACTIONS[entry.reaction];
  const face = r ? `<span class="react-emoji">${r.emoji}</span>` : ICON.thumb;
  const label = r ? r.label : 'Reaccionar';
  return `${face}<span data-count="likes">${compact.format(count.likes(entry))}</span><span class="sr-only">${label}</span>`;
}

function commentHTML(text) {
  return `
    <div class="reply-item">
      <div class="avatar avatar-sm" style="--av:var(--fg)" aria-hidden="true">Tú</div>
      <div><span class="post-name">Tú</span> <span class="post-meta">· ahora</span><p>${esc(text)}</p></div>
    </div>`;
}

function postHTML(entry) {
  const p = entry.post;
  const c = CAT_BY_ID[p.cat];
  const av = AVATAR_COLORS[Math.floor(seeded(p.id, 1) * AVATAR_COLORS.length)];
  const time = TIMES[Math.floor(seeded(p.id, 4) * TIMES.length)];
  const reason = entry.reason;
  return `
    <article class="post" data-key="${entry.key}">
      ${reason ? `<div class="post-context ${reason.cls || ''}">${ICON[reason.icon]}<span>${esc(reason.text)}</span></div>` : ''}
      <div class="post-row">
        <div class="avatar" style="--av:${av}" aria-hidden="true">${initials(p.name)}</div>
        <div class="post-main">
          <div class="post-head">
            <span class="post-name">${esc(p.name)}</span>${p.verified ? VERIFIED : ''}
            <span class="post-meta">@${esc(p.handle)} · ${time}</span>
            <div class="menu-wrap">
              <button class="icon-btn" data-action="menu" aria-label="Más opciones" aria-haspopup="menu" aria-expanded="false">${ICON.more}</button>
              <div class="menu" role="menu" hidden>
                ${entry.learn ? `<button role="menuitem" data-action="less">${ICON.less}Mostrar menos</button>` : ''}
                <button role="menuitem" data-action="why">${ICON.info}¿Por qué veo esto?</button>
              </div>
            </div>
          </div>
          <p class="post-text">${esc(p.text)}</p>
          <span class="topic" style="--cat:${c.color}">${c.name}</span>
          <div class="post-actions">
            <button class="act react ${entry.reaction ? 'r-' + entry.reaction : ''}" data-action="react-btn" aria-haspopup="menu" aria-expanded="false">${reactButtonHTML(entry)}</button>
            <div class="picker" role="menu" aria-label="Reacciones" hidden>
              ${Object.entries(REACTIONS).map(([k, r]) => `
                <button role="menuitem" class="${k === 'dislike' ? 'neg' : ''}" data-action="react" data-r="${k}" aria-label="${r.label}" title="${r.label}">${r.emoji}</button>`).join('')}
            </div>
            <button class="act reply" data-action="reply" aria-label="Comentar">${ICON.reply}<span data-count="replies">${compact.format(count.replies(entry))}</span></button>
            <button class="act repost ${entry.reposted ? 'on' : ''}" data-action="repost" aria-pressed="${entry.reposted}" aria-label="Compartir">${ICON.repost}<span data-count="reposts">${compact.format(count.reposts(entry))}</span></button>
          </div>
          <div class="why-box" hidden></div>
          <div class="replies">${entry.comments.map(commentHTML).join('')}</div>
          <form class="composer" hidden>
            <label class="sr-only" for="reply-${entry.key}">Tu respuesta</label>
            <textarea id="reply-${entry.key}" rows="2" maxlength="280" placeholder="Escribe tu respuesta"></textarea>
            <div class="composer-foot">
              <button type="button" class="btn btn-quiet" data-action="reply-cancel">Cancelar</button>
              <button type="submit" class="btn btn-primary">Responder</button>
            </div>
          </form>
        </div>
      </div>
    </article>`;
}

function refreshCounts(entry, el) {
  const react = el.querySelector('[data-action="react-btn"]');
  react.className = 'act react' + (entry.reaction ? ' r-' + entry.reaction : '');
  react.innerHTML = reactButtonHTML(entry);
  el.querySelectorAll('[data-count]').forEach(s => { s.textContent = compact.format(count[s.dataset.count](entry)); });
  const rep = el.querySelector('[data-action="repost"]');
  rep.classList.toggle('on', entry.reposted);
  rep.setAttribute('aria-pressed', entry.reposted);
}

function learnFrom(entry, signal, undo = false) {
  if (!entry.learn) return; // en Modo Hayek tus clics no cambian el feed
  algo.engine.feedback(entry.post, signal, undo);
  entry.judged = true;
  updateBubbles();
}

function closeMenus(except) {
  document.querySelectorAll('.menu:not([hidden]), .picker:not([hidden])').forEach(m => {
    if (m === except) return;
    m.hidden = true;
    m.previousElementSibling.setAttribute('aria-expanded', 'false');
  });
}

function whyText(entry) {
  const cat = CAT_BY_ID[entry.post.cat].name;
  if (!entry.learn) return `${entry.reason.text}. En Modo Hayek el algoritmo no aprende de tus clics: solo sigue tus ajustes.`;
  const prob = pct(algo.engine.exposure()[entry.post.cat]);
  return `${entry.reason.text}. Ahora mismo el algoritmo calcula que hay ${prob} de probabilidad de que tu próxima publicación sea de ${cat}.`;
}

document.addEventListener('click', ev => {
  const btn = ev.target.closest('[data-action]');
  if (!ev.target.closest('.menu-wrap, .picker, [data-action="react-btn"]')) closeMenus();
  if (!btn) return;
  const el = btn.closest('.post');
  const entry = el && entries.get(Number(el.dataset.key));
  if (!entry) return;
  const action = btn.dataset.action;

  if (action === 'react-btn') {
    if (entry.reaction) {
      // Tocar de nuevo quita tu reacción
      learnFrom(entry, entry.reaction, true);
      entry.reaction = null;
      refreshCounts(entry, el);
    } else {
      const picker = btn.nextElementSibling;
      closeMenus(picker);
      picker.hidden = !picker.hidden;
      btn.setAttribute('aria-expanded', String(!picker.hidden));
    }
  }
  if (action === 'react') {
    if (entry.reaction) learnFrom(entry, entry.reaction, true);
    entry.reaction = btn.dataset.r;
    closeMenus();
    refreshCounts(entry, el);
    learnFrom(entry, entry.reaction);
  }
  if (action === 'repost') {
    entry.reposted = !entry.reposted;
    refreshCounts(entry, el);
    learnFrom(entry, 'repost', !entry.reposted);
  }
  if (action === 'reply') {
    const form = el.querySelector('.composer');
    form.hidden = !form.hidden;
    if (!form.hidden) form.querySelector('textarea').focus();
  }
  if (action === 'reply-cancel') el.querySelector('.composer').hidden = true;
  if (action === 'menu') {
    const menu = btn.nextElementSibling;
    closeMenus(menu);
    menu.hidden = !menu.hidden;
    // Cerca del borde inferior, el menú se abre hacia arriba
    menu.classList.toggle('up', btn.getBoundingClientRect().bottom > window.innerHeight - 200);
    btn.setAttribute('aria-expanded', String(!menu.hidden));
  }
  if (action === 'why') {
    closeMenus();
    const box = el.querySelector('.why-box');
    box.textContent = whyText(entry);
    box.hidden = !box.hidden;
  }
  if (action === 'less') {
    if (entry.reaction) algo.engine.feedback(entry.post, entry.reaction, true);
    if (entry.reposted) algo.engine.feedback(entry.post, 'repost', true);
    algo.engine.feedback(entry.post, 'less');
    entry.judged = true;
    el.classList.add('dismissed');
    el.innerHTML = `Listo. Verás menos publicaciones de <b>${CAT_BY_ID[entry.post.cat].name}</b>.`;
    updateBubbles();
  }
});

document.addEventListener('submit', ev => {
  const form = ev.target.closest('.composer');
  if (!form) return;
  ev.preventDefault();
  const el = form.closest('.post');
  const entry = entries.get(Number(el.dataset.key));
  const area = form.querySelector('textarea');
  const text = area.value.trim();
  if (!entry || !text) { area.focus(); return; }
  entry.comments.push(text);
  el.querySelector('.replies').insertAdjacentHTML('beforeend', commentHTML(text));
  area.value = '';
  form.hidden = true;
  refreshCounts(entry, el);
  learnFrom(entry, 'comment');
});

document.addEventListener('keydown', ev => {
  if (ev.key === 'Escape') closeMenus();
  // Ctrl/Cmd + Enter envía la respuesta
  if (ev.key === 'Enter' && (ev.ctrlKey || ev.metaKey) && ev.target.closest('.composer')) {
    ev.target.closest('.composer').requestSubmit();
  }
});

/* ---------- medidores y gráficos ---------- */

function meterHTML(b, probs) {
  const s = bubbleState(b, probs);
  return `
    <div class="${s.cls}">
      <div class="meter-top">
        <span class="meter-num">${pct(b)}</span>
        <span class="meter-state">${s.text}</span>
      </div>
      <div class="meter-track"><span class="meter-fill" style="width:${Math.max(2, b * 100)}%"></span></div>
    </div>
    <div class="meter-scale"><span>Variado</span><span>Cámara de eco</span></div>`;
}

function barsHTML(values, limit = CATEGORIES.length) {
  return '<div class="bars">' + CATEGORIES
    .map(c => ({ c, v: values[c.id] }))
    .sort((a, b) => b.v - a.v)
    .slice(0, limit)
    .map(({ c, v }) => `
      <div class="bar" style="--cat:${c.color}">
        <span class="bar-name">${c.name}</span>
        <span class="bar-track"><span class="bar-fill" style="width:${Math.max(1, v * 100)}%"></span></span>
        <span class="bar-val">${(v * 100).toFixed(v < 0.1 ? 1 : 0)}%</span>
      </div>`).join('') + '</div>';
}

function sparkHTML(history) {
  if (history.length < 2) return '<p class="muted">La curva aparecerá cuando empieces a interactuar.</p>';
  const W = 300, H = 64;
  const pts = history.map((v, i) => [(i / (history.length - 1)) * W, H - v * H]);
  const line = pts.map(p => p.join(',')).join(' ');
  return `
    <svg class="spark" viewBox="0 0 ${W} ${H}" preserveAspectRatio="none" role="img" aria-label="Evolución del nivel de burbuja">
      <line x1="0" y1="0" x2="${W}" y2="0" class="spark-grid"/>
      <line x1="0" y1="${H / 2}" x2="${W}" y2="${H / 2}" class="spark-grid"/>
      <line x1="0" y1="${H}" x2="${W}" y2="${H}" class="spark-grid"/>
      <polygon points="0,${H} ${line} ${W},${H}" class="spark-area"/>
      <polyline points="${line}" class="spark-line"/>
    </svg>
    <div class="spark-axis"><span>Antes de interactuar</span><span>Ahora</span></div>`;
}

function bubbleBlockHTML(e, full) {
  const exp = e.exposure();
  const gone = CATEGORIES.filter(c => exp[c.id] < 0.03);
  return `
    <div class="bubble-block">
      <div>${meterHTML(e.bubble(), exp)}</div>
      <div class="stats">
        <div class="stat"><b>${e.steps}</b><span>vistas</span></div>
        <div class="stat"><b>${e.interactions}</b><span>interacciones</span></div>
        <div class="stat"><b>${e.passes}</b><span>ignoradas</span></div>
        <div class="stat"><b>${pct(e.epsilon())}</b><span>curiosidad</span></div>
      </div>
      <div class="group">
        <span class="section-label">Evolución de tu burbuja</span>
        ${sparkHTML(e.history)}
      </div>
      <div class="group">
        <span class="section-label">Lo que el algoritmo cree de ti</span>
        <p class="muted">Probabilidad de que tu próxima publicación sea de cada tema</p>
        ${barsHTML(exp, full ? CATEGORIES.length : 6)}
      </div>
      <div class="group">
        <span class="section-label">Temas que desaparecieron de tu feed</span>
        ${gone.length
          ? `<div class="chips">${gone.map(c => `<span class="chip gone" style="--cat:${c.color}">${c.name}</span>`).join('')}</div>
             <p class="muted">Siguen en la plataforma, pero tienen menos de 3 % de probabilidad de llegarte.</p>`
          : '<p class="muted">Por ahora ves un poco de todo.</p>'}
      </div>
    </div>`;
}

/* ---------- feed algorítmico ---------- */

const algo = { engine: new Engine() };
const feedEl = $('#feed');
const sentinel = $('#feed-sentinel');

function appendPosts(n) {
  const html = [];
  for (let i = 0; i < n; i++) {
    const { post, reason } = algo.engine.next();
    html.push(postHTML(makeEntry(post, reason, true)));
  }
  feedEl.insertAdjacentHTML('beforeend', html.join(''));
  feedEl.querySelectorAll('.post:not([data-observed])').forEach(el => {
    el.dataset.observed = '1';
    passObserver.observe(el);
  });
  updateBubbles();
}

function fillFeed() {
  if (currentView !== 'inicio') return;
  let guard = 0;
  while (sentinel.getBoundingClientRect().top < window.innerHeight + 250 && guard++ < 10) appendPosts(3);
}

// Vuelve a armar el feed desde arriba con lo que el algoritmo ya aprendió (no lo reinicia)
function refreshFeed() {
  passObserver.disconnect();
  feedEl.querySelectorAll('.post').forEach(el => entries.delete(Number(el.dataset.key)));
  feedEl.innerHTML = '';
  scrollMemory.inicio = 0;
}

// Cuando una publicación entra en pantalla cuenta como vista. Si luego sale por arriba
// sin interacción, cuenta como "pasar de largo".
const passObserver = new IntersectionObserver(items => {
  if (currentView !== 'inicio' || introOpen) return;
  items.forEach(it => {
    const entry = entries.get(Number(it.target.dataset.key));
    if (!entry) return;
    if (it.isIntersecting) {
      if (!entry.seen) { entry.seen = true; algo.engine.markSeen(entry.post); updateBubbles(); }
      return;
    }
    if (!entry.seen || entry.judged || it.boundingClientRect.bottom > 80) return;
    entry.judged = true;
    algo.engine.feedback(entry.post, 'pass');
    updateBubbles();
  });
});
new IntersectionObserver(items => { if (items[0].isIntersecting) fillFeed(); }, { rootMargin: '250px' }).observe(sentinel);
window.addEventListener('scroll', fillFeed, { passive: true });

function resetFeed() {
  algo.engine.reset();
  feedEl.querySelectorAll('.post').forEach(el => entries.delete(Number(el.dataset.key)));
  feedEl.innerHTML = '';
  updateBubbles();
}

function simulate10() {
  const e = algo.engine;
  const target = e.interactions ? e.topCat() : pick(CATEGORIES).id;
  const html = [];
  for (let i = 0; i < 10; i++) {
    const { post, reason } = e.next();
    const entry = makeEntry(post, reason, true);
    entry.reaction = post.cat === target ? 'like' : null;
    entry.judged = entry.seen = true;
    e.markSeen(post);
    e.feedback(post, entry.reaction ? 'like' : 'pass');
    html.push(postHTML(entry));
  }
  feedEl.insertAdjacentHTML('beforeend', html.join(''));
  updateBubbles();
}

// Burbuja del Modo Hayek: sale de tus ajustes, no de lo que el algoritmo deduce
function hayekBlockHTML() {
  const probs = hayek.probs;
  if (!probs) return '<p class="muted">Tu feed está vacío. Sube algún tema en Modo Hayek y aquí verás tu burbuja.</p>';
  const gone = CATEGORIES.filter(c => probs[c.id] < 0.03);
  return `
    <div class="bubble-block">
      <div>${meterHTML(concentration(probs), probs)}</div>
      <div class="group">
        <span class="section-label">Lo que tú elegiste ver</span>
        <p class="muted">Probabilidad de cada tema según tus ajustes</p>
        ${barsHTML(probs, 6)}
      </div>
      <div class="group">
        <span class="section-label">Temas que dejaste fuera</span>
        ${gone.length
          ? `<div class="chips">${gone.map(c => `<span class="chip gone" style="--cat:${c.color}">${c.name}</span>`).join('')}</div>
             <p class="muted">Fue tu decisión: súbelos cuando quieras o aumenta la dosis de sorpresa.</p>`
          : '<p class="muted">Ningún tema quedó fuera.</p>'}
      </div>
    </div>`;
}

function updateBubbles() {
  const e = algo.engine;
  const inHayek = currentView === 'hayek';
  $('#rail-title').textContent = inHayek ? 'Tu burbuja en Modo Hayek' : 'Tu burbuja';
  $('#rail-link').hidden = inHayek;
  $('#bubble-rail').innerHTML = inHayek ? hayekBlockHTML() : bubbleBlockHTML(e, false);
  if (currentView === 'burbuja') $('#bubble-full').innerHTML = bubbleBlockHTML(e, true);

  const probs = inHayek ? hayek.probs : e.exposure();
  const b = probs ? concentration(probs) : 0;
  const s = probs ? bubbleState(b, probs) : bubbleState(0);
  const pill = $('#bubble-pill');
  pill.className = 'bubble-pill ' + s.cls;
  pill.innerHTML = `<i></i>Burbuja ${pct(b)}`;
}

/* ---------- comparar: dos usuarios ---------- */

const USERS = [
  { name: 'Ana', color: '#c2255c', prefs: ['prog', 'medio', 'arte'] },
  { name: 'Juan', color: '#1971c2', prefs: ['cons', 'econ', 'dep'] },
];
const duo = { engines: [new Engine(), new Engine()], timer: null };
const DUO_STEPS = 40;

function duoStep() {
  duo.engines.forEach((e, i) => {
    const { post } = e.next();
    e.markSeen(post);
    // Persona simulada: casi siempre interactúa con lo suyo y, de vez en cuando, con algo distinto
    const likes = USERS[i].prefs.includes(post.cat) ? Math.random() < 0.85 : Math.random() < 0.08;
    e.feedback(post, likes ? 'like' : 'pass');
  });
}

function duoRender() {
  const [ea, eb] = duo.engines;
  USERS.forEach((u, i) => {
    const e = duo.engines[i];
    const b = e.bubble();
    const s = bubbleState(b, e.exposure());
    $(`#duo-${i}`).innerHTML = `
      <div class="person">
        <div class="avatar" style="--av:${u.color}">${u.name[0]}</div>
        <div><h3>${u.name}</h3><p>Le interesa en realidad:</p></div>
      </div>
      <div class="chips">${u.prefs.map(id => `<span class="chip" style="--cat:${CAT_BY_ID[id].color}">${CAT_BY_ID[id].name}</span>`).join('')}</div>
      <div class="mini-meter ${s.cls}"><b>${pct(b)}</b><span>${s.text}</span></div>
      <div class="group">
        <span class="section-label">Lo que la plataforma le muestra</span>
        ${barsHTML(e.exposure(), 4)}
      </div>
      <div>
        <span class="section-label">Su feed ahora</span>
        <div class="mini-feed">
          ${e.shown.length
            ? e.shown.slice(-4).reverse().map(p => `
                <div class="mini-post">
                  <span class="topic" style="--cat:${CAT_BY_ID[p.cat].color}">${CAT_BY_ID[p.cat].name}</span>
                  <p>${esc(p.text)}</p>
                </div>`).join('')
            : '<p class="muted" style="padding-top:8px">Todavía no ha usado la plataforma.</p>'}
        </div>
      </div>`;
  });

  const ea_ = ea.exposure(), eb_ = eb.exposure();
  const ov = CATEGORIES.reduce((s, c) => s + Math.min(ea_[c.id], eb_[c.id]), 0);
  const s = ov > 0.6 ? 'ok' : ov > 0.3 ? 'warn' : 'bad';
  const done = ea.steps >= DUO_STEPS;
  $('#duo-overlap').innerHTML = `
    <div class="overlap-row ${s}">
      <span class="overlap-num">${pct(ov)}</span>
      <span class="overlap-label">de coincidencia entre lo que ven · ${ea.steps} de ${DUO_STEPS} interacciones</span>
    </div>
    <div class="meter-track ${s}"><span class="meter-fill" style="width:${Math.max(2, ov * 100)}%"></span></div>
    ${done ? `<p class="overlap-verdict">La misma plataforma y los mismos ${POSTS.length} contenidos, pero cada uno termina viendo un mundo distinto.</p>` : ''}`;
}

function duoRun() {
  if (duo.timer) return;
  if (duo.engines[0].steps >= DUO_STEPS) duo.engines.forEach(e => e.reset());
  $('#duo-run').disabled = true;
  duo.timer = setInterval(() => {
    duoStep();
    duoRender();
    if (duo.engines[0].steps >= DUO_STEPS) {
      clearInterval(duo.timer);
      duo.timer = null;
      $('#duo-run').disabled = false;
    }
  }, 110);
}

function duoReset() {
  clearInterval(duo.timer);
  duo.timer = null;
  $('#duo-run').disabled = false;
  duo.engines.forEach(e => e.reset());
  duoRender();
}

/* ---------- modo Hayek ---------- */

const HAYEK_SURPRISE = 0;
const hayek = { values: {}, surprise: HAYEK_SURPRISE };
CATEGORIES.forEach(c => { hayek.values[c.id] = 0; });

function hayekReset() {
  CATEGORIES.forEach(c => { hayek.values[c.id] = 0; });
  hayek.surprise = HAYEK_SURPRISE;
  hayekSliders();
  hayekGenerate();
}

function hayekSliders() {
  $('#hayek-sliders').innerHTML = CATEGORIES.map(c => `
    <label class="slider-row" style="--cat:${c.color}" for="sl-${c.id}">
      <span class="slider-name"><i></i>${c.name}</span>
      <input id="sl-${c.id}" type="range" min="0" max="10" step="1" value="${hayek.values[c.id]}" data-cat="${c.id}">
      <output>${hayek.values[c.id]}</output>
    </label>`).join('');
  $('#hayek-surprise').value = hayek.surprise;
  $('#hayek-surprise-out').textContent = hayek.surprise + '%';
}

function hayekGenerate() {
  const v = hayek.values;
  const total = CATEGORIES.reduce((s, c) => s + v[c.id], 0);
  const feed = $('#hayek-feed');
  feed.querySelectorAll('.post').forEach(el => entries.delete(Number(el.dataset.key)));

  // Todo en 0: todavía no has dicho qué quieres ver
  if (total === 0) {
    feed.innerHTML = '<p class="empty">Tu feed está vacío. Sube los temas que quieras ver y aparecerán aquí.</p>';
    $('#hayek-summary').innerHTML = '<p class="muted">Aquí el algoritmo no adivina nada. Mueve al menos un control para empezar.</p>';
    hayek.probs = null;
    updateBubbles();
    return;
  }

  const used = new Set();
  const list = [];
  for (let i = 0; i < 8; i++) {
    let cat, reason;
    if (Math.random() < hayek.surprise / 100) {
      // La sorpresa favorece justo los temas que tienes más bajos
      cat = weightedPick(CATEGORIES.map(c => [c.id, 11 - v[c.id]]));
      reason = { icon: 'gift', cls: 'explore', text: `Sorpresa que tú pediste (${hayek.surprise}%)` };
    } else {
      // Proporcional y sin amplificar: lo que tú dices, tal cual
      cat = weightedPick(CATEGORIES.map(c => [c.id, v[c.id]]));
      reason = { icon: 'slider', text: `Porque pusiste ${CAT_BY_ID[cat].name} en ${v[cat]} de 10` };
    }
    const options = POSTS.filter(p => p.cat === cat && !used.has(p.id));
    const post = pick(options.length ? options : POSTS.filter(p => p.cat === cat));
    used.add(post.id);
    list.push(makeEntry(post, reason, false));
  }
  feed.innerHTML = list.map(postHTML).join('');

  // Misma medida que en Inicio: qué tan concentradas están las probabilidades de tu feed
  const sp = hayek.surprise / 100;
  const inv = CATEGORIES.reduce((s, c) => s + (11 - v[c.id]), 0);
  const probs = {};
  CATEGORIES.forEach(c => {
    probs[c.id] = (1 - sp) * v[c.id] / total + sp * (11 - v[c.id]) / inv;
  });
  const b = concentration(probs);
  const s = bubbleState(b, probs);
  const surprises = list.filter(e => e.reason.icon === 'gift').length;
  $('#hayek-summary').innerHTML = `
    <div class="mini-meter ${s.cls}"><b>${pct(b)}</b><span>${s.text}</span></div>
    <div class="stat"><b>${list.length - surprises}</b><span>por tus ajustes</span></div>
    <div class="stat"><b>${surprises}</b><span>sorpresas</span></div>
    <div class="stat"><b>0</b><span>decididas por el algoritmo</span></div>`;
  hayek.probs = probs;
  updateBubbles();
}

function showSub(name) {
  document.querySelectorAll('.subtab').forEach(t => t.setAttribute('aria-selected', t.dataset.sub === name));
  document.querySelectorAll('.sub').forEach(s => { s.hidden = s.dataset.subview !== name; });
}

/* ---------- navegación ---------- */

const TITLES = { inicio: 'Para ti', burbuja: 'Tu burbuja', comparar: 'Comparar', hayek: 'Modo Hayek' };
const scrollMemory = {};
let currentView = null;

function showView(name) {
  if (!TITLES[name]) name = 'inicio';
  if (currentView) scrollMemory[currentView] = window.scrollY;
  currentView = name;
  closeMenus();
  document.querySelectorAll('.view').forEach(v => { v.hidden = v.dataset.view !== name; });
  document.querySelectorAll('[data-nav]').forEach(a => a.classList.toggle('active', a.dataset.nav === name));
  $('#view-title').textContent = TITLES[name];
  window.scrollTo(0, scrollMemory[name] || 0);
  updateBubbles();
  if (name === 'inicio') fillFeed();
}

window.addEventListener('hashchange', () => showView(location.hash.slice(1)));
document.querySelectorAll('[data-nav]').forEach(a => a.addEventListener('click', () => {
  if (location.hash.slice(1) === a.dataset.nav) showView(a.dataset.nav);
}));
// Tocar Inicio (o el logo) refresca el feed con las recomendaciones actualizadas
document.querySelectorAll('a[href="#inicio"]').forEach(a => a.addEventListener('click', () => {
  refreshFeed();
  if (currentView === 'inicio') { window.scrollTo(0, 0); fillFeed(); }
}));

$('#onboard-close').addEventListener('click', () => { $('#onboard').hidden = true; });
$('#btn-reset').addEventListener('click', () => { resetFeed(); location.hash = 'inicio'; });
$('#btn-auto').addEventListener('click', simulate10);
$('#duo-run').addEventListener('click', duoRun);
$('#duo-reset').addEventListener('click', duoReset);
document.querySelectorAll('.subtab').forEach(t => t.addEventListener('click', () => showSub(t.dataset.sub)));
document.querySelectorAll('[data-goto-sub]').forEach(b => b.addEventListener('click', () => { showSub(b.dataset.gotoSub); window.scrollTo(0, 0); }));

$('#hayek-sliders').addEventListener('input', ev => {
  const cat = ev.target.dataset.cat;
  if (!cat) return;
  hayek.values[cat] = Number(ev.target.value);
  ev.target.nextElementSibling.textContent = ev.target.value;
  hayekGenerate();
});
$('#hayek-surprise').addEventListener('input', ev => {
  hayek.surprise = Number(ev.target.value);
  $('#hayek-surprise-out').textContent = hayek.surprise + '%';
  hayekGenerate();
});
$('#hayek-new').addEventListener('click', hayekGenerate);
$('#hayek-reset').addEventListener('click', hayekReset);

/* ---------- introducción ---------- */

// Los 12 temas girando en dos órbitas alrededor de "ti"
(function buildOrbit() {
  const rings = [CATEGORIES.slice(0, 8), CATEGORIES.slice(8)];
  $('#intro-orbit').insertAdjacentHTML('afterbegin', rings.map((cats, r) => `
    <div class="orbit-ring ${r ? 'inner' : ''}">
      ${cats.map((c, i) => `<span class="orbit-arm" style="--a:${(360 / cats.length) * i + r * 20}deg"><span class="orbit-dot" style="--cat:${c.color}"></span></span>`).join('')}
    </div>`).join(''));
})();

let introOpen = true;
document.body.classList.add('intro-open');

function closeIntro() {
  if (!introOpen) return;
  introOpen = false;
  const intro = $('#intro');
  intro.classList.add('leaving');
  document.body.classList.remove('intro-open');
  setTimeout(() => {
    intro.hidden = true;
    // Las publicaciones que ya estaban en pantalla detrás de la intro cuentan como vistas ahora
    if (currentView === 'inicio') {
      feedEl.querySelectorAll('.post').forEach(el => {
        const r = el.getBoundingClientRect();
        const entry = entries.get(Number(el.dataset.key));
        if (entry && !entry.seen && r.top < window.innerHeight && r.bottom > 0) {
          entry.seen = true;
          algo.engine.markSeen(entry.post);
        }
      });
      updateBubbles();
    }
  }, 450);
}
$('#intro-start').addEventListener('click', closeIntro);
$('#intro-start').focus();

/* ---------- arranque ---------- */

showView(location.hash.slice(1) || 'inicio');
updateBubbles();
duoRender();
hayekSliders();
hayekGenerate();

/* ---------- modo demostración (pantalla de exhibición) ---------- */
// Con ?demo en la dirección, la app se usa sola en bucle y avisa cada paso a la
// página que la contiene (kiosco.html) para mostrar subtítulos.

if (new URLSearchParams(location.search).has('demo')) startDemo();

function startDemo() {
  introOpen = false;
  $('#intro').hidden = true;
  document.body.classList.remove('intro-open');
  document.body.classList.add('demo');
  $('#onboard').hidden = true;

  const sleep = ms => new Promise(r => setTimeout(r, ms));
  const finger = document.createElement('span');
  finger.className = 'demo-tap';
  document.body.appendChild(finger);

  const COMMENTS = ['¡No sabía esto! 👏', 'Qué buen dato', 'Esto hay que compartirlo', 'Me encanta este tema'];
  const REACTS = ['like', 'love', 'wow', 'haha'];

  function report(step) {
    const exp = algo.engine.exposure();
    const b = algo.engine.bubble();
    const s = bubbleState(b, exp);
    window.parent.postMessage({ type: 'feed-demo', step, bubble: b, label: s.text, cls: s.cls }, '*');
  }

  async function tap(el) {
    const r = el.getBoundingClientRect();
    finger.style.left = r.left + r.width / 2 + 'px';
    finger.style.top = r.top + r.height / 2 + 'px';
    finger.classList.remove('go');
    void finger.offsetWidth;
    finger.classList.add('go');
    await sleep(280);
    el.click();
  }

  async function scrollToPost(el) {
    window.scrollTo({ top: window.scrollY + el.getBoundingClientRect().top - 70, behavior: 'smooth' });
    await sleep(1000);
    fillFeed();
  }

  async function typeInto(area, text) {
    area.focus();
    for (const ch of text) { area.value += ch; await sleep(55); }
  }

  async function round() {
    resetFeed();
    if (currentView !== 'inicio') location.hash = 'inicio';
    await sleep(100);
    showView('inicio');
    window.scrollTo(0, 0);
    fillFeed();
    report('Todavía no sabe nada de ti. Pero está a punto de empezar a adivinarlo.');
    await sleep(2600);

    let target = null, done = 0, i = 0;
    while (done < 4 && i < 45) {
      fillFeed();
      const el = feedEl.querySelectorAll('.post:not(.dismissed)')[i++];
      if (!el) { await sleep(300); continue; }
      await scrollToPost(el);
      const entry = entries.get(Number(el.dataset.key));
      if (!entry) continue;
      const cat = CAT_BY_ID[entry.post.cat].name;
      // A este usuario le interesa el tema de la segunda publicación que ve
      if (!target && i >= 2) target = entry.post.cat;

      if (entry.post.cat !== target) {
        report('Ignorarlo también es una señal. El algoritmo la apunta igual que un like.');
        await sleep(900);
        continue;
      }

      done++;
      if (done === 2) {
        await tap(el.querySelector('[data-action="reply"]'));
        await sleep(400);
        await typeInto(el.querySelector('textarea'), pick(COMMENTS));
        await sleep(300);
        await tap(el.querySelector('.composer [type="submit"]'));
        report('Un comentario pesa más que un like: dice que te detuviste a pensar.');
      } else if (done === 3) {
        await tap(el.querySelector('[data-action="repost"]'));
        report('Compartir es la señal más fuerte. Acabas de decirle al algoritmo "esto me define".');
      } else {
        await tap(el.querySelector('[data-action="react-btn"]'));
        await sleep(800);
        const r = pick(REACTS);
        await tap(el.querySelector(`[data-r="${r}"]`));
        report(r === 'angry'
          ? 'Hasta enojarte cuenta como interés. El algoritmo no distingue emociones.'
          : 'Cada reacción enseña algo nuevo. El algoritmo nunca pregunta por qué.');
      }
      await sleep(1800);
    }

    // Refrescar: el feed nuevo ya está hecho a su medida
    report('El feed se arma de nuevo… y ya no es neutral.');
    await sleep(1200);
    await tap(document.querySelector('.tabbar a[data-nav="inicio"]'));
    await sleep(900);
    if (currentView !== 'inicio') showView('inicio');
    const cat = target ? CAT_BY_ID[target].name : '';
    report(`Con apenas 4 clics, su feed ya gira casi todo alrededor de ${cat}.`);
    await sleep(1200);
    for (let k = 0; k < 4; k++) {
      fillFeed();
      const el = feedEl.querySelectorAll('.post')[k];
      if (el) await scrollToPost(el);
      await sleep(700);
    }

    // Mostrar la burbuja
    await tap(document.querySelector('.tabbar a[data-nav="burbuja"]'));
    await sleep(300);
    if (currentView !== 'burbuja') showView('burbuja');
    window.scrollTo(0, 0);
    report('Así de rápido decide un algoritmo qué es interesante… y qué no.');
    await sleep(3500);
    window.scrollTo({ top: 420, behavior: 'smooth' });
    report('Los otros 11 temas siguen en la plataforma. Para él, casi no existen.');
    await sleep(4000);
    report('¿Tu propia burbuja se vería igual? Solo hay una forma de descubrirlo.');
    await sleep(3500);
  }

  (async () => { for (;;) await round(); })();
}
