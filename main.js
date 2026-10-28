// Open Remote PRO: interazioni della landing. Nessuna dipendenza, nessun tracciamento.
(() => {
  const root = document.documentElement;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  const motion = !reduce.matches;
  if (motion) root.classList.add('motion');

  // menu lingua: si chiude cliccando fuori o con esc
  const lang = document.querySelector('.lang');
  if (lang) {
    document.addEventListener('click', e => { if (!lang.contains(e.target)) lang.open = false; });
    document.addEventListener('keydown', e => { if (e.key === 'Escape') lang.open = false; });
  }

  // comparsa delle immagini
  const reveals = document.querySelectorAll('.reveal');
  if (motion && 'IntersectionObserver' in window) {
    const io = new IntersectionObserver(entries => {
      for (const en of entries) if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
    }, { rootMargin: '0px 0px -12% 0px' });
    reveals.forEach(el => io.observe(el));
  } else reveals.forEach(el => el.classList.add('in'));

  // lente: ingrandisce lo screenshot alla risoluzione originale
  document.querySelectorAll('[data-lens]').forEach(fig => {
    const img = fig.querySelector('img');
    const lens = fig.querySelector('.lens');
    if (!img || !lens) return;
    lens.style.backgroundImage = `url("${img.currentSrc || img.src}")`;
    const place = (fx, fy) => {
      const r = img.getBoundingClientRect(), f = fig.getBoundingClientRect();
      const nat = img.naturalWidth || 1600, zoom = Math.max(nat / r.width, 1.6);
      const lw = lens.offsetWidth;
      const x = Math.min(Math.max(fx, 0), 1), y = Math.min(Math.max(fy, 0), 1);
      lens.style.left = `${r.left - f.left + x * r.width}px`;
      lens.style.top = `${r.top - f.top + y * r.height}px`;
      lens.style.backgroundSize = `${r.width * zoom}px ${r.height * zoom}px`;
      lens.style.backgroundPosition = `${-(x * r.width * zoom - lw / 2)}px ${-(y * r.height * zoom - lw / 2)}px`;
    };
    // posizione iniziale: sul codice, dove si vede meglio la nitidezza del testo
    const home = () => place(0.2, 0.4);
    if (img.complete) home(); else img.addEventListener('load', home);
    addEventListener('resize', home);
    const move = e => {
      const r = img.getBoundingClientRect();
      place((e.clientX - r.left) / r.width, (e.clientY - r.top) / r.height);
    };
    fig.addEventListener('pointerenter', () => lens.classList.add('live'));
    fig.addEventListener('pointermove', move);
    fig.addEventListener('pointerdown', e => { lens.classList.remove('live'); move(e); });
    fig.addEventListener('pointerleave', () => lens.classList.remove('live'));
  });

  // iPhone Duo: lo scorrimento apre e chiude il telefono
  const duo = document.querySelector('[data-duo]');
  if (duo) {
    const dev = duo.querySelector('.duo-device');
    const track = duo.querySelector('.duo-track');
    const btns = duo.querySelectorAll('[data-duo-set]');
    const smooth = t => t * t * (3 - 2 * t);
    const set = p => {
      dev.style.setProperty('--p', p.toFixed(4));
      const open = p > 0.5;
      duo.classList.toggle('is-closed', !open);
      btns.forEach(b => b.setAttribute('aria-pressed', String((b.dataset.duoSet === '1') === open)));
    };
    const progress = () => {
      const r = track.getBoundingClientRect();
      const range = r.height - innerHeight;
      if (range <= 0) return 1;
      const raw = -r.top / range;
      return smooth(Math.min(Math.max((raw - 0.18) / 0.55, 0), 1));
    };
    if (motion) {
      let ticking = false;
      const onScroll = () => {
        if (ticking) return;
        ticking = true;
        requestAnimationFrame(() => { ticking = false; set(progress()); });
      };
      addEventListener('scroll', onScroll, { passive: true });
      addEventListener('resize', onScroll);
      set(progress());
      btns.forEach(b => b.addEventListener('click', () => {
        const r = track.getBoundingClientRect();
        const range = r.height - innerHeight;
        const want = b.dataset.duoSet === '1' ? 0.85 : 0.08;
        scrollTo({ top: scrollY + r.top + range * want, behavior: 'smooth' });
      }));
    } else {
      set(1);
      btns.forEach(b => b.addEventListener('click', () => set(b.dataset.duoSet === '1' ? 1 : 0)));
    }
  }

  // tastiera: i tasti modificatori disegnati si accendono quando li premi davvero
  const keys = document.querySelectorAll('.key[data-key]');
  if (keys.length) {
    const light = (name, on) => keys.forEach(k => { if (k.dataset.key === name) k.classList.toggle('down', on); });
    addEventListener('keydown', e => light(e.key, true));
    addEventListener('keyup', e => light(e.key, false));
    addEventListener('blur', () => keys.forEach(k => k.classList.remove('down')));
    keys.forEach(k => {
      k.addEventListener('pointerdown', () => k.classList.add('down'));
      ['pointerup', 'pointerleave', 'pointercancel'].forEach(t => k.addEventListener(t, () => k.classList.remove('down')));
    });
  }

  // galleria: frecce
  const gal = document.querySelector('.gallery-track');
  document.querySelectorAll('[data-gal]').forEach(b => b.addEventListener('click', () => {
    gal.scrollBy({ left: Number(b.dataset.gal) * gal.clientWidth * 0.8, behavior: motion ? 'smooth' : 'auto' });
  }));
})();
