/* Hjem Kensington: small helpers + GSAP motion */
(function () {
  const root = document.documentElement;

  /* Year */
  document.querySelectorAll('[data-year]').forEach(el => { el.textContent = new Date().getFullYear(); });

  /* Header border on scroll */
  const header = document.querySelector('.site-header');
  const onScroll = () => header.classList.toggle('is-scrolled', window.scrollY > 8);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  /* Mobile nav */
  const toggle = document.querySelector('.menu-toggle');
  const nav = document.getElementById('nav');
  const closeNav = () => { nav.classList.remove('is-open'); toggle.setAttribute('aria-expanded', 'false'); toggle.setAttribute('aria-label', 'Open menu'); };
  toggle.addEventListener('click', () => {
    const open = toggle.getAttribute('aria-expanded') !== 'true';
    nav.classList.toggle('is-open', open);
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  });
  nav.querySelectorAll('a').forEach(a => a.addEventListener('click', closeNav));
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeNav(); });

  /* Opening hours (both cafés). Edit here if hours change. Minutes from midnight. */
  const HOURS = {
    0: [8 * 60 + 30, 17 * 60], // Sunday
    1: [7 * 60 + 30, 17 * 60],
    2: [7 * 60 + 30, 17 * 60],
    3: [7 * 60 + 30, 17 * 60],
    4: [7 * 60 + 30, 17 * 60],
    5: [7 * 60 + 30, 17 * 60],
    6: [8 * 60 + 30, 17 * 60]  // Saturday
  };
  const fmt = m => `${Math.floor(m / 60)}:${String(m % 60).padStart(2, '0')}`;
  const londonNow = () => {
    const parts = new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/London', weekday: 'short', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).formatToParts(new Date());
    const get = t => parts.find(p => p.type === t).value;
    const day = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(get('weekday'));
    return { day, mins: parseInt(get('hour'), 10) * 60 + parseInt(get('minute'), 10) };
  };
  function updateStatus() {
    const { day, mins } = londonNow();
    const [open, close] = HOURS[day];
    let short, long;
    if (mins >= open && mins < close) {
      short = `Open now until ${fmt(close)}`;
      long = `Open now, until ${fmt(close)}`;
    } else if (mins < open) {
      short = `Opens today at ${fmt(open)}`;
      long = `Closed now, opens at ${fmt(open)}`;
    } else {
      const next = HOURS[(day + 1) % 7][0];
      short = `Opens tomorrow at ${fmt(next)}`;
      long = `Closed now, opens tomorrow at ${fmt(next)}`;
    }
    document.querySelectorAll('[data-status]').forEach(el => { el.textContent = short; });
    document.querySelectorAll('[data-status-long]').forEach(el => { el.textContent = long; });
    document.querySelectorAll('[data-status-word]').forEach(el => { el.textContent = mins >= open && mins < close ? 'Open now' : 'Closed now'; });
    document.querySelectorAll('[data-today-hours]').forEach(el => { el.textContent = `${fmt(open)} to ${fmt(close)}`; });
    document.querySelectorAll('.hours tr').forEach(tr => tr.classList.toggle('is-today', Number(tr.dataset.day) === day));
  }
  updateStatus();
  setInterval(updateStatus, 60000);

  /* Menu tabs */
  const tabs = Array.from(document.querySelectorAll('[role="tab"]'));
  function selectTab(tab, focus) {
    tabs.forEach(t => {
      const on = t === tab;
      t.setAttribute('aria-selected', String(on));
      t.tabIndex = on ? 0 : -1;
      const panel = document.getElementById(t.getAttribute('aria-controls'));
      panel.hidden = !on;
      if (on && window.gsap && root.classList.contains('js-motion')) {
        gsap.fromTo(panel.querySelectorAll('.menu-list li'), { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: .6, stagger: .05, ease: 'power3.out' });
        gsap.fromTo(panel.querySelector('.menu-photo img'), { opacity: 0, scale: 1.06 }, { opacity: 1, scale: 1, duration: 1, ease: 'power3.out' });
      }
    });
    if (focus) tab.focus();
  }
  tabs.forEach((t, i) => {
    t.addEventListener('click', () => selectTab(t));
    t.addEventListener('keydown', e => {
      let n = null;
      if (e.key === 'ArrowRight') n = tabs[(i + 1) % tabs.length];
      if (e.key === 'ArrowLeft') n = tabs[(i - 1 + tabs.length) % tabs.length];
      if (e.key === 'Home') n = tabs[0];
      if (e.key === 'End') n = tabs[tabs.length - 1];
      if (n) { e.preventDefault(); selectTab(n, true); }
    });
  });

  /* Map switch */
  const CAFES = {
    kensington: { label: '3 Launceston Place', q: '3+Launceston+Place,+London+W8+5RL', name: 'Hjem+Kensington' },
    southken: { label: '157 Gloucester Road', q: '157+Gloucester+Road,+London+SW7+4TH', name: 'Hjem+South+Kensington' }
  };
  const map = document.getElementById('map');
  function showCafe(key, scroll) {
    const c = CAFES[key];
    map.src = `https://www.google.com/maps?q=${c.q}&output=embed`;
    map.title = `Map showing Hjem, ${c.label}`;
    document.querySelectorAll('.map-switch button').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.map === key)));
    const apps = {
      google: `https://www.google.com/maps/search/?api=1&query=Hjem+${c.q}`,
      apple: `https://maps.apple.com/?q=Hjem&address=${c.q}`,
      citymapper: `https://citymapper.com/directions?endaddress=${c.q}&endname=${c.name}`
    };
    document.querySelectorAll('.map-apps a').forEach(a => { a.href = apps[a.dataset.app]; });
    if (scroll) document.getElementById('visit').scrollIntoView();
  }
  document.querySelectorAll('.map-switch button').forEach(b => b.addEventListener('click', () => showCafe(b.dataset.map)));
  document.querySelectorAll('.cafe .link-btn').forEach(b => b.addEventListener('click', () => showCafe(b.dataset.map, true)));

  /* Motion */
  if (!window.gsap || !root.classList.contains('js-motion')) { root.classList.remove('js-motion'); return; }
  gsap.registerPlugin(ScrollTrigger);
  const ease = 'power3.out';

  // Cover: headline lines rise, photo opens like a page
  const tl = gsap.timeline({ defaults: { ease } });
  tl.from('.cover .kicker', { opacity: 0, y: 12, duration: .8 })
    .from('.display .line > span', { yPercent: 108, duration: 1.2, stagger: .1, ease: 'power4.out' }, '<.1')
    .fromTo('.cover-frame', { clipPath: 'inset(100% 0% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.5, ease: 'power4.inOut' }, '<')
    .from('.cover-frame img', { scale: 1.18, duration: 2.2, ease: 'power2.out' }, '<')
    .from('.cover-inset', { opacity: 0, y: 30, duration: 1.1 }, '-=1.2')
    .from('.lede, .cover-actions, .today-card, .cover-media figcaption', { opacity: 0, y: 16, duration: .9, stagger: .08 }, '-=1.1');

  // Gentle reveals
  ScrollTrigger.batch('.reveal', {
    start: 'top 88%',
    once: true,
    onEnter: els => gsap.fromTo(els, { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 1.1, stagger: .1, ease })
  });

  // Facts strip
  gsap.from('.fact', { opacity: 0, duration: 1, stagger: .08, ease, scrollTrigger: { trigger: '.facts', start: 'top 92%', once: true } });

  // Slow parallax inside framed photos
  gsap.utils.toArray('.parallax').forEach(el => {
    gsap.fromTo(el, { yPercent: -5 }, { yPercent: 5, ease: 'none', scrollTrigger: { trigger: el.parentElement, start: 'top bottom', end: 'bottom top', scrub: true } });
  });

  // Menu photos settle in
  gsap.from('.menu-panel:not([hidden]) .menu-photo img', { scale: 1.08, duration: 1.6, ease, scrollTrigger: { trigger: '.menu-panels', start: 'top 80%', once: true } });

  // Photo essay: sideways on desktop, native swipe on small screens
  const mm = gsap.matchMedia();
  mm.add('(min-width: 900px)', () => {
    const essay = document.querySelector('.essay');
    const track = essay.querySelector('.essay-track');
    essay.classList.add('is-pinned');
    const distance = () => Math.max(0, track.scrollWidth - window.innerWidth);
    const tween = gsap.to(track, {
      x: () => -distance(),
      ease: 'none',
      scrollTrigger: { trigger: essay, start: 'top top', end: () => '+=' + distance(), pin: true, scrub: 1, invalidateOnRefresh: true, anticipatePin: 1 }
    });
    return () => { essay.classList.remove('is-pinned'); gsap.set(track, { x: 0 }); };
  });

  window.addEventListener('load', () => ScrollTrigger.refresh());
})();
