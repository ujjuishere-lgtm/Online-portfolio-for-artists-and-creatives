/* ======== storage.js ======== */
/* ==========================================================
   storage.js  —  DATA PERSISTENCE LAYER
   Everything the site remembers lives here (localStorage):
     • artworks      (seeded with demo data on first visit)
     • inquiries     (commission requests from the public form)
   Every other file talks to data ONLY through the Store object.
   ========================================================== */
const Store = (() => {
  const KEYS = {
    art: 'aw_artworks',
    inq: 'aw_inquiries',
    seeded: 'aw_seeded',
    theme: 'aw_theme',
  };

  const CATEGORIES = ['Painting', 'Digital Art', 'Photography', 'Illustration', 'Sculpture'];

  // Demo artworks (original generated images in /assets/art)
  const SEED = [
    { id: 'a1', title: 'Monsoon Reverie', category: 'Painting', year: 2025, medium: 'Oil on canvas', dimensions: '24 × 30 in', description: 'Layered strokes of indigo and rose recall the first heavy rain after a long summer. Painted over three weeks in the studio, wet-on-wet.', image: 'assets/art/monsoon-reverie.svg', w: 800, h: 1000, featured: true },
    { id: 'a2', title: 'Golden Hour Drift', category: 'Painting', year: 2025, medium: 'Acrylic on canvas', dimensions: '30 × 30 in', description: 'Molten oranges and ember reds sweep across the canvas like the last light on a river.', image: 'assets/art/golden-hour-drift.svg', w: 800, h: 800, featured: false },
    { id: 'a3', title: 'Indigo Memory', category: 'Painting', year: 2024, medium: 'Watercolour on paper', dimensions: '18 × 14 in', description: 'A quiet study in violet washes about remembering a place you can no longer visit.', image: 'assets/art/indigo-memory.svg', w: 800, h: 600, featured: false },
    { id: 'a4', title: 'Neon Bloom', category: 'Digital Art', year: 2026, medium: 'Procreate, digital painting', dimensions: '4000 × 5000 px', description: 'Geometric petals unfolding in orbit — a digital piece built from hand-drawn vector shapes and glowing light.', image: 'assets/art/neon-bloom.svg', w: 800, h: 1000, featured: false },
    { id: 'a5', title: 'Circuit Dreams', category: 'Digital Art', year: 2026, medium: 'Vector, light effects', dimensions: '6000 × 4500 px', description: 'What does a machine dream about? Overlapping signals and prisms in electric teal and gold.', image: 'assets/art/circuit-dreams.svg', w: 800, h: 600, featured: false },
    { id: 'a6', title: 'Orbit No. 7', category: 'Digital Art', year: 2025, medium: 'Generative + hand finish', dimensions: '5000 × 5000 px', description: 'Seventh in a series exploring rhythm and repetition through concentric rings.', image: 'assets/art/orbit-no-7.svg', w: 800, h: 800, featured: true },
    { id: 'a7', title: 'Himalayan Dawn', category: 'Photography', year: 2024, medium: 'Digital photograph, fine-art print', dimensions: '36 × 24 in', description: 'Soft peach light spills over layered ridgelines minutes before sunrise.', image: 'assets/art/himalayan-dawn.svg', w: 800, h: 600, featured: false },
    { id: 'a8', title: 'Misty Ridges', category: 'Photography', year: 2023, medium: 'Digital photograph, giclée print', dimensions: '24 × 30 in', description: 'Cold blue mist settling between mountain folds on a windless morning.', image: 'assets/art/misty-ridges.svg', w: 800, h: 1000, featured: false },
    { id: 'a9', title: 'Garden of Quiet Hours', category: 'Illustration', year: 2025, medium: 'Ink and gouache', dimensions: '16 × 20 in', description: 'A hand-inked garden under a peach moon, made for a children\'s book on patience.', image: 'assets/art/garden-of-quiet-hours.svg', w: 800, h: 1000, featured: false },
    { id: 'a10', title: 'Moonlit Fern', category: 'Illustration', year: 2024, medium: 'Ink, digital colour', dimensions: '12 × 12 in', description: 'Fern fronds glowing beneath a pale moon — a nocturne in green and midnight blue.', image: 'assets/art/moonlit-fern.svg', w: 800, h: 800, featured: false },
    { id: 'a11', title: 'Stacked Moons', category: 'Sculpture', year: 2025, medium: 'Glazed stoneware', dimensions: '32 in tall', description: 'Four balanced forms with a copper ring; each stone-like piece was thrown and glazed by hand.', image: 'assets/art/stacked-moons.svg', w: 800, h: 1000, featured: false },
    { id: 'a12', title: 'Still Ascent', category: 'Sculpture', year: 2023, medium: 'Patinated bronze', dimensions: '20 in tall', description: 'A small bronze about balance — three forms rising, held in place by a thin halo.', image: 'assets/art/still-ascent.svg', w: 800, h: 800, featured: false },
  ];

  /* ---------- low-level helpers (safe against private mode / full storage) ---------- */
  function read(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (e) {
      return fallback;
    }
  }

  function write(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return { ok: true };
    } catch (e) {
      // QuotaExceededError etc.
      return { ok: false, error: e };
    }
  }

  const uid = (p = 'id') => p + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);

  /* ---------- seeding ---------- */
  function seedIfNeeded() {
    if (read(KEYS.seeded, false)) return;
    const now = Date.now();
    // stagger createdAt so "Newest" sorting has a sensible order
    const data = SEED.map((a, i) => ({ ...a, createdAt: now - i * 86400000 }));
    write(KEYS.art, data);
    write(KEYS.seeded, true);
  }

  /* ---------- artworks ---------- */
  function getArtworks() {
    seedIfNeeded();
    return read(KEYS.art, []);
  }
  function saveArtworks(list) {
    return write(KEYS.art, list);
  }
  function addArtwork(art) {
    const list = getArtworks();
    const item = { ...art, id: uid('a'), createdAt: Date.now() };
    list.unshift(item);
    const res = saveArtworks(list);
    return { ...res, item };
  }
  function updateArtwork(id, patch) {
    const list = getArtworks();
    const i = list.findIndex((a) => a.id === id);
    if (i === -1) return { ok: false };
    list[i] = { ...list[i], ...patch };
    return saveArtworks(list);
  }
  function deleteArtwork(id) {
    return saveArtworks(getArtworks().filter((a) => a.id !== id));
  }
  function toggleFeatured(id) {
    const list = getArtworks();
    const a = list.find((x) => x.id === id);
    if (!a) return { ok: false };
    a.featured = !a.featured;
    return saveArtworks(list);
  }

  /* ---------- inquiries ---------- */
  function getInquiries() {
    return read(KEYS.inq, []);
  }
  function addInquiry(data) {
    const list = getInquiries();
    const item = { ...data, id: uid('q'), createdAt: Date.now(), read: false };
    list.unshift(item);
    const res = write(KEYS.inq, list);
    return { ...res, item };
  }
  function updateInquiry(id, patch) {
    const list = getInquiries().map((q) => (q.id === id ? { ...q, ...patch } : q));
    return write(KEYS.inq, list);
  }
  function deleteInquiry(id) {
    return write(KEYS.inq, getInquiries().filter((q) => q.id !== id));
  }

  /* ---------- maintenance ---------- */
  function resetDemo() {
    try {
      localStorage.removeItem(KEYS.art);
      localStorage.removeItem(KEYS.seeded);
      localStorage.removeItem(KEYS.inq);
    } catch (e) { /* ignore */ }
    seedIfNeeded();
  }
  function exportJSON() {
    return JSON.stringify({ artworks: getArtworks(), inquiries: getInquiries() }, null, 2);
  }

  /* ---------- theme ---------- */
  function getTheme() {
    try { return localStorage.getItem(KEYS.theme); } catch (e) { return null; }
  }
  function setTheme(t) {
    try { localStorage.setItem(KEYS.theme, t); } catch (e) { /* ignore */ }
  }

  return {
    KEYS, CATEGORIES,
    getArtworks, saveArtworks, addArtwork, updateArtwork, deleteArtwork, toggleFeatured,
    getInquiries, addInquiry, updateInquiry, deleteInquiry,
    resetDemo, exportJSON, getTheme, setTheme,
  };
})();


