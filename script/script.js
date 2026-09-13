  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ---- Preloader: plays once per browser tab session ----
  const preloader = document.getElementById('preloader');
  function dismissPreloader(){
    document.body.classList.remove('locked');
    preloader.classList.add('done');
    setTimeout(() => preloader.remove(), 1000);
  }
  if (sessionStorage.getItem('mikatIntroPlayed') && !reduceMotion){
    preloader.classList.add('skip');
    setTimeout(() => preloader.remove(), 50);
  } else {
    document.body.classList.add('locked');
    const holdTime = reduceMotion ? 0 : 1750;
    setTimeout(dismissPreloader, holdTime);
    sessionStorage.setItem('mikatIntroPlayed', '1');
  }

  // ---- Toast helper ----
  const toastEl = document.getElementById('toast');
  let toastTimer;
  function showToast(msg){
    toastEl.textContent = msg;
    toastEl.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.remove('show'), 2400);
  }

  // ---- Copy email to clipboard ----
  const copyEmail = document.getElementById('copyEmail');
  if (copyEmail){
    copyEmail.addEventListener('click', async () => {
      const val = copyEmail.dataset.copy;
      try {
        await navigator.clipboard.writeText(val);
      } catch (e) {
        const ta = document.createElement('textarea');
        ta.value = val; document.body.appendChild(ta); ta.select();
        document.execCommand('copy'); ta.remove();
      }
      copyEmail.classList.add('copied');
      showToast('Email disalin ke clipboard');
      setTimeout(() => copyEmail.classList.remove('copied'), 1500);
    });
  }

  // ---- Save contact as vCard (.vcf) ----
  const saveContact = document.getElementById('saveContact');
  if (saveContact){
    saveContact.addEventListener('click', () => {
      const vcard = [
        'BEGIN:VCARD',
        'VERSION:3.0',
        'FN:Kementerian Minat dan Bakat BEM FT Unsoed',
        'ORG:BEM FT Unsoed',
        'TEL;TYPE=CELL:+6282241183747',
        'EMAIL:kementerianmikatbemft2026@gmail.com',
        'ADR:;;Jl. Raya Mayjen Sungkono No. KM 5, Dusun 2, Blater, Kec. Kalimanah;Purbalingga;Jawa Tengah;53371;Indonesia',
        'END:VCARD'
      ].join('\r\n');
      const blob = new Blob([vcard], { type: 'text/vcard' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = 'Kontak-Mikat-BEM-FT-Unsoed.vcf';
      document.body.appendChild(a); a.click(); a.remove();
      URL.revokeObjectURL(url);
      showToast('Kontak berhasil diunduh');
    });
  }

  // ---- Scroll cue: click hero to jump to next section ----
  const scrollCue = document.getElementById('scrollCue');
  if (scrollCue){
    scrollCue.addEventListener('click', () => {
      document.getElementById('tentang').scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth' });
    });
  }

  // ---- Back to top ----
  const toTop = document.getElementById('toTop');
  toTop.addEventListener('click', () => window.scrollTo({ top:0, behavior: reduceMotion ? 'auto' : 'smooth' }));

  // ---- Nav scroll shadow + scroll progress bar + to-top visibility ----
  const nav = document.getElementById('siteNav');
  const progressBar = document.getElementById('scrollProgress');
  const scrollBall = document.getElementById('scrollBall');
  const railNav = document.getElementById('railNav');
  const onScroll = () => {
    const y = window.scrollY;
    nav.classList.toggle('scrolled', y > 8);
    toTop.classList.toggle('show', y > window.innerHeight * 0.6);
    railNav.classList.toggle('show', y > window.innerHeight * 0.5);
    const h = document.documentElement;
    const scrolled = (h.scrollTop) / (h.scrollHeight - h.clientHeight) * 100;
    progressBar.style.width = scrolled + '%';
    if (scrollBall) scrollBall.style.left = scrolled + '%';
  };
  document.addEventListener('scroll', onScroll, { passive:true });
  onScroll();

  // ---- Mobile menu ----
  const menuBtn = document.getElementById('menuBtn');
  const mobileMenu = document.getElementById('mobileMenu');
  let lastFocused = null;
  function openMenu(){
    lastFocused = document.activeElement;
    mobileMenu.classList.add('open'); menuBtn.classList.add('open');
    menuBtn.setAttribute('aria-expanded','true'); menuBtn.setAttribute('aria-label','Tutup menu navigasi');
    document.body.style.overflow = 'hidden';
    const firstLink = mobileMenu.querySelector('a'); if (firstLink) firstLink.focus({preventScroll:true});
  }
  function closeMenu(){
    mobileMenu.classList.remove('open'); menuBtn.classList.remove('open');
    menuBtn.setAttribute('aria-expanded','false'); menuBtn.setAttribute('aria-label','Buka menu navigasi');
    document.body.style.overflow = '';
    if (lastFocused) lastFocused.focus({preventScroll:true});
  }
  menuBtn.addEventListener('click', () => mobileMenu.classList.contains('open') ? closeMenu() : openMenu());
  mobileMenu.querySelectorAll('a').forEach(a => a.addEventListener('click', closeMenu));
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && mobileMenu.classList.contains('open')) closeMenu(); });

  // ---- Scrollspy (nav links + floating rail dots) ----
  const sections = document.querySelectorAll('main section[id], footer[id]');
  const navLinks = document.querySelectorAll('.nav-links a, .mobile-menu a');
  const railDots = document.querySelectorAll('.rail-dot');
  const setActive = (id) => {
    navLinks.forEach(a => a.classList.toggle('active', a.getAttribute('href') === '#' + id));
    railDots.forEach(d => d.classList.toggle('active', d.getAttribute('href') === '#' + id));
  };
  const spy = new IntersectionObserver((entries) => {
    entries.forEach(entry => { if (entry.isIntersecting) setActive(entry.target.id); });
  }, { rootMargin:'-45% 0px -50% 0px', threshold:0 });
  sections.forEach(s => spy.observe(s));

  // ---- Reveal on scroll ----
  const revealEls = document.querySelectorAll('.reveal');
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => { if (entry.isIntersecting){ entry.target.classList.add('in'); revealObserver.unobserve(entry.target); } });
  }, { threshold:0.15 });
  revealEls.forEach(el => revealObserver.observe(el));

  // ---- Tiny confetti burst (canvas-free, a few DOM particles) ----
  function burstConfetti(originEl){
    if (reduceMotion) return;
    const rect = originEl.getBoundingClientRect();
    const colors = ['#A32330', '#E7B93C', '#16214A'];
    for (let i = 0; i < 10; i++){
      const p = document.createElement('span');
      p.className = 'confetti-bit';
      p.style.left = (rect.left + rect.width / 2) + 'px';
      p.style.top = rect.top + 'px';
      p.style.background = colors[i % colors.length];
      const angle = (Math.random() * Math.PI) - Math.PI / 2 - Math.PI / 2;
      const dist = 40 + Math.random() * 50;
      p.style.setProperty('--dx', Math.cos(angle) * dist + 'px');
      p.style.setProperty('--dy', Math.sin(angle) * dist - 30 + 'px');
      p.style.setProperty('--rot', (Math.random() * 360) + 'deg');
      document.body.appendChild(p);
      setTimeout(() => p.remove(), 900);
    }
  }

  // ---- Split-flap scoreboard: flaps drop into place once in view ----
  const scoreboard = document.getElementById('scoreboard');
  if (scoreboard){
    const flapObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const digits = entry.target.querySelectorAll('.flap-digit');
        digits.forEach((d, i) => {
          setTimeout(() => d.classList.add('flip'), reduceMotion ? 0 : i * 130);
        });
        setTimeout(() => burstConfetti(entry.target.querySelector('.flap-num')),
          reduceMotion ? 0 : digits.length * 130 + 200);
        flapObserver.unobserve(entry.target);
      });
    }, { threshold:0.6 });
    scoreboard.querySelectorAll('.score-tile').forEach(tile => flapObserver.observe(tile));

    // ---- Scoreboard tiles are clickable shortcuts to their section ----
    scoreboard.querySelectorAll('.score-tile').forEach(tile => {
      tile.addEventListener('click', () => {
        const key = tile.dataset.target;
        const sectionId = key === 'proker-agenda' ? 'proker' : key;
        const section = document.getElementById(sectionId);
        if (!section) return;
        section.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block:'start' });
        section.classList.add('pulse-highlight');
        setTimeout(() => section.classList.remove('pulse-highlight'), 1300);
        if (key === 'proker-agenda'){
          setTimeout(() => {
            const agendaBtn = tabBtns.find(b => b.dataset.tab === 'agenda');
            if (agendaBtn) activateTab(agendaBtn);
          }, reduceMotion ? 0 : 450);
        }
      });
    });
  }

  // ---- Gentle 3D tilt on interactive cards ----
  const tiltEls = document.querySelectorAll('.misi-card, .person, .doc-card');
  if (!reduceMotion && window.matchMedia('(hover: hover)').matches){
    tiltEls.forEach(el => {
      el.style.transformStyle = 'preserve-3d';
      el.addEventListener('mousemove', (e) => {
        const r = el.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width - 0.5;
        const py = (e.clientY - r.top) / r.height - 0.5;
        el.style.transform = `perspective(700px) rotateX(${(-py * 6).toFixed(2)}deg) rotateY(${(px * 8).toFixed(2)}deg) translateY(-3px)`;
      });
      el.addEventListener('mouseleave', () => { el.style.transform = ''; });
    });
  }

  // ---- Program Kerja / Agenda Kerja tab switch (with fade transition + arrow-key nav) ----
  const tabBtns = Array.from(document.querySelectorAll('.tab-btn'));
  const panels = { proker: document.getElementById('panel-proker'), agenda: document.getElementById('panel-agenda') };
  function activateTab(btn){
    tabBtns.forEach(b => { b.classList.remove('active'); b.setAttribute('aria-selected','false'); b.tabIndex = -1; });
    btn.classList.add('active'); btn.setAttribute('aria-selected','true'); btn.tabIndex = 0;
    const target = panels[btn.dataset.tab];
    Object.values(panels).forEach(p => { if (p !== target) p.classList.remove('active'); });
    target.classList.add('switching');
    requestAnimationFrame(() => {
      target.classList.add('active');
      requestAnimationFrame(() => target.classList.remove('switching'));
    });
  }
  tabBtns.forEach((btn, i) => {
    btn.addEventListener('click', () => activateTab(btn));
    btn.addEventListener('keydown', (e) => {
      if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
      e.preventDefault();
      const next = tabBtns[(i + (e.key === 'ArrowRight' ? 1 : -1) + tabBtns.length) % tabBtns.length];
      next.focus(); activateTab(next);
    });
  });

  // ---- Delegasi Lomba flow tab switch (Berbayar / Tidak Berbayar) ----
  const flowBtns = Array.from(document.querySelectorAll('.flow-tab-btn'));
  const flowPanels = { berbayar: document.getElementById('flow-berbayar'), gratis: document.getElementById('flow-gratis') };
  function activateFlow(btn){
    flowBtns.forEach(b => { b.classList.remove('active'); b.setAttribute('aria-selected','false'); b.tabIndex = -1; });
    btn.classList.add('active'); btn.setAttribute('aria-selected','true'); btn.tabIndex = 0;
    const target = flowPanels[btn.dataset.flow];
    Object.values(flowPanels).forEach(p => { if (p !== target) p.classList.remove('active'); });
    target.classList.add('switching');
    requestAnimationFrame(() => {
      target.classList.add('active');
      requestAnimationFrame(() => target.classList.remove('switching'));
    });
  }
  flowBtns.forEach((btn, i) => {
    btn.addEventListener('click', () => activateFlow(btn));
    btn.addEventListener('keydown', (e) => {
      if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
      e.preventDefault();
      const next = flowBtns[(i + (e.key === 'ArrowRight' ? 1 : -1) + flowBtns.length) % flowBtns.length];
      next.focus(); activateFlow(next);
    });
  });

  // ---- Accordion: animated open/close, one open per panel at a time ----
  const accToggleAll = document.getElementById('accToggleAll');
  document.querySelectorAll('.acc').forEach(group => {
    const items = group.querySelectorAll('.acc-item');
    items.forEach(item => {
      const btn = item.querySelector('.acc-summary');
      btn.addEventListener('click', () => {
        const willOpen = !item.classList.contains('open');
        items.forEach(other => {
          other.classList.remove('open');
          other.querySelector('.acc-summary').setAttribute('aria-expanded','false');
        });
        if (willOpen){
          item.classList.add('open');
          btn.setAttribute('aria-expanded','true');
          if (window.innerWidth < 700){
            setTimeout(() => item.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block:'nearest' }), 200);
          }
        }
        if (accToggleAll) accToggleAll.dataset.state = 'closed', accToggleAll.textContent = 'Buka Semua';
      });
    });
  });

  // ---- Buka Semua / Tutup Semua control for the active panel ----
  if (accToggleAll){
    accToggleAll.addEventListener('click', () => {
      const activePanel = document.querySelector('.tab-panel.active');
      const items = activePanel.querySelectorAll('.acc-item');
      const opening = accToggleAll.dataset.state === 'closed';
      items.forEach(item => {
        item.classList.toggle('open', opening);
        item.querySelector('.acc-summary').setAttribute('aria-expanded', String(opening));
      });
      accToggleAll.dataset.state = opening ? 'open' : 'closed';
      accToggleAll.textContent = opening ? 'Tutup Semua' : 'Buka Semua';
    });
  }

  // ---- Deep link: #proker or #agenda in URL opens the right tab on load ----
  if (location.hash === '#agenda'){
    const agendaBtn = tabBtns.find(b => b.dataset.tab === 'agenda');
    if (agendaBtn) activateTab(agendaBtn);
  }

  // ---- Profile lightbox: click/Enter on a person card to view the photo large ----
  const lightbox = document.getElementById('lightbox');
  const lightboxImg = document.getElementById('lightboxImg');
  const lightboxName = document.getElementById('lightboxName');
  const lightboxRole = document.getElementById('lightboxRole');
  const lightboxClose = document.getElementById('lightboxClose');
  const lightboxBackdrop = document.getElementById('lightboxBackdrop');
  let lbLastFocused = null;

  function openLightbox(person){
    const photo = person.dataset.photo;
    if (!photo) return;
    lbLastFocused = document.activeElement;
    lightboxImg.src = photo;
    lightboxImg.alt = 'Foto ' + (person.dataset.name || '');
    lightboxName.textContent = person.dataset.name || '';
    lightboxRole.textContent = person.dataset.role || '';
    lightbox.classList.add('open');
    lightbox.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    lightboxClose.focus({ preventScroll:true });
  }
  function closeLightbox(){
    lightbox.classList.remove('open');
    lightbox.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    if (lbLastFocused) lbLastFocused.focus({ preventScroll:true });
  }
  document.querySelectorAll('.person[data-photo]').forEach(person => {
    person.addEventListener('click', () => openLightbox(person));
    person.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' '){ e.preventDefault(); openLightbox(person); }
    });
  });
  lightboxClose.addEventListener('click', closeLightbox);
  lightboxBackdrop.addEventListener('click', closeLightbox);
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && lightbox.classList.contains('open')) closeLightbox(); });

  // ---- Cursor glow: soft light that follows the pointer over the page ----
  const cursorGlow = document.getElementById('cursorGlow');
  if (cursorGlow && !reduceMotion && window.matchMedia('(hover: hover)').matches){
    let glowX = 0, glowY = 0, curX = 0, curY = 0;
    document.addEventListener('mousemove', (e) => {
      glowX = e.clientX; glowY = e.clientY;
      cursorGlow.classList.add('show');
    });
    document.addEventListener('mouseleave', () => cursorGlow.classList.remove('show'));
    (function loop(){
      curX += (glowX - curX) * 0.14;
      curY += (glowY - curY) * 0.14;
      cursorGlow.style.transform = `translate(${curX}px, ${curY}px) translate(-50%, -50%)`;
      requestAnimationFrame(loop);
    })();
  }

  // ---- Magnetic buttons: nudge toward the cursor, snap back on leave ----
  if (!reduceMotion && window.matchMedia('(hover: hover)').matches){
    document.querySelectorAll('.magnetic').forEach(el => {
      el.addEventListener('mousemove', (e) => {
        const r = el.getBoundingClientRect();
        const mx = (e.clientX - r.left - r.width / 2) * 0.35;
        const my = (e.clientY - r.top - r.height / 2) * 0.5;
        el.style.transform = `translate(${mx.toFixed(1)}px, ${my.toFixed(1)}px)`;
      });
      el.addEventListener('mouseleave', () => { el.style.transform = ''; });
    });
  }