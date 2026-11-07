(function () {
  const E = window.EL;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];

  /* ---------- общие поля ---------- */
  $$('[data-phone]').forEach((a) => { a.textContent = E.studio.phone; a.href = 'tel:' + E.studio.phoneHref; });
  $$('[data-vk]').forEach((a) => { a.href = E.studio.vk; });
  $$('[data-yandex]').forEach((a) => { a.href = E.studio.yandex.url; });
  $$('[data-address]').forEach((el) => { el.innerHTML = `${E.studio.address}<small>${E.studio.metro}</small>`; });
  $$('[data-hours]').forEach((el) => { el.innerHTML = `${E.studio.hours}<small>${E.studio.hoursNote}</small>`; });
  $('#year').textContent = new Date().getFullYear();

  /* ---------- шапка ---------- */
  const header = $('.header');
  addEventListener('scroll', () => header.classList.toggle('scrolled', scrollY > 10), { passive: true });
  const burger = $('#burger'), nav = $('#nav');
  burger.addEventListener('click', () => { const o = nav.classList.toggle('open'); burger.setAttribute('aria-expanded', o); });
  $$('a', nav).forEach((a) => a.addEventListener('click', () => nav.classList.remove('open')));

  /* ---------- hero ---------- */
  // слайдшоу: все фото работ, первое — с поталью; смена каждые 3,5 с
  const slides = [...E.works].sort((a, b) => (a.id === 'w9' ? -1 : b.id === 'w9' ? 1 : 0));
  const slideBox = $('#heroSlides'), dotBox = $('#heroDots');
  slideBox.innerHTML = slides.map((w, i) => `<img src="${w.src}" alt="" class="${i === 0 ? 'is-active' : ''}" ${i === 0 ? 'fetchpriority="high"' : 'loading="lazy"'}>`).join('');
  dotBox.innerHTML = slides.map((w, i) => `<button class="hero-dot" aria-label="${w.title}" aria-current="${i === 0}"><i></i></button>`).join('');
  const imgs = $$('img', slideBox), dots = $$('.hero-dot', dotBox);
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let cur = 0, timer = null;
  function show(n) {
    imgs[cur].classList.remove('is-active'); dots[cur].setAttribute('aria-current', 'false');
    cur = (n + imgs.length) % imgs.length;
    imgs[cur].classList.add('is-active'); dots[cur].setAttribute('aria-current', 'true');
    // перезапуск полоски прогресса на активной точке
    const bar = dots[cur].querySelector('i'); bar.style.animation = 'none'; void bar.offsetWidth; bar.style.animation = '';
  }
  function play() { if (reduce) return; clearInterval(timer); timer = setInterval(() => show(cur + 1), 3500); }
  dots.forEach((d, i) => d.addEventListener('click', () => { show(i); play(); }));
  document.addEventListener('visibilitychange', () => (document.hidden ? clearInterval(timer) : play()));
  play();



  /* ---------- прайс и работы — React-острова в islands.js ---------- */
  $$('.quick-card[data-cat]').forEach((a) => a.addEventListener('click', () => {
    window.dispatchEvent(new CustomEvent('el:price-cat', { detail: a.dataset.cat }));
  }));

  /* ---------- мастера ---------- */
  $('#mastersGrid').innerHTML = E.masters.map((m) => `
    <article class="master reveal">
      <h3>${m.name}</h3>
      <div class="role">${m.role}</div>
      <button class="btn btn-ghost btn-sm" data-book data-master="${m.id}">Записаться к ${m.dat}</button>
    </article>`).join('');

  /* ---------- отзывы ---------- */
  const track = $('#reviewsTrack');
  track.innerHTML = E.reviews.map((r, i) => `
    <article class="review ticket">
      <div class="ticket-in">${i % 2 ? '<i class="cut l"></i><i class="cut r"></i>' : '<i class="cut tl"></i><i class="cut tr"></i><i class="cut bl"></i><i class="cut br"></i>'}
        <div class="ticket-body">
          <div class="stars">★★★★★</div>
          <p>${r.text}</p>
          <footer><span><b>${r.name}</b>${r.master ? ' · мастер ' + E.master(r.master).short : ''}</span><span>${r.date}</span></footer>
        </div>
      </div>
    </article>`).join('');
  $$('[data-scroll]').forEach((b) => b.addEventListener('click', () => {
    track.scrollBy({ left: Number(b.dataset.scroll) * (track.firstElementChild.offsetWidth + 18), behavior: 'smooth' });
  }));

  /* ---------- курсы ---------- */
  $('#courseList').innerHTML = E.services.filter((s) => s.course).map((s) => `
    <div class="course"><div><b>${s.name}</b><small>${s.note}</small></div><div class="p">${E.rub(s.price)}</div></div>`).join('');

  /* ---------- карта Google ---------- */
  // Виджет Яндекс Карт с карточкой организации (как «Поделиться → Виджет с картой»)
  const y = E.studio.yandex;
  $('#map').innerHTML = `<iframe title="Everluxe на Яндекс Картах" loading="lazy" allowfullscreen src="https://yandex.ru/map-widget/v1/?ll=${y.ll[0]}%2C${y.ll[1]}&mode=search&oid=${y.oid}&ol=biz&z=16"></iframe>`;

  /* ---------- появление ---------- */
  const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { threshold: .12 });
  $$('.reveal').forEach((el) => io.observe(el));

  /* =========================================================
     Запись: услуга → мастер → дата/время → контакты
     ========================================================= */
  const modal = $('#modal'), body = $('#stepBody'), back = $('#backBtn'), next = $('#nextBtn'), foot = $('#modalFoot');
  let st;

  function open(pre = {}) {
    const svc = pre.service ? E.service(pre.service) : null;
    st = { step: 0, cat: svc ? svc.cat : 'mani', serviceId: pre.service || null, masterId: pre.master || null, date: E.toISO(new Date()), time: null, name: '', phone: '', comment: '' };
    if (st.serviceId) st.step = st.masterId ? 2 : 1;
    modal.classList.add('open'); modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    render();
  }
  function close() {
    modal.classList.remove('open'); modal.setAttribute('aria-hidden', 'true'); document.body.style.overflow = '';
  }
  document.addEventListener('click', (e) => {
    const b = e.target.closest('[data-book]');
    if (b) { e.preventDefault(); open({ service: b.dataset.service, master: b.dataset.master }); }
    if (e.target.closest('[data-close]')) close();
  });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && modal.classList.contains('open')) close(); });

  function slotsFor(date) {
    const s = E.service(st.serviceId);
    if (st.masterId && st.masterId !== 'any') return E.freeSlots(st.masterId, date, s.dur);
    const all = new Set(); E.masters.forEach((m) => E.freeSlots(m.id, date, s.dur).forEach((t) => all.add(t)));
    return [...all].sort();
  }

  function canNext() {
    return [!!st.serviceId, !!st.masterId, !!st.time, st.name.trim().length > 1 && st.phone.replace(/\D/g, '').length === 11][st.step];
  }

  function render() {
    $$('#steps i').forEach((i, k) => i.classList.toggle('on', k <= st.step));
    foot.style.display = st.step > 3 ? 'none' : 'flex';
    back.style.visibility = st.step === 0 ? 'hidden' : 'visible';
    next.textContent = st.step === 3 ? 'Подтвердить запись' : 'Далее';
    const s = st.serviceId && E.service(st.serviceId);

    if (st.step === 0) {
      body.innerHTML = `<div class="step-title">1 · Выберите услугу</div>
        <div class="cat-chips">${E.categories.map((c) => `<button class="chip" data-c="${c.id}" aria-pressed="${c.id === st.cat}">${c.name}</button>`).join('')}</div>
        <div class="opt-list">${E.services.filter((x) => x.cat === st.cat).map((x) => `
          <button class="opt" data-s="${x.id}" aria-pressed="${x.id === st.serviceId}">
            <span><b>${x.name}</b><small>${x.course ? x.note : E.dur(x.dur)}</small></span><span class="r">${x.from ? 'от ' : ''}${E.rub(x.price)}</span>
          </button>`).join('')}</div>`;
    }
    if (st.step === 1) {
      body.innerHTML = `<div class="step-title">2 · Выберите мастера</div><div class="opt-list">
        <button class="opt" data-mm="any" aria-pressed="${st.masterId === 'any'}"><span><b>Любой мастер</b><small>Покажем больше свободного времени</small></span></button>
        ${E.masters.map((m) => `
        <button class="opt" data-mm="${m.id}" aria-pressed="${m.id === st.masterId}">
          <span><b>${m.name}</b><small>${m.role}</small></span>
        </button>`).join('')}</div>`;
    }
    if (st.step === 2) {
      const days = Array.from({ length: 14 }, (_, i) => E.addDays(new Date(), i));
      const slots = slotsFor(st.date);
      body.innerHTML = `<div class="step-title">3 · Дата и время</div>
        <div class="days">${days.map((d) => { const iso = E.toISO(d); return `<button class="day" data-d="${iso}" aria-pressed="${iso === st.date}"><small>${d.toLocaleDateString('ru-RU', { weekday: 'short' })}</small><b>${d.getDate()}</b><small>${d.toLocaleDateString('ru-RU', { month: 'short' }).replace('.', '')}</small></button>`; }).join('')}</div>
        ${slots.length ? `<div class="slots">${slots.map((t) => `<button class="slot" data-t="${t}" aria-pressed="${t === st.time}">${t}</button>`).join('')}</div>`
          : `<div class="empty">${E.studio.closedDays.includes(new Date(st.date + 'T12:00').getDay()) ? 'Воскресенье — выходной, выберите другой день.' : 'На этот день всё занято — выберите другую дату или любого мастера.'}</div>`}`;
      const sel = $('.day[aria-pressed="true"]', body); if (sel) sel.scrollIntoView({ block: 'nearest', inline: 'nearest' });
    }
    if (st.step === 3) {
      const m = st.masterId === 'any' ? null : E.master(st.masterId);
      body.innerHTML = `<div class="step-title">4 · Контакты</div>
        <div class="summary">
          <span><b>${s.name}</b> — ${s.from ? 'от ' : ''}${E.rub(s.price)}</span>
          <span>${new Date(st.date + 'T12:00').toLocaleDateString('ru-RU', { weekday: 'long', day: 'numeric', month: 'long' })}, ${st.time}</span>
          <span>Мастер: ${m ? m.name : 'любой свободный'}</span>
        </div>
        <div class="field"><label for="fName">Имя</label><input id="fName" autocomplete="name" value="${st.name}" placeholder="Как к вам обращаться"></div>
        <div class="field"><label for="fPhone">Телефон</label><input id="fPhone" type="tel" inputmode="tel" autocomplete="tel" value="${st.phone}" placeholder="+7 (___) ___-__-__"></div>
        <div class="field"><label for="fCom">Комментарий</label><textarea id="fCom" placeholder="Пожелания по дизайну, длине, снятию">${st.comment}</textarea></div>`;
      $('#fName', body).addEventListener('input', (e) => { st.name = e.target.value; next.disabled = !canNext(); });
      $('#fPhone', body).addEventListener('input', (e) => { e.target.value = st.phone = maskPhone(e.target.value); next.disabled = !canNext(); });
      $('#fCom', body).addEventListener('input', (e) => { st.comment = e.target.value; });
    }
    if (st.step === 4) {
      const m = E.master(st.assigned);
      body.innerHTML = `<div class="done"><div class="ok">✓</div>
        <h3 style="font-size:34px">Вы записаны</h3>
        <p>${s.name}<br>${new Date(st.date + 'T12:00').toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' })} в ${st.time} · мастер ${m.name}</p>
        <p style="font-size:13px">Администратор подтвердит запись по&nbsp;телефону. Заявка уже видна в&nbsp;<a href="admin.html">CRM (демо)</a>.</p>
        <button class="btn btn-dark" data-close style="margin-top:12px">Отлично</button></div>`;
    }
    next.disabled = !canNext();
  }

  function maskPhone(v) {
    let d = v.replace(/\D/g, '');
    if (d.startsWith('8')) d = '7' + d.slice(1);
    if (!d.startsWith('7')) d = '7' + d;
    d = d.slice(0, 11);
    const p = [d.slice(1, 4), d.slice(4, 7), d.slice(7, 9), d.slice(9, 11)];
    let out = '+7';
    if (p[0]) out += ' (' + p[0] + (p[0].length === 3 ? ')' : '');
    if (p[1]) out += ' ' + p[1];
    if (p[2]) out += '-' + p[2];
    if (p[3]) out += '-' + p[3];
    return out;
  }

  body.addEventListener('click', (e) => {
    const t = e.target.closest('button'); if (!t) return;
    if (t.dataset.c) { st.cat = t.dataset.c; render(); }
    if (t.dataset.s) { st.serviceId = t.dataset.s; st.time = null; st.step = st.masterId ? 2 : 1; render(); }
    if (t.dataset.mm) { st.masterId = t.dataset.mm; st.time = null; st.step = 2; render(); }
    if (t.dataset.d) { st.date = t.dataset.d; st.time = null; render(); }
    if (t.dataset.t) { st.time = t.dataset.t; render(); }
  });
  back.addEventListener('click', () => { st.step = Math.max(0, st.step - 1); render(); });
  next.addEventListener('click', () => {
    if (!canNext()) return;
    if (st.step < 3) { st.step++; render(); return; }
    const s = E.service(st.serviceId);
    let mid = st.masterId;
    if (mid === 'any') mid = E.masters.find((m) => E.freeSlots(m.id, st.date, s.dur).includes(st.time)).id;
    E.addBooking({ name: st.name.trim(), phone: st.phone, serviceId: s.id, masterId: mid, date: st.date, time: st.time, dur: s.dur, price: s.price, source: 'site', comment: st.comment.trim() });
    st.assigned = mid; st.step = 4; render();
  });
})();