/* ======== common.js ======== */
/* ==========================================================
   common.js  —  SHARED UI HELPERS (used by both pages)
   escape(), toast(), theme toggle, navbar, scroll reveal,
   animated counters, and a reusable confirm dialog.
   ========================================================== */
const UI = (() => {
  /** Escape user-supplied text before putting it in innerHTML (prevents XSS). */
  const esc = (s) =>
    String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  /* ---------- toast notifications ---------- */
  function toast(message, type = 'info') {
    let box = document.getElementById('toasts');
    if (!box) {
      box = document.createElement('div');
      box.id = 'toasts';
      box.setAttribute('aria-live', 'polite');
      document.body.appendChild(box);
    }
    const t = document.createElement('div');
    t.className = 'toast toast-' + type;
    const icon = { success: '✓', error: '!', info: 'i' }[type] || 'i';
    t.innerHTML = `<span class="toast-ico" aria-hidden="true">${icon}</span><span>${esc(message)}</span>`;
    box.appendChild(t);
    requestAnimationFrame(() => t.classList.add('show'));
    setTimeout(() => {
      t.classList.remove('show');
      setTimeout(() => t.remove(), 400);
    }, 3800);
  }

  /* ---------- dark / light theme ---------- */
  function initTheme() {
    const btns = document.querySelectorAll('#themeToggle, #adminThemeToggle');
    const root = document.documentElement;
    const paint = () => {
      const dark = root.dataset.theme === 'dark';
      btns.forEach((btn) => {
        btn.textContent = dark ? '☀' : '☾';
        btn.setAttribute('aria-label', dark ? 'Switch to light mode' : 'Switch to dark mode');
        btn.setAttribute('aria-pressed', String(dark));
      });
    };
    paint();
    btns.forEach((btn) => {
      btn.addEventListener('click', () => {
        root.dataset.theme = root.dataset.theme === 'dark' ? 'light' : 'dark';
        Store.setTheme(root.dataset.theme);
        paint();
      });
    });
  }

  /* ---------- navbar: scroll state + mobile menu + active link ---------- */
  function initNav() {
    const nav = document.getElementById('nav');
    const burger = document.getElementById('burger');
    const menu = document.getElementById('menu');
    if (!nav) return;

    const onScroll = () => nav.classList.toggle('scrolled', window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });

    if (burger && menu) {
      const setOpen = (open) => {
        menu.classList.toggle('open', open);
        burger.setAttribute('aria-expanded', String(open));
        burger.textContent = open ? '×' : '☰';
        document.body.classList.toggle('menu-open', open);
      };
      burger.addEventListener('click', () => setOpen(!menu.classList.contains('open')));
      menu.addEventListener('click', (e) => { if (e.target.closest('a')) setOpen(false); });
      document.addEventListener('keydown', (e) => { if (e.key === 'Escape') setOpen(false); });
    }

    // highlight the nav link of the section currently in view
    const links = [...document.querySelectorAll('#menu a[href^="#"]')];
    const map = new Map(links.map((a) => [a.getAttribute('href').slice(1), a]));
    if ('IntersectionObserver' in window && map.size) {
      const io = new IntersectionObserver((entries) => {
        entries.forEach((en) => {
          if (en.isIntersecting) {
            links.forEach((l) => l.classList.remove('active'));
            const l = map.get(en.target.id);
            if (l) l.classList.add('active');
          }
        });
      }, { rootMargin: '-45% 0px -50% 0px' });
      map.forEach((_, id) => { const s = document.getElementById(id); if (s) io.observe(s); });
    }
  }

  /* ---------- fade-in on scroll ---------- */
  function initReveal() {
    const els = document.querySelectorAll('.reveal');
    if (!('IntersectionObserver' in window)) { els.forEach((e) => e.classList.add('in')); return; }
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
      });
    }, { threshold: 0.12 });
    els.forEach((e) => io.observe(e));
  }

  /* ---------- animated number counters ---------- */
  function animateCount(el, to) {
    const dur = 1400;
    const start = performance.now();
    const tick = (now) => {
      const p = Math.min(1, (now - start) / dur);
      el.textContent = Math.round(to * (1 - Math.pow(1 - p, 3)));
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }
  function initCounters() {
    const els = document.querySelectorAll('[data-count]');
    if (!('IntersectionObserver' in window)) { els.forEach((e) => (e.textContent = e.dataset.count)); return; }
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (en.isIntersecting) { animateCount(en.target, +en.target.dataset.count); io.unobserve(en.target); }
      });
    }, { threshold: 0.6 });
    els.forEach((e) => io.observe(e));
  }

  /* ---------- confirm dialog (returns a Promise<boolean>) ---------- */
  function confirmDialog({ title = 'Are you sure?', message = '', okText = 'Confirm', danger = false } = {}) {
    return new Promise((resolve) => {
      const prev = document.activeElement;
      const back = document.createElement('div');
      back.className = 'modal-backdrop';
      back.innerHTML = `
        <div class="modal" role="alertdialog" aria-modal="true" aria-labelledby="cdT" aria-describedby="cdM">
          <h3 id="cdT">${esc(title)}</h3>
          <p id="cdM">${esc(message)}</p>
          <div class="modal-actions">
            <button type="button" class="btn btn-ghost" data-act="no">Cancel</button>
            <button type="button" class="btn ${danger ? 'btn-danger' : 'btn-primary'}" data-act="yes">${esc(okText)}</button>
          </div>
        </div>`;
      document.body.appendChild(back);
      requestAnimationFrame(() => back.classList.add('show'));
      const done = (val) => {
        document.removeEventListener('keydown', onKey);
        back.classList.remove('show');
        setTimeout(() => back.remove(), 200);
        if (prev && prev.focus) prev.focus();
        resolve(val);
      };
      const onKey = (e) => { if (e.key === 'Escape') done(false); };
      document.addEventListener('keydown', onKey);
      back.addEventListener('click', (e) => {
        if (e.target === back) done(false);
        const b = e.target.closest('[data-act]');
        if (b) done(b.dataset.act === 'yes');
      });
      back.querySelector('[data-act="no"]').focus();
    });
  }

  function init() {
    initTheme();
    initNav();
    initReveal();
    initCounters();
  }

  return { esc, toast, init, initReveal, initCounters, confirmDialog };
})();


