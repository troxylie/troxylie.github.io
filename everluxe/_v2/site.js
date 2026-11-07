(function () {
  const E = window.EL;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const dateObj = (iso) => new Date(iso + 'T12:00');
  const mapUrl = 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(E.studio.mapQuery);

  /* ---------- общие поля ---------- */
  $$('[data-phone]').forEach((a) => { a.textContent = E.studio.phone; a.href = 'tel:' + E.studio.phoneHref; });
  $$('[data-vk]').forEach((a) => { a.href = E.studio.vk; });
  $$('[data-map]').forEach((a) => { a.href = mapUrl; });
  $$('[data-metro]').forEach((el) => { el.textContent = E.studio.metro; });
  $('#year').textContent = new Date().getFullYear();

  /* ---------- шапка и меню ---------- */
  const nav = $('#nav'), toggle = $('#navToggle');
  addEventListener('scroll', () => nav.classList.toggle('is-scrolled', scrollY > 8), { passive: true });
  toggle.addEventListener('click', () => {
    const open = nav.classList.toggle('menu-open');
    toggle.setAttribute('aria-expanded', open);
    toggle.setAttribute('aria-label', open ? 'Закрыть меню' : 'Открыть меню');
    document.body.style.overflow = open ? 'hidden' : '';
  });
  $$('#navLinks a').forEach((a) => a.addEventListener('click', () => {
    nav.classList.remove('menu-open'); toggle.setAttribute('aria-expanded', 'false'); toggle.setAttribute('aria-label', 'Открыть меню'); document.body.style.overflow = '';
  }));

  /* ---------- вход героя один раз ---------- */
  requestAnimationFrame(() => requestAnimationFrame(() => $('[data-enter]').classList.add('is-in')));

  /* ---------- карта Google ---------- */
  $('#map').innerHTML = `<iframe title="Everluxe на карте Google" loading="lazy" referrerpolicy="no-referrer-when-downgrade" src="https://maps.google.com/maps?q=${encodeURIComponent(E.studio.mapQuery)}&z=16&hl=ru&output=embed"></iframe>`;

  /* ---------- прайс ---------- */
  const rowHTML = (s) => `<li><button class="row" data-book data-service="${s.id}">
      <span class="row__name"><span>${s.name}</span><small>${s.note}${s.course ? '' : ' · ' + E.dur(s.dur)}</small></span>
      <span class="row__price">${s.from ? 'от ' : ''}${E.rub(s.price)}</span><span class="row__go" aria-hidden="true">→</span>
    </button></li>`;
  const group = (cat, cls) => `<div class="group ${cls}"><span class="t-label">${E.categories.find((c) => c.id === cat).name}</span>
    <ul class="rows">${E.services.filter((s) => s.cat === cat).map(rowHTML).join('')}</ul></div>`;
  $('#groups').innerHTML = group('mani', 'span-6') + `<div class="span-6" style="display:grid;gap:56px">${group('pedi', '')}${group('design', '')}</div>`;
  $('#courseRows').innerHTML = E.services.filter((s) => s.course).map(rowHTML).join('');

  /* ---------- работы (без фото героя) ---------- */
  $('#worksGrid').innerHTML = E.works.filter((w) => w.id !== 'w9').map((w) => {
    const m = E.master(w.master);
    return `<figure class="work">
      <button class="work__img" data-book data-master="${m.id}" aria-label="Записаться к мастеру ${m.name}"><img src="${w.src}" alt="${w.alt}" loading="lazy" width="600" height="600"></button>
      <figcaption><b>${w.title}</b>
        <button class="link-arrow" data-book data-master="${m.id}"><span>Мастер ${m.short}</span><span class="arr" aria-hidden="true">→</span></button>
      </figcaption>
    </figure>`;
  }).join('');

  /* ---------- мастера ---------- */
  $('#mastersGrid').innerHTML = E.masters.map((m) => `
    <button class="master" data-book data-master="${m.id}">
      <h3>${m.name}</h3>
      <span class="master__role">${m.role}</span>
      <span data-assumed>Опыт ${m.exp}</span>
      <span class="master__tags">${m.tags.join(' · ')}</span>
      <span class="link-arrow"><span>Записаться к ${m.dat}</span><span class="arr" aria-hidden="true">→</span></span>
    </button>`).join('');

  /* ---------- отзывы ---------- */
  const cuts = ['<i class="cut tl"></i><i class="cut tr"></i><i class="cut bl"></i><i class="cut br"></i>', '<i class="cut l"></i><i class="cut r"></i>'];
  $('#reviewsGrid').innerHTML = E.reviews.map((r, i) => `
    <article class="review ticket"${r.real ? '' : ' data-assumed'}>
      <div class="ticket__in">${cuts[i % 2]}
        <span class="stars" aria-label="5 из 5">★★★★★</span>
        <blockquote>${r.text}</blockquote>
        <footer><b>${r.name}</b>${r.master ? ' · мастер ' + E.master(r.master).short : ''}<br>${r.date}</footer>
      </div>
    </article>`).join('');

  /* ---------- панель записи на телефоне ---------- */
  const bar = $('#actionbar');
  let heroBtnVisible = true, closeVisible = false;
  const syncBar = () => bar.classList.toggle('is-on', !heroBtnVisible && !closeVisible);
  new IntersectionObserver(([e]) => { heroBtnVisible = e.isIntersecting; syncBar(); }).observe($('#heroBtn'));
  new IntersectionObserver(([e]) => { closeVisible = e.isIntersecting; syncBar(); }).observe($('.close'));

  /* =========================================================
     Запись: услуга → мастер → дата и время → контакты
     ========================================================= */
  const modal = $('#modal'), body = $('#stepBody'), back = $('#backBtn'), next = $('#nextBtn'), foot = $('#modalFoot');
  let st, lastFocus;

  function open(pre = {}) {
    const svc = pre.service ? E.service(pre.service) : null;
    st = { step: 0, cat: svc ? svc.cat : 'mani', serviceId: pre.service || null, masterId: pre.master || null, date: E.toISO(new Date()), time: null, name: '', phone: '', comment: '', tried: false };
    if (st.serviceId) st.step = st.masterId ? 2 : 1;
    lastFocus = document.activeElement;
    modal.classList.add('open'); modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    render();
    setTimeout(() => $('.modal__close').focus(), 60);
  }
  function close() {
    modal.classList.remove('open'); modal.setAttribute('aria-hidden', 'true'); document.body.style.overflow = '';
    if (lastFocus) lastFocus.focus();
  }
  document.addEventListener('click', (e) => {
    const b = e.target.closest('[data-book]');
    if (b) { e.preventDefault(); open({ service: b.dataset.service, master: b.dataset.master }); return; }
    if (e.target.closest('[data-close]')) close();
  });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && modal.classList.contains('open')) close(); });

  function slotsFor(date) {
    const s = E.service(st.serviceId);
    if (st.masterId && st.masterId !== 'any') return E.freeSlots(st.masterId, date, s.dur);
    const all = new Set(); E.masters.forEach((m) => E.freeSlots(m.id, date, s.dur).forEach((t) => all.add(t)));
    return [...all].sort();
  }
  const phoneOk = () => st.phone.replace(/\D/g, '').length === 11;
  const nameOk = () => st.name.trim().length > 1;
  function canNext() { return [!!st.serviceId, !!st.masterId, !!st.time, true][st.step]; }

  function render() {
    $$('#steps i').forEach((i, k) => i.classList.toggle('on', k <= st.step));
    foot.style.display = st.step > 3 ? 'none' : 'flex';
    back.style.visibility = st.step === 0 ? 'hidden' : 'visible';
    next.textContent = st.step === 3 ? 'Подтвердить запись' : 'Дальше';
    const s = st.serviceId && E.service(st.serviceId);

    if (st.step === 0) {
      body.innerHTML = `<div class="t-label step-title">1 · Услуга</div>
        <div class="chips">${E.categories.map((c) => `<button class="chip" data-c="${c.id}" aria-pressed="${c.id === st.cat}">${c.name}</button>`).join('')}</div>
        <div class="opt-list">${E.services.filter((x) => x.cat === st.cat).map((x) => `
          <button class="opt" data-s="${x.id}" aria-pressed="${x.id === st.serviceId}">
            <span><b>${x.name}</b><small>${x.course ? x.note : E.dur(x.dur)}</small></span><span class="r">${x.from ? 'от ' : ''}${E.rub(x.price)}</span>
          </button>`).join('')}</div>`;
    }
    if (st.step === 1) {
      body.innerHTML = `<div class="t-label step-title">2 · Мастер</div><div class="opt-list">
        <button class="opt" data-mm="any" aria-pressed="${st.masterId === 'any'}"><span><b>Любой свободный мастер</b><small>Больше вариантов времени</small></span></button>
        ${E.masters.map((m) => `<button class="opt" data-mm="${m.id}" aria-pressed="${m.id === st.masterId}"><span><b>${m.name}</b><small>${m.role}</small></span></button>`).join('')}</div>`;
    }
    if (st.step === 2) {
      const days = Array.from({ length: 14 }, (_, i) => E.addDays(new Date(), i));
      const slots = slotsFor(st.date);
      body.innerHTML = `<div class="t-label step-title">3 · Дата и время</div>
        <div class="days">${days.map((d) => { const iso = E.toISO(d); return `<button class="day" data-d="${iso}" aria-pressed="${iso === st.date}" aria-label="${d.toLocaleDateString('ru-RU', { weekday: 'long', day: 'numeric', month: 'long' })}"><small>${d.toLocaleDateString('ru-RU', { weekday: 'short' })}</small><b>${d.getDate()}</b><small>${d.toLocaleDateString('ru-RU', { month: 'short' }).replace('.', '')}</small></button>`; }).join('')}</div>
        ${slots.length ? `<div class="slots">${slots.map((t) => `<button class="slot" data-t="${t}" aria-pressed="${t === st.time}">${t}</button>`).join('')}</div>`
          : '<div class="empty">На этот день всё занято. Выберите другой день или любого мастера.</div>'}`;
      const sel = $('.day[aria-pressed="true"]', body); if (sel) sel.scrollIntoView({ block: 'nearest', inline: 'nearest' });
    }
    if (st.step === 3) {
      const m = st.masterId === 'any' ? null : E.master(st.masterId);
      body.innerHTML = `<div class="t-label step-title">4 · Контакты</div>
        <div class="summary">
          <span><b>${s.name}</b> — ${s.from ? 'от ' : ''}${E.rub(s.price)}</span>
          <span>${dateObj(st.date).toLocaleDateString('ru-RU', { weekday: 'long', day: 'numeric', month: 'long' })}, ${st.time}</span>
          <span>Мастер: ${m ? m.name : 'любой свободный'}</span>
        </div>
        <div class="field"><label for="fName">Имя</label><input id="fName" autocomplete="name" value="${st.name}"><span class="err" id="eName"></span></div>
        <div class="field"><label for="fPhone">Телефон</label><input id="fPhone" type="tel" inputmode="tel" autocomplete="tel" value="${st.phone}" placeholder="+7 (___) ___-__-__"><span class="err" id="ePhone"></span></div>
        <div class="field"><label for="fCom">Пожелания</label><textarea id="fCom">${st.comment}</textarea></div>`;
      $('#fName', body).addEventListener('input', (e) => { st.name = e.target.value; if (st.tried) showErrors(); });
      $('#fPhone', body).addEventListener('input', (e) => { e.target.value = st.phone = maskPhone(e.target.value); if (st.tried) showErrors(); });
      $('#fCom', body).addEventListener('input', (e) => { st.comment = e.target.value; });
    }
    if (st.step === 4) {
      const m = E.master(st.assigned);
      body.innerHTML = `<div class="done">
        <p class="t-label" style="color:var(--ink);margin:0">Запись создана</p>
        <p style="font-family:var(--font-display);font-size:28px;line-height:1.2;color:var(--ink)">${s.name}<br>${dateObj(st.date).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' })} в ${st.time}, мастер ${m.name}</p>
        <p>Администратор позвонит, чтобы подтвердить запись. Заявка уже видна в <a class="link" href="admin.html">CRM (демо)</a>.</p>
        <button class="btn" data-close style="margin-top:24px">Готово</button></div>`;
    }
    next.disabled = !canNext();
  }

  function showErrors() {
    $('#eName').textContent = nameOk() ? '' : 'Напишите, как к вам обращаться';
    $('#ePhone').textContent = phoneOk() ? '' : 'Нужен номер из 11 цифр';
    return nameOk() && phoneOk();
  }

  function maskPhone(v) {
    let d = v.replace(/\D/g, '');
    if (!d) return '';
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
    st.tried = true;
    if (!showErrors()) { (nameOk() ? $('#fPhone') : $('#fName')).focus(); return; }
    const s = E.service(st.serviceId);
    let mid = st.masterId;
    if (mid === 'any') mid = E.masters.find((m) => E.freeSlots(m.id, st.date, s.dur).includes(st.time)).id;
    E.addBooking({ name: st.name.trim(), phone: st.phone, serviceId: s.id, masterId: mid, date: st.date, time: st.time, dur: s.dur, price: s.price, source: 'site', comment: st.comment.trim() });
    st.assigned = mid; st.step = 4; render();
  });
})();
