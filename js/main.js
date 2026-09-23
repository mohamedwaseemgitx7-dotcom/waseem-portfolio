(function(){
  const $ = (s, r=document) => r.querySelector(s);
  const $$ = (s, r=document) => Array.from(r.querySelectorAll(s));
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- toast ---------- */
  const toastEl = $('#toast'); let tt;
  function toast(msg){ toastEl.textContent = msg; toastEl.classList.add('show'); clearTimeout(tt); tt = setTimeout(()=>toastEl.classList.remove('show'), 2800); }

  /* ---------- resume download (plain <a download> links) ---------- */
  $$('[data-resume]').forEach(a => a.addEventListener('click', () => { closeMenu(); toast('Downloading resume…'); }));

  /* ---------- dialogs ---------- */
  const certs = {dlk: $('img[alt^="DLK"]').src, scion: $('img[alt^="SCION"]').src};
  $$('[data-cert]').forEach(b => b.addEventListener('click', () => {
    const k = b.dataset.cert; const img = $('#certImg');
    img.src = certs[k]; img.alt = b.getAttribute('aria-label').replace('View ','');
    $('#dlgCert').showModal();
  }));
  $$('[data-open]').forEach(b => b.addEventListener('click', () => $('#'+b.dataset.open).showModal()));
  $$('dialog').forEach(d => {
    d.addEventListener('click', e => { if (e.target === d) d.close(); });
    $$('[data-close]', d).forEach(x => x.addEventListener('click', () => d.close()));
  });


  /* ---------- mail / phone links ----------
     Inside an embedded preview (iframe), mailto:/tel: navigate the frame itself and leave it blank.
     There we copy the value and open Gmail compose in a new tab instead. On a normal site they work natively. */
  const embedded = (() => { try { return window.self !== window.top; } catch (e) { return true; } })();
  async function copyText(t){
    try { await navigator.clipboard.writeText(t); return true; }
    catch (e) {
      const ta = document.createElement('textarea'); ta.value = t; ta.setAttribute('readonly',''); ta.style.cssText = 'position:fixed;opacity:0';
      document.body.appendChild(ta); ta.select(); let ok = false; try { ok = document.execCommand('copy'); } catch (_) {} ta.remove(); return ok;
    }
  }
  document.addEventListener('click', async e => {
    const a = e.target.closest('a[href^="mailto:"], a[href^="tel:"]');
    if (!a || !embedded) return;
    e.preventDefault();
    const href = a.getAttribute('href');
    if (href.startsWith('mailto:')) {
      const email = href.slice(7).split('?')[0];
      window.open('https://mail.google.com/mail/?view=cm&fs=1&to=' + encodeURIComponent(email), '_blank', 'noopener');
      const ok = await copyText(email);
      toast(ok ? 'Email copied · opening Gmail' : 'Opening Gmail · ' + email);
    } else {
      const num = href.slice(4);
      const ok = await copyText(num);
      toast(ok ? 'Number copied: ' + num : num);
    }
  });

  /* ---------- tap pop on skills / tools ---------- */
  document.addEventListener('pointerdown', e => {
    const el = e.target.closest('[data-pop]'); if (!el || reduce) return;
    el.classList.remove('popped'); void el.offsetWidth; el.classList.add('popped');
  });
  document.addEventListener('animationend', e => { if (e.animationName === 'tapPop') e.target.classList.remove('popped'); });

  /* ---------- mobile menu ---------- */
  const burger = $('#burger');
  function closeMenu(){ document.body.classList.remove('menu-open'); burger.setAttribute('aria-expanded','false'); lenis && lenis.start(); }
  burger.addEventListener('click', () => {
    const open = document.body.classList.toggle('menu-open');
    burger.setAttribute('aria-expanded', String(open));
    $$('.m-link').forEach((a,i)=> a.style.transitionDelay = open ? (0.05 + i*0.05)+'s' : '0s');
    if (lenis) open ? lenis.stop() : lenis.start();
  });

  /* ---------- smooth scroll ---------- */
  let lenis = null;
  if (!reduce && window.Lenis) {
    lenis = new Lenis({
      lerp: 0.14,
      wheelMultiplier: 0.85,
      touchMultiplier: 1.2,
      smoothWheel: true,
      syncTouch: false,
    });
    lenis.on('scroll', () => {
      if (window.ScrollTrigger) ScrollTrigger.update();
    });
    (function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    })(performance.now());
  }
  $$('a[href^="#"]').forEach(a => a.addEventListener('click', e => {
    const id = a.getAttribute('href'); if (id.length < 2) return;
    const t = $(id); if (!t) return;
    e.preventDefault(); closeMenu();
    const off = -parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-h')) + 1;
    if (lenis) lenis.scrollTo(t, {offset: id === '#home' ? 0 : off, duration: 0.65});
    else window.scrollTo({top: t.getBoundingClientRect().top + scrollY + (id==='#home'?0:off), behavior: reduce ? 'auto' : 'smooth'});
  }));

  /* ---------- nav state + sliding indicator ---------- */
  const nav = $('#nav'), ind = $('#navInd'), links = $$('#navLinks a');
  const map = {home:'home', about:'about', medforms:'projects', whatsapp:'projects', experience:'experience', skills:'skills', contact:'contact'};
  const sectionEntries = Object.entries(map).map(([k, v]) => ({ el: document.getElementById(k), target: v })).filter(s => s.el);
  function moveInd(a){ if (!a) return; ind.style.width = (a.offsetWidth - 40) + 'px'; ind.style.transform = 'translateX(' + (a.offsetLeft + 20) + 'px)'; }
  let current = '';
  function onScroll(){
    nav.classList.toggle('scrolled', scrollY > 30);
    let id = 'home';
    const threshold = innerHeight * 0.38;
    for (let i = 0; i < sectionEntries.length; i++) {
      if (sectionEntries[i].el.getBoundingClientRect().top < threshold) id = sectionEntries[i].target;
    }
    if (id !== current) {
      current = id;
      links.forEach(a => {
        const on = a.getAttribute('href') === '#'+id;
        a.classList.toggle('is-active', on);
        if (on) moveInd(a);
      });
    }
  }
  addEventListener('scroll', onScroll, {passive:true});
  addEventListener('resize', () => { const a = $('#navLinks a.is-active'); moveInd(a); drawChain(); });
  document.fonts && document.fonts.ready.then(() => { moveInd($('#navLinks a.is-active')); drawChain(); });

  /* ---------- rotating roles ---------- */
  const roles = $$('#roles li'); let ri = 0;
  if (!reduce) setInterval(() => { roles[ri].classList.remove('on'); ri = (ri + 1) % roles.length; roles[ri].classList.add('on'); }, 2600);

  /* ---------- about: connector curves between flow cards ---------- */
  function drawChain(){
    const svg = $('#chainLinks'), box = $('#chain'); if (!svg || getComputedStyle(svg).display === 'none') return;
    const cards = $$('.cc', box), b = box.getBoundingClientRect(); let d = '';
    for (let i=0;i<cards.length-1;i++){
      const a = cards[i].getBoundingClientRect(), c = cards[i+1].getBoundingClientRect();
      const x1 = a.left - b.left + 30, y1 = a.bottom - b.top, x2 = c.left - b.left + 40, y2 = c.top - b.top;
      d += `M${x1} ${y1} C ${x1} ${y1+28}, ${x2-10} ${y1+14}, ${x2} ${y2} `;
    }
    svg.innerHTML = `<path d="${d}" stroke-linecap="round" id="chainPath"/>`;
  }
  drawChain();

  /* ---------- motion ---------- */
  document.documentElement.classList.remove('is-loading');
  onScroll();
  if (reduce || !window.gsap || !window.ScrollTrigger) return;
  gsap.registerPlugin(ScrollTrigger);
  const E = 'expo.out';

  // page-load sequence — one orchestrated moment
  const intro = gsap.timeline({defaults:{ease:E, duration:1.2}});
  intro
    .from('.planet', {opacity:0, scale:.9, rotate:-6, duration:2.6, ease:'power3.out'}, 0)
    .from('.streak', {scaleX:0, opacity:0, duration:2}, .4)
    .from('.nav', {y:-24, opacity:0, duration:1}, .1)
    .from('.hero .kicker', {y:16, opacity:0}, .25)
    .from('.hero h1 .line > span', {yPercent:115, duration:1.4, stagger:.12}, .3)
    .from('.hero-sub, .hero-desc, .hero .btns', {y:22, opacity:0, stagger:.08}, .7)
    .from('.traits li', {y:14, opacity:0, stagger:.07}, .95)
    .from('.roles li', {x:18, opacity:0, stagger:.08}, .8)
    .fromTo('.hero-note', {clipPath:'inset(0 100% 0 0)'}, {clipPath:'inset(0 0% 0 0)', duration:1.8, ease:'power2.inOut'}, 1)
    .from('.featured > *', {y:36, opacity:0, stagger:.1, duration:1.3}, 1.05)
    .from('.hero-foot', {opacity:0, duration:1}, 1.4);

  // hero depth on scroll
  gsap.to('.hero .planet', {yPercent:12, ease:'none', scrollTrigger:{trigger:'.hero', start:'top top', end:'bottom top', scrub:0.3}});

  // split headings: lines rise from a mask
  $$('[data-split]').forEach(h => gsap.from($$('.line > span', h), {yPercent:115, duration:0.95, ease:E, stagger:.08, scrollTrigger:{trigger:h, start:'top 85%'}}));

  // general reveals — batched so groups settle together
  ScrollTrigger.batch('[data-r]', {start:'top 88%', once:true,
    onEnter: els => gsap.from(els, {y:24, opacity:0, duration:0.85, ease:E, stagger:.06, overwrite:true})});

  // about: connector draws, cards cascade
  const cp = document.getElementById('chainPath');
  if (cp) { const L = cp.getTotalLength(); gsap.fromTo(cp, {strokeDasharray:L, strokeDashoffset:L}, {strokeDashoffset:0, ease:'none', scrollTrigger:{trigger:'.desk', start:'top 70%', end:'center 45%', scrub:0.4}}); }
  gsap.from('.chain .cc', {y:24, opacity:0, stagger:.1, duration:0.85, ease:E, scrollTrigger:{trigger:'.desk', start:'top 72%'}});
  gsap.from('.laptop', {y:45, opacity:0, duration:1.0, ease:E, scrollTrigger:{trigger:'.desk', start:'top 75%'}});
  gsap.from('.win', {opacity:0, x:30, duration:1.1, ease:E, scrollTrigger:{trigger:'.desk', start:'top 75%'}});

  // medforms: laptop settles, callouts drift in on a slight delay
  gsap.from('#mfLap', {y:60, rotate:2, opacity:0, duration:1.1, ease:E, scrollTrigger:{trigger:'.device', start:'top 78%'}});
  gsap.from('.device [data-float]', {scale:.94, opacity:0, y:20, duration:0.85, ease:E, stagger:.1, delay:.25, scrollTrigger:{trigger:'.device', start:'top 72%'}});
  gsap.to('#mfLap', {yPercent:-6, ease:'none', scrollTrigger:{trigger:'.medforms', start:'top bottom', end:'bottom top', scrub:0.3}});
  $$('.device [data-float]').forEach((el,i) => gsap.to(el, {y: (i%2? -10 : 10), duration: 3 + i*.4, ease:'sine.inOut', repeat:-1, yoyo:true, delay: 1.5}));

  // whatsapp: the conversation plays out
  gsap.from('#phone', {y:65, rotate:6, opacity:0, duration:1.1, ease:E, scrollTrigger:{trigger:'#phone', start:'top 85%'}});
  gsap.from('[data-bub]', {y:16, opacity:0, scale:.96, transformOrigin:'bottom left', duration:.7, ease:'back.out(1.6)', stagger:.35, delay:.4, scrollTrigger:{trigger:'#phone', start:'top 70%'}});
  gsap.from('[data-step]', {x:24, opacity:0, duration:0.8, ease:E, stagger:.14, scrollTrigger:{trigger:'#pipeline', start:'top 80%'}});
  gsap.from('.parrow', {opacity:0, duration:.5, stagger:.14, delay:.2, scrollTrigger:{trigger:'#pipeline', start:'top 80%'}});

  // counters
  $$('[data-count]').forEach(el => {
    const end = +el.dataset.count, suf = el.dataset.suffix || '', o = {v:0};
    ScrollTrigger.create({trigger:el, start:'top 90%', once:true, onEnter:() => gsap.to(o, {v:end, duration:1.3, ease:'power3.out', onUpdate:() => el.textContent = Math.round(o.v) + suf})});
  });

  // experience: road draws itself up the mountain, timeline fills
  ['#roadCore','#roadGlow'].forEach(s => { const p = $(s), L = p.getTotalLength(); gsap.fromTo(p, {strokeDasharray:L, strokeDashoffset:L}, {strokeDashoffset:0, ease:'none', scrollTrigger:{trigger:'.exp', start:'top 60%', end:'center 40%', scrub:0.5}}); });
  gsap.fromTo('#tlFill', {scaleY:0}, {scaleY:1, ease:'none', scrollTrigger:{trigger:'#tl', start:'top 65%', end:'bottom 65%', scrub:0.3}});

  // skills: the stack assembles as you scroll
  const plates = $$('[data-plate]');
  gsap.from(plates, {y:(i) => (i-2) * 70, opacity:0, ease:'power2.out', stagger:.05, scrollTrigger:{trigger:'#stackArea', start:'top 85%', end:'center 55%', scrub:0.4}});
  gsap.from('.sdesc', {x:20, opacity:0, stagger:.06, duration:0.85, ease:E, scrollTrigger:{trigger:'#stackArea', start:'top 55%'}});

  // contact horizon rises
  gsap.from('.horizon', {yPercent:14, opacity:.4, ease:'none', scrollTrigger:{trigger:'.contact', start:'top bottom', end:'top 20%', scrub:0.3}});

  addEventListener('load', () => ScrollTrigger.refresh());
})();