/* ======== lightbox.js ======== */
/* ==========================================================
   lightbox.js  —  FULL-SCREEN ARTWORK PREVIEW  (required feature)
   Lightbox.open(list, index)  shows list[index] and lets the
   visitor move through ONLY that list (e.g. the filtered artworks).
   Supports: buttons, ← → Esc keys, swipe, click outside, focus trap,
   scroll lock and a "3 / 12" counter.
   ========================================================== */
const Lightbox = (() => {
  let el, img, items = [], idx = 0, lastFocus = null, startX = 0;
  const q = (s) => el.querySelector(s);

  function build() {
    el = document.createElement('div');
    el.className = 'lightbox';
    el.hidden = true;
    el.setAttribute('role', 'dialog');
    el.setAttribute('aria-modal', 'true');
    el.setAttribute('aria-label', 'Artwork preview');
    el.innerHTML = `
      <button type="button" class="lb-close" aria-label="Close preview">×</button>
      <button type="button" class="lb-nav lb-prev" aria-label="Previous artwork">‹</button>
      <button type="button" class="lb-nav lb-next" aria-label="Next artwork">›</button>
      <div class="lb-body">
        <figure class="lb-stage"><img class="lb-img" alt="" /></figure>
        <aside class="lb-info">
          <span class="lb-count" aria-live="polite"></span>
          <span class="lb-cat"></span>
          <h3 class="lb-title"></h3>
          <p class="lb-desc"></p>
          <dl class="lb-meta">
            <div><dt>Medium</dt><dd class="lb-medium"></dd></div>
            <div><dt>Size</dt><dd class="lb-size"></dd></div>
            <div><dt>Year</dt><dd class="lb-year"></dd></div>
          </dl>
          <button type="button" class="btn btn-primary lb-commission">Commission something similar</button>
        </aside>
      </div>`;
    document.body.appendChild(el);
    img = q('.lb-img');

    q('.lb-close').addEventListener('click', close);
    q('.lb-prev').addEventListener('click', () => go(-1));
    q('.lb-next').addEventListener('click', () => go(1));
    q('.lb-commission').addEventListener('click', () => {
      const title = items[idx] && items[idx].title;
      close();
      if (window.Form) Form.prefill(title);
    });
    // click on the dark backdrop closes
    el.addEventListener('click', (e) => { if (e.target === el || e.target.classList.contains('lb-body') || e.target.classList.contains('lb-stage')) close(); });
    // swipe on touch devices
    el.addEventListener('touchstart', (e) => { startX = e.changedTouches[0].clientX; }, { passive: true });
    el.addEventListener('touchend', (e) => {
      const dx = e.changedTouches[0].clientX - startX;
      if (Math.abs(dx) > 50) go(dx < 0 ? 1 : -1);
    }, { passive: true });
    document.addEventListener('keydown', onKey);
  }

  function onKey(e) {
    if (!el || el.hidden) return;
    if (e.key === 'Escape') close();
    else if (e.key === 'ArrowLeft') go(-1);
    else if (e.key === 'ArrowRight') go(1);
    else if (e.key === 'Tab') trapFocus(e);
  }

  function trapFocus(e) {
    const f = [...el.querySelectorAll('button:not([disabled])')].filter((b) => b.offsetParent !== null);
    if (!f.length) return;
    const first = f[0], last = f[f.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  }

  function render() {
    const a = items[idx];
    if (!a) return;
    img.classList.add('loading');
    img.onload = () => img.classList.remove('loading');
    img.src = a.image;
    img.alt = `${a.title} — ${a.medium}`;
    q('.lb-title').textContent = a.title;
    q('.lb-cat').textContent = a.category;
    q('.lb-desc').textContent = a.description || '';
    q('.lb-medium').textContent = a.medium || '—';
    q('.lb-size').textContent = a.dimensions || '—';
    q('.lb-year').textContent = a.year || '—';
    q('.lb-count').textContent = `${idx + 1} / ${items.length}`;
    const many = items.length > 1;
    q('.lb-prev').hidden = !many;
    q('.lb-next').hidden = !many;
    // warm the cache for neighbours
    [1, -1].forEach((d) => {
      const n = items[(idx + d + items.length) % items.length];
      if (n) new Image().src = n.image;
    });
  }

  function go(d) {
    if (items.length < 2) return;
    idx = (idx + d + items.length) % items.length;
    render();
  }

  function open(list, index = 0) {
    if (!el) build();
    items = list.slice();
    idx = Math.max(0, Math.min(index, items.length - 1));
    lastFocus = document.activeElement;
    render();
    el.hidden = false;
    document.body.classList.add('no-scroll');
    requestAnimationFrame(() => el.classList.add('show'));
    q('.lb-close').focus();
  }

  function close() {
    if (!el || el.hidden) return;
    el.classList.remove('show');
    document.body.classList.remove('no-scroll');
    setTimeout(() => { el.hidden = true; }, 220);
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }

  return { open, close };
})();


/* ======== gallery.js ======== */
/* ==========================================================
   gallery.js  —  DYNAMIC GALLERY (DOM LOGIC)
   • renders artwork cards from Store data
   • category filter buttons (with live counts)
   • live search + sorting
   • opens the Lightbox using event delegation
   • hero "featured" piece, testimonials slider
   ========================================================== */
(() => {
  const grid = document.getElementById('galleryGrid');
  const filtersEl = document.getElementById('filters');
  const searchEl = document.getElementById('search');
  const sortEl = document.getElementById('sort');
  const countEl = document.getElementById('resultCount');
  const emptyEl = document.getElementById('empty');

  let all = [];          // every artwork
  let visible = [];      // artworks after filter + search + sort
  const state = { cat: 'All', q: '', sort: 'newest' };

  /* ---------- filtering / sorting ---------- */
  function applyFilters() {
    const q = state.q.trim().toLowerCase();
    visible = all.filter((a) => {
      const inCat = state.cat === 'All' || a.category === state.cat;
      const text = [a.title, a.category, a.medium, a.description].join(' ').toLowerCase();
      return inCat && (!q || text.includes(q));
    });
    visible.sort((a, b) => {
      if (state.sort === 'az') return a.title.localeCompare(b.title);
      if (state.sort === 'oldest') return a.createdAt - b.createdAt;
      return b.createdAt - a.createdAt;
    });
  }

  /* ---------- rendering ---------- */
  function renderFilters() {
    const cats = ['All', ...Store.CATEGORIES];
    filtersEl.innerHTML = cats.map((c) => {
      const n = c === 'All' ? all.length : all.filter((a) => a.category === c).length;
      const active = c === state.cat;
      return `<button type="button" class="chip${active ? ' active' : ''}" data-cat="${UI.esc(c)}" aria-pressed="${active}">${UI.esc(c)}<span class="count">${n}</span></button>`;
    }).join('');
  }

  function renderGrid() {
    applyFilters();
    grid.innerHTML = visible.map((a, i) => `
      <article class="card" role="button" tabindex="0" data-id="${UI.esc(a.id)}" aria-label="View ${UI.esc(a.title)}" style="--i:${Math.min(i, 12)}">
        <div class="card-img" style="aspect-ratio:${a.w || 4} / ${a.h || 5}">
          <img src="${UI.esc(a.image)}" alt="${UI.esc(a.title)} — ${UI.esc(a.medium)}" loading="lazy" />
          ${a.featured ? '<span class="badge">Featured</span>' : ''}
        </div>
        <div class="card-overlay">
          <span class="card-cat">${UI.esc(a.category)}</span>
          <h3>${UI.esc(a.title)}</h3>
          <p>${UI.esc(a.medium)} · ${UI.esc(a.year)}</p>
        </div>
      </article>`).join('');

    const n = visible.length;
    countEl.textContent = n === 0 ? '' : `Showing ${n} artwork${n === 1 ? '' : 's'}${state.cat !== 'All' ? ' in ' + state.cat : ''}`;
    emptyEl.hidden = n !== 0;
    grid.hidden = n === 0;
  }

  function renderHero() {
    const a = all.find((x) => x.featured) || all[0];
    const art = document.getElementById('heroArt');
    if (!a) { art.hidden = true; return; }
    art.hidden = false;
    const img = document.getElementById('heroImg');
    img.src = a.image;
    img.alt = `${a.title} — ${a.medium}`;
    document.getElementById('heroTitle').textContent = a.title;
    document.getElementById('heroMeta').textContent = `${a.medium} · ${a.year}`;
    document.getElementById('heroBtn').onclick = () => Lightbox.open([a], 0);
  }

  function renderStats() {
    const el = document.getElementById('statWorks');
    if (el) { el.dataset.count = all.length; }
  }

  function loadAndRender() {
    all = Store.getArtworks();
    renderFilters();
    renderGrid();
    renderHero();
    renderStats();
  }

  /* ---------- events (delegation: one listener for many cards) ---------- */
  filtersEl.addEventListener('click', (e) => {
    const b = e.target.closest('.chip');
    if (!b) return;
    state.cat = b.dataset.cat;
    renderFilters();
    renderGrid();
  });

  grid.addEventListener('click', (e) => {
    const card = e.target.closest('.card');
    if (card) openCard(card);
  });
  grid.addEventListener('keydown', (e) => {
    if ((e.key === 'Enter' || e.key === ' ') && e.target.classList.contains('card')) {
      e.preventDefault();
      openCard(e.target);
    }
  });
  function openCard(card) {
    const i = visible.findIndex((a) => a.id === card.dataset.id);
    if (i > -1) Lightbox.open(visible, i);
  }

  let t;
  searchEl.addEventListener('input', () => {
    clearTimeout(t);
    t = setTimeout(() => { state.q = searchEl.value; renderGrid(); }, 160); // debounce
  });
  sortEl.addEventListener('change', () => { state.sort = sortEl.value; renderGrid(); });
  document.getElementById('clearFilters').addEventListener('click', () => {
    state.cat = 'All'; state.q = ''; searchEl.value = '';
    renderFilters(); renderGrid();
  });

  // if the admin edits data in another tab, refresh automatically
  window.addEventListener('storage', (e) => { if (e.key === Store.KEYS.art) loadAndRender(); });

  /* ---------- testimonials slider ---------- */
  const TESTIMONIALS = [
    { q: 'Mira turned a vague memory of my grandmother\'s courtyard into a painting that makes my whole living room feel warm.', n: 'Neha Kapoor', r: 'Collector, Pune' },
    { q: 'Professional, communicative and wildly talented. The illustrations she made for our book cover were exactly the mood we needed.', n: 'Arjun Mehta', r: 'Indie author' },
    { q: 'The detail in her photography prints is unreal. Seeing them in full resolution is a different experience from Instagram.', n: 'Sara D\'Souza', r: 'Gallery curator' },
  ];
  const slides = document.getElementById('slides');
  const dots = document.getElementById('dots');
  let cur = 0, timer;

  slides.innerHTML = TESTIMONIALS.map((t, i) => `
    <blockquote class="slide${i === 0 ? ' active' : ''}" aria-hidden="${i !== 0}">
      <p>“${UI.esc(t.q)}”</p>
      <footer><b>${UI.esc(t.n)}</b><span>${UI.esc(t.r)}</span></footer>
    </blockquote>`).join('');
  dots.innerHTML = TESTIMONIALS.map((_, i) => `<button type="button" class="dot${i === 0 ? ' active' : ''}" data-i="${i}" aria-label="Show testimonial ${i + 1}"></button>`).join('');

  function showSlide(i) {
    cur = (i + TESTIMONIALS.length) % TESTIMONIALS.length;
    slides.querySelectorAll('.slide').forEach((s, k) => { s.classList.toggle('active', k === cur); s.setAttribute('aria-hidden', k !== cur); });
    dots.querySelectorAll('.dot').forEach((d, k) => d.classList.toggle('active', k === cur));
  }
  function autoplay() { clearInterval(timer); timer = setInterval(() => showSlide(cur + 1), 6000); }
  document.getElementById('prevT').addEventListener('click', () => { showSlide(cur - 1); autoplay(); });
  document.getElementById('nextT').addEventListener('click', () => { showSlide(cur + 1); autoplay(); });
  dots.addEventListener('click', (e) => { const d = e.target.closest('.dot'); if (d) { showSlide(+d.dataset.i); autoplay(); } });
  autoplay();

  loadAndRender();
})();


/* ======== form.js ======== */
/* ==========================================================
   form.js  —  COMMISSION / INQUIRY FORM WITH VALIDATION
   (required feature)
   • validates on blur and while typing (after first touch)
   • shows inline error messages + green/red field states
   • blocks submit until every rule passes
   • on success: saves to localStorage, shows toast + modal
   ========================================================== */
const Form = (() => {
  const form = document.getElementById('commissionForm');
  if (!form) return {};

  const $ = (id) => document.getElementById(id);
  // Web3Forms access key: emails from this form are delivered to the address registered with this key.
  const WEB3FORMS_KEY = '12afc97e-3720-4533-bcb1-a8128ded598c';
  const counter = $('counter');
  const modal = $('successModal');

  /* ---------- validation rules: each returns an error string, or '' if valid ---------- */
  const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[A-Za-z]{2,}$/;
  const NAME_RE = /^\p{L}[\p{L} .'-]{1,59}$/u;

  const todayStr = () => {
    const d = new Date();
    const p = (n) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
  };

  const rules = {
    name(v) {
      v = v.trim();
      if (!v) return 'Please enter your full name.';
      if (v.length < 2) return 'Name must be at least 2 characters.';
      if (!NAME_RE.test(v)) return 'Use letters only (spaces, . \' - allowed).';
      return '';
    },
    email(v) {
      v = v.trim();
      if (!v) return 'Email is required.';
      if (!EMAIL_RE.test(v)) return 'Enter a valid email, e.g. name@example.com';
      return '';
    },
    phone(v) {
      v = v.trim();
      if (!v) return ''; // optional
      if (!/^[+]?[\d\s\-()]+$/.test(v)) return 'Phone can contain digits, spaces, + - ( ) only.';
      const digits = v.replace(/\D/g, '');
      if (digits.length < 7 || digits.length > 15) return 'Phone must have 7–15 digits.';
      return '';
    },
    type(v) { return v ? '' : 'Please choose a commission type.'; },
    budget(v) { return v ? '' : 'Please choose a budget range.'; },
    deadline(v) {
      if (!v) return 'Pick a preferred deadline.';
      if (v < todayStr()) return 'Deadline cannot be in the past.';
      const max = new Date(); max.setFullYear(max.getFullYear() + 2);
      if (new Date(v) > max) return 'Please choose a date within the next 2 years.';
      return '';
    },
    message(v) {
      v = v.trim();
      if (!v) return 'Please describe your idea.';
      if (v.length < 20) return `Add a little more detail (${v.length}/20 characters minimum).`;
      return '';
    },
    terms(_v, el) { return el.checked ? '' : 'You must accept this to continue.'; },
  };

  const fields = Object.keys(rules).map((id) => $(id));
  const touched = new Set();

  function validate(el) {
    const err = rules[el.id](el.value, el);
    const wrap = el.closest('.field');
    const msg = wrap.querySelector('.error-msg');
    msg.textContent = err;
    wrap.classList.toggle('invalid', !!err);
    wrap.classList.toggle('valid', !err && (el.type === 'checkbox' ? el.checked : el.value.trim() !== ''));
    el.setAttribute('aria-invalid', err ? 'true' : 'false');
    if (err) {
      msg.id = el.id + '-err';
      el.setAttribute('aria-describedby', msg.id);
    }
    return !err;
  }

  fields.forEach((el) => {
    const evt = el.tagName === 'SELECT' || el.type === 'checkbox' || el.type === 'date' ? 'change' : 'input';
    el.addEventListener('blur', () => { touched.add(el.id); validate(el); });
    el.addEventListener(evt, () => { if (touched.has(el.id) || evt === 'change') { touched.add(el.id); validate(el); } });
  });

  // min date + live character counter
  $('deadline').min = todayStr();
  $('message').addEventListener('input', (e) => {
    const n = e.target.value.length;
    counter.textContent = `${n} / ${e.target.maxLength}`;
    counter.classList.toggle('warn', n > e.target.maxLength - 50);
  });

  /* ---------- submit ---------- */
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    let firstBad = null;
    fields.forEach((el) => {
      touched.add(el.id);
      if (!validate(el) && !firstBad) firstBad = el;
    });
    if (firstBad) {
      firstBad.focus();
      UI.toast('Please fix the highlighted fields.', 'error');
      return;
    }

    const data = {
      name: $('name').value.trim(),
      email: $('email').value.trim(),
      phone: $('phone').value.trim(),
      type: $('type').value,
      budget: $('budget').value,
      deadline: $('deadline').value,
      message: $('message').value.trim(),
    };
    const res = Store.addInquiry(data);
    if (!res.ok) { UI.toast('Could not save your inquiry (browser storage is full).', 'error'); return; }

    // Also send a real email to the artist through Web3Forms (free form service).
    fetch('https://api.web3forms.com/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({
        access_key: WEB3FORMS_KEY,
        subject: 'New commission inquiry from ' + data.name,
        from_name: 'Portfolio commission form',
        name: data.name,
        email: data.email,
        phone: data.phone || 'Not provided',
        commission_type: data.type,
        budget: data.budget,
        deadline: data.deadline,
        message: data.message,
      }),
    })
      .then((r) => r.json())
      .then((j) => { if (!j.success) UI.toast('Saved, but the email could not be sent.', 'error'); })
      .catch(() => UI.toast('Saved, but the email could not be sent (check your internet).', 'error'));

    UI.toast('Inquiry sent successfully!', 'success');
    showModal(res.item);
    form.reset();
    touched.clear();
    counter.textContent = '0 / ' + $('message').maxLength;
    form.querySelectorAll('.field').forEach((f) => { f.classList.remove('valid', 'invalid'); f.querySelector('.error-msg').textContent = ''; });
  });

  /* ---------- confirmation modal ---------- */
  let lastFocus;
  function showModal(item) {
    $('sucName').textContent = item.name;
    $('sucEmail').textContent = item.email;
    $('sucRef').textContent = '#' + item.id.slice(-6).toUpperCase();
    lastFocus = document.activeElement;
    modal.hidden = false;
    requestAnimationFrame(() => modal.classList.add('show'));
    $('sucClose').focus();
  }
  function hideModal() {
    modal.classList.remove('show');
    setTimeout(() => { modal.hidden = true; }, 200);
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }
  $('sucClose').addEventListener('click', hideModal);
  modal.addEventListener('click', (e) => { if (e.target === modal) hideModal(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !modal.hidden) hideModal(); });

  /* ---------- called by the lightbox "Commission something similar" ---------- */
  function prefill(title) {
    const msg = $('message');
    if (title && !msg.value.trim()) {
      msg.value = `Hi Mira! I love “${title}” and would like a commission inspired by it. `;
      msg.dispatchEvent(new Event('input'));
    }
    document.getElementById('commission').scrollIntoView({ behavior: 'smooth' });
    setTimeout(() => $('name').focus({ preventScroll: true }), 600);
  }

  return { prefill };
})();


/* ======== admin.js ======== */
/* ==========================================================
   admin.js  —  ADMIN UPLOAD PORTAL  (required feature)
   • login gate (demo only: stored in sessionStorage)
   • dashboard with stats, category bars and artwork list
   • upload / edit form with image validation, preview,
     canvas compression and instant publishing
   • inquiries inbox (read / unread / delete)
   NOTE: a real site would check the password on a server.
   ========================================================== */
(() => {
  const AUTH_KEY = 'aw_admin';
  const USER = 'admin';
  const PASS = 'art@2026';

  const $ = (id) => document.getElementById(id);
  const loginView = $('loginView');
  const appView = $('appView');

  /* ================= LOGIN ================= */
  const isAuthed = () => { try { return sessionStorage.getItem(AUTH_KEY) === '1'; } catch (e) { return false; } };

  function showApp() {
    loginView.hidden = true;
    appView.hidden = false;
    document.body.classList.add('in-app');
    refreshAll();
  }
  function showLogin() {
    appView.hidden = true;
    loginView.hidden = false;
    document.body.classList.remove('in-app');
  }

  $('loginForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const u = $('user').value.trim();
    const p = $('pass').value;
    if (u === USER && p === PASS) {
      try { sessionStorage.setItem(AUTH_KEY, '1'); } catch (err) { /* ignore */ }
      $('loginErr').textContent = '';
      $('pass').value = '';
      showApp();
    } else {
      $('loginErr').textContent = 'Incorrect username or password.';
      $('pass').focus();
    }
  });

  $('logout').addEventListener('click', () => {
    try { sessionStorage.removeItem(AUTH_KEY); } catch (e) { /* ignore */ }
    showLogin();
  });

  /* ================= TABS ================= */
  function switchTab(name) {
    document.querySelectorAll('.tab').forEach((t) => {
      const on = t.dataset.tab === name;
      t.classList.toggle('active', on);
      t.setAttribute('aria-selected', on);
    });
    document.querySelectorAll('.panel').forEach((p) => {
      const on = p.id === 'tab-' + name;
      p.classList.toggle('active', on);
      p.hidden = !on;
    });
  }
  document.querySelector('.tabs').addEventListener('click', (e) => {
    const t = e.target.closest('.tab');
    if (!t) return;
    if (t.dataset.tab !== 'upload') cancelEdit(true);
    switchTab(t.dataset.tab);
  });

  /* ================= DASHBOARD ================= */
  function refreshAll() {
    renderStats();
    renderList();
    renderInquiries();
  }

  function renderStats() {
    const art = Store.getArtworks();
    const inq = Store.getInquiries();
    const unread = inq.filter((q) => !q.read).length;
    const cards = [
      ['Total artworks', art.length],
      ['Featured', art.filter((a) => a.featured).length],
      ['Inquiries received', inq.length],
      ['Unread inquiries', unread],
    ];
    $('statGrid').innerHTML = cards.map(([l, n]) => `<div class="stat-card"><b>${n}</b><span>${l}</span></div>`).join('');

    const max = Math.max(1, ...Store.CATEGORIES.map((c) => art.filter((a) => a.category === c).length));
    $('catBars').innerHTML = Store.CATEGORIES.map((c) => {
      const n = art.filter((a) => a.category === c).length;
      return `<div class="bar-row"><span class="bar-label">${UI.esc(c)}</span><div class="bar"><i style="width:${(n / max) * 100}%"></i></div><span class="bar-n">${n}</span></div>`;
    }).join('');

    const pill = $('unreadPill');
    pill.textContent = unread;
    pill.hidden = unread === 0;
  }

  function renderList() {
    const art = Store.getArtworks();
    const box = $('artList');
    if (!art.length) {
      box.innerHTML = '<p class="muted pad">No artworks yet. Use “Upload artwork” to add your first piece.</p>';
      return;
    }
    box.innerHTML = art.map((a) => `
      <div class="art-row" data-id="${UI.esc(a.id)}">
        <img src="${UI.esc(a.image)}" alt="" loading="lazy" />
        <div class="art-meta">
          <b>${UI.esc(a.title)}</b>
          <span>${UI.esc(a.category)} · ${UI.esc(a.year)} · ${UI.esc(a.medium)}</span>
        </div>
        <div class="art-actions">
          <button type="button" class="btn btn-ghost btn-sm${a.featured ? ' on' : ''}" data-act="feature" aria-pressed="${!!a.featured}">${a.featured ? '★ Featured' : '☆ Feature'}</button>
          <button type="button" class="btn btn-ghost btn-sm" data-act="edit">Edit</button>
          <button type="button" class="btn btn-danger-ghost btn-sm" data-act="delete">Delete</button>
        </div>
      </div>`).join('');
  }

  $('artList').addEventListener('click', async (e) => {
    const btn = e.target.closest('[data-act]');
    if (!btn) return;
    const id = btn.closest('.art-row').dataset.id;
    const art = Store.getArtworks().find((a) => a.id === id);
    if (!art) return;

    if (btn.dataset.act === 'feature') {
      Store.toggleFeatured(id);
      UI.toast(art.featured ? 'Removed from featured.' : 'Marked as featured.', 'success');
      refreshAll();
    } else if (btn.dataset.act === 'edit') {
      startEdit(art);
    } else if (btn.dataset.act === 'delete') {
      const ok = await UI.confirmDialog({ title: 'Delete artwork?', message: `“${art.title}” will be removed from the public gallery. This cannot be undone.`, okText: 'Delete', danger: true });
      if (ok) { Store.deleteArtwork(id); UI.toast('Artwork deleted.', 'success'); refreshAll(); }
    }
  });

  $('exportBtn').addEventListener('click', () => {
    const blob = new Blob([Store.exportJSON()], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'portfolio-data.json';
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
    UI.toast('Exported portfolio-data.json', 'success');
  });

  $('resetBtn').addEventListener('click', async () => {
    const ok = await UI.confirmDialog({ title: 'Reset to demo data?', message: 'This deletes every uploaded artwork and all inquiries and restores the 12 demo artworks.', okText: 'Reset', danger: true });
    if (ok) { Store.resetDemo(); cancelEdit(true); UI.toast('Demo data restored.', 'success'); refreshAll(); }
  });

  /* ================= UPLOAD / EDIT FORM ================= */
  const MAX_BYTES = 2 * 1024 * 1024;
  const OK_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
  const form = $('uploadForm');
  const fileInput = $('file');
  const drop = $('drop');
  const preview = $('preview');
  let imageData = null;   // { dataUrl, w, h } for the currently chosen image
  let editingId = null;

  $('aCat').innerHTML = '<option value="">Select category…</option>' + Store.CATEGORIES.map((c) => `<option>${UI.esc(c)}</option>`).join('');
  $('aYear').value = new Date().getFullYear();

  const rules = {
    aTitle: (v) => (v.trim().length < 2 ? 'Enter a title (at least 2 characters).' : ''),
    aCat: (v) => (v ? '' : 'Choose a category.'),
    aYear: (v) => {
      const n = Number(v);
      if (!v) return 'Enter the year.';
      if (!Number.isInteger(n) || n < 1900 || n > new Date().getFullYear() + 1) return 'Enter a valid year.';
      return '';
    },
    aMedium: (v) => (v.trim().length < 2 ? 'Describe the medium.' : ''),
    aDim: () => '',
    aDesc: (v) => (v.trim().length < 15 ? 'Add a description (at least 15 characters).' : ''),
  };

  function validateField(id) {
    const el = $(id);
    const err = rules[id](el.value);
    const wrap = el.closest('.field');
    wrap.querySelector('.error-msg').textContent = err;
    wrap.classList.toggle('invalid', !!err);
    el.setAttribute('aria-invalid', err ? 'true' : 'false');
    return !err;
  }
  Object.keys(rules).forEach((id) => {
    $(id).addEventListener('blur', () => validateField(id));
    const evt = $(id).tagName === 'SELECT' ? 'change' : 'input';
    $(id).addEventListener(evt, () => { if ($(id).closest('.field').classList.contains('invalid')) validateField(id); });
  });

  /* ----- image picking: click, keyboard, drag & drop ----- */
  drop.addEventListener('click', () => fileInput.click());
  drop.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); fileInput.click(); } });
  ['dragenter', 'dragover'].forEach((ev) => drop.addEventListener(ev, (e) => { e.preventDefault(); drop.classList.add('over'); }));
  ['dragleave', 'drop'].forEach((ev) => drop.addEventListener(ev, (e) => { e.preventDefault(); drop.classList.remove('over'); }));
  drop.addEventListener('drop', (e) => { const f = e.dataTransfer.files[0]; if (f) handleFile(f); });
  fileInput.addEventListener('change', () => { if (fileInput.files[0]) handleFile(fileInput.files[0]); });

  function setFileError(msg) {
    $('fileErr').textContent = msg;
    drop.classList.toggle('invalid', !!msg);
  }

  function handleFile(file) {
    setFileError('');
    if (!OK_TYPES.includes(file.type)) { setFileError('Only JPG, PNG or WebP images are allowed.'); return; }
    if (file.size > MAX_BYTES) { setFileError(`That file is ${(file.size / 1048576).toFixed(1)} MB — the limit is 2 MB.`); return; }

    const bar = $('progress');
    bar.hidden = false;
    bar.firstElementChild.style.width = '15%';

    const reader = new FileReader();
    reader.onprogress = (e) => { if (e.lengthComputable) bar.firstElementChild.style.width = 15 + (e.loaded / e.total) * 55 + '%'; };
    reader.onerror = () => { bar.hidden = true; setFileError('Could not read that file. Try another.'); };
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => { bar.hidden = true; setFileError('That file is not a valid image.'); };
      img.onload = () => {
        bar.firstElementChild.style.width = '90%';
        imageData = compress(img);
        preview.src = imageData.dataUrl;
        preview.hidden = false;
        $('dropHint').hidden = true;
        bar.firstElementChild.style.width = '100%';
        setTimeout(() => { bar.hidden = true; }, 500);
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  }

  /** Shrink to max 1400px and re-encode as JPEG so localStorage doesn't fill up. */
  function compress(img) {
    const MAX = 1400;
    const scale = Math.min(1, MAX / Math.max(img.width, img.height));
    const w = Math.round(img.width * scale);
    const h = Math.round(img.height * scale);
    const c = document.createElement('canvas');
    c.width = w; c.height = h;
    const ctx = c.getContext('2d');
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, w, h);
    ctx.drawImage(img, 0, 0, w, h);
    return { dataUrl: c.toDataURL('image/jpeg', 0.82), w, h };
  }

  function resetImage() {
    imageData = null;
    preview.hidden = true;
    preview.removeAttribute('src');
    $('dropHint').hidden = false;
    fileInput.value = '';
    setFileError('');
  }

  /* ----- edit mode ----- */
  function startEdit(a) {
    editingId = a.id;
    $('uploadTitle').textContent = 'Edit artwork';
    $('saveBtn').textContent = 'Save changes';
    $('cancelEdit').hidden = false;
    $('aTitle').value = a.title;
    $('aCat').value = a.category;
    $('aYear').value = a.year;
    $('aMedium').value = a.medium;
    $('aDim').value = a.dimensions || '';
    $('aDesc').value = a.description || '';
    $('aFeat').checked = !!a.featured;
    imageData = { dataUrl: a.image, w: a.w, h: a.h, existing: true };
    preview.src = a.image;
    preview.hidden = false;
    $('dropHint').hidden = true;
    switchTab('upload');
    $('aTitle').focus();
  }

  function cancelEdit(silent) {
    editingId = null;
    $('uploadTitle').textContent = 'Upload new artwork';
    $('saveBtn').textContent = 'Publish artwork';
    $('cancelEdit').hidden = true;
    form.reset();
    resetImage();
    $('aYear').value = new Date().getFullYear();
    form.querySelectorAll('.field').forEach((f) => { f.classList.remove('invalid'); const m = f.querySelector('.error-msg'); if (m) m.textContent = ''; });
    if (!silent) switchTab('dashboard');
  }
  $('cancelEdit').addEventListener('click', () => cancelEdit(false));
  form.addEventListener('reset', () => { setTimeout(() => { resetImage(); $('aYear').value = new Date().getFullYear(); }, 0); });

  /* ----- submit ----- */
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    let firstBad = null;
    Object.keys(rules).forEach((id) => { if (!validateField(id) && !firstBad) firstBad = $(id); });
    if (!imageData) { setFileError('Please choose an image to upload.'); firstBad = firstBad || drop; }
    if (firstBad) { firstBad.focus(); UI.toast('Please fix the highlighted fields.', 'error'); return; }

    const fields = {
      title: $('aTitle').value.trim(),
      category: $('aCat').value,
      year: Number($('aYear').value),
      medium: $('aMedium').value.trim(),
      dimensions: $('aDim').value.trim(),
      description: $('aDesc').value.trim(),
      featured: $('aFeat').checked,
      image: imageData.dataUrl,
      w: imageData.w,
      h: imageData.h,
    };

    const res = editingId ? Store.updateArtwork(editingId, fields) : Store.addArtwork(fields);
    if (!res.ok) {
      UI.toast('Browser storage is full. Delete some artworks and try again.', 'error');
      return;
    }
    UI.toast(editingId ? 'Changes saved.' : 'Artwork published to the gallery!', 'success');
    cancelEdit(true);
    refreshAll();
    switchTab('dashboard');
  });

  /* ================= INQUIRIES ================= */
  function renderInquiries() {
    const list = Store.getInquiries();
    const box = $('inqList');
    if (!list.length) {
      box.innerHTML = '<p class="muted pad">No inquiries yet. Requests sent from the public commission form will appear here.</p>';
      return;
    }
    box.innerHTML = list.map((q) => {
      const when = new Date(q.createdAt).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });
      return `
      <article class="inq${q.read ? '' : ' unread'}" data-id="${UI.esc(q.id)}">
        <header>
          <div>
            <b>${UI.esc(q.name)}</b> ${q.read ? '' : '<span class="new">New</span>'}
            <span class="muted">· ${UI.esc(q.type)} · ${UI.esc(q.budget)}</span>
          </div>
          <time class="muted">${UI.esc(when)}</time>
        </header>
        <p class="inq-msg">${UI.esc(q.message)}</p>
        <p class="inq-meta muted">
          <a href="mailto:${UI.esc(q.email)}">${UI.esc(q.email)}</a>
          ${q.phone ? ' · ' + UI.esc(q.phone) : ''} · Deadline ${UI.esc(q.deadline)}
        </p>
        <div class="inq-actions">
          <button type="button" class="btn btn-ghost btn-sm" data-act="read">${q.read ? 'Mark as unread' : 'Mark as read'}</button>
          <a class="btn btn-ghost btn-sm" href="mailto:${UI.esc(q.email)}?subject=${encodeURIComponent('Re: your commission inquiry')}">Reply</a>
          <button type="button" class="btn btn-danger-ghost btn-sm" data-act="delete">Delete</button>
        </div>
      </article>`;
    }).join('');
  }

  $('inqList').addEventListener('click', async (e) => {
    const btn = e.target.closest('[data-act]');
    if (!btn) return;
    const id = btn.closest('.inq').dataset.id;
    const q = Store.getInquiries().find((x) => x.id === id);
    if (!q) return;
    if (btn.dataset.act === 'read') {
      Store.updateInquiry(id, { read: !q.read });
      refreshAll();
    } else if (btn.dataset.act === 'delete') {
      const ok = await UI.confirmDialog({ title: 'Delete inquiry?', message: `The request from ${q.name} will be permanently deleted.`, okText: 'Delete', danger: true });
      if (ok) { Store.deleteInquiry(id); UI.toast('Inquiry deleted.', 'success'); refreshAll(); }
    }
  });

  /* ================= START ================= */
  window.enterAdmin = () => { if (isAuthed()) showApp(); else showLogin(); };
})();


/* ==========================================================
   START  —  one page, two views: public site and admin portal
   (#admin in the address shows the admin portal)
   ========================================================== */
(() => {
  const site = document.getElementById('siteRoot');
  const adminRoot = document.getElementById('adminRoot');
  function route() {
    const isAdmin = location.hash === '#admin';
    site.hidden = isAdmin;
    adminRoot.hidden = !isAdmin;
    document.body.classList.toggle('admin', isAdmin);
    document.title = isAdmin ? 'Admin — Mira Solanki Portfolio' : 'Mira Solanki — Artist Portfolio';
    if (isAdmin) { window.enterAdmin(); window.scrollTo(0, 0); }
  }
  document.getElementById('year').textContent = new Date().getFullYear();
  UI.init();
  window.addEventListener('hashchange', route);
  route();
})();
