(function () {
  const E = window.EL;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const initials = (n) => n.split(' ').map((p) => p[0]).join('');

  const STATUS = {
    new: { label: 'Новая', c: 'var(--st-new)' },
    confirmed: { label: 'Подтверждена', c: 'var(--st-confirmed)' },
    done: { label: 'Выполнена', c: 'var(--st-done)' },
    cancelled: { label: 'Отменена', c: 'var(--st-cancelled)' },
  };
  const SOURCE = { site: 'Сайт', phone: 'Звонок', vk: 'ВКонтакте', admin: 'Админ' };

  const state = { date: E.toISO(new Date()), view: 'grid', status: 'all', q: '' };
  const ROW = 44; // px на 30 минут
  const dateObj = (iso) => new Date(iso + 'T12:00');

  /* ---------- отрисовка ---------- */
  function dayList() { return E.bookings().filter((b) => b.date === state.date); }
  function matches(b) {
    if (state.status !== 'all' && b.status !== state.status) return false;
    if (!state.q) return true;
    const q = state.q.toLowerCase();
    return b.name.toLowerCase().includes(q) || b.phone.replace(/\D/g, '').includes(q.replace(/\D/g, '') || '§');
  }

  function render() {
    const d = dateObj(state.date);
    const today = E.toISO(new Date());
    const lbl = d.toLocaleDateString('ru-RU', { weekday: 'long', day: 'numeric', month: 'long' });
    $('#dateLabel').textContent = state.date === today ? 'Сегодня, ' + lbl : lbl[0].toUpperCase() + lbl.slice(1);
    $('#datePick').value = state.date;
    const newCount = E.bookings().filter((b) => b.status === 'new').length;
    $('#newCount').textContent = newCount || '';
    renderKpis();
    renderFilters();
    if (state.view === 'grid') renderGrid(); else renderList();
  }

  function renderKpis() {
    const list = dayList();
    const active = list.filter((b) => b.status !== 'cancelled');
    const revenue = active.reduce((s, b) => s + b.price, 0);
    const doneRev = list.filter((b) => b.status === 'done').reduce((s, b) => s + b.price, 0);
    const capacity = E.masters.length * (E.studio.close - E.studio.open) * 60;
    const load = Math.round(active.reduce((s, b) => s + b.dur, 0) / capacity * 100);
    const fresh = E.bookings().filter((b) => b.status === 'new');
    const fromSite = fresh.filter((b) => b.source === 'site').length;
    $('#kpis').innerHTML = `
      <div class="kpi"><span>Записей на день</span><b>${active.length}</b><small>${list.length - active.length} отмен</small></div>
      <div class="kpi accent"><span>Выручка дня (план)</span><b>${E.rub(revenue)}</b><small>получено ${E.rub(doneRev)}</small></div>
      <div class="kpi"><span>Загрузка мастеров</span><b>${load}%</b><div class="bar"><i style="width:${Math.min(load, 100)}%"></i></div></div>
      <div class="kpi"><span>Ждут подтверждения</span><b>${fresh.length}</b><small>${fromSite} с сайта</small></div>`;
  }

  function renderFilters() {
    const base = state.view === 'grid' ? dayList() : E.bookings().filter((b) => b.date >= state.date);
    const count = (s) => base.filter((b) => s === 'all' || b.status === s).length;
    $('#statusFilter').innerHTML = [['all', 'Все', 'var(--text)'], ...Object.entries(STATUS).map(([k, v]) => [k, v.label, v.c])]
      .map(([k, l, c]) => `<button class="fchip" data-st="${k}" aria-pressed="${state.status === k}"><i style="background:${c}"></i>${l} <small>${count(k)}</small></button>`).join('');
  }

  function renderGrid() {
    const list = dayList().filter(matches);
    const open = E.studio.open, close = E.studio.close;
    const rows = (close - open) * 2;
    const times = Array.from({ length: rows }, (_, i) => (i % 2 ? '' : E.pad(open + i / 2) + ':00'));
    const cols = E.masters.map((m) => {
      const mine = list.filter((b) => b.masterId === m.id);
      const blocks = mine.map((b) => {
        const s = E.service(b.serviceId) || { name: 'Услуга' };
        const top = (E.toMin(b.time) - open * 60) / 30 * ROW;
        const h = Math.max(b.dur / 30 * ROW - 4, 38);
        return `<button class="bk ${b.status}" data-id="${b.id}" style="top:${top + 2}px;height:${h}px;--c:${STATUS[b.status].c}">
          ${b.source === 'site' && b.status === 'new' ? '<span class="src">сайт</span>' : ''}
          <b>${esc(b.name)}</b><span class="t">${b.time}–${E.fromMin(E.toMin(b.time) + b.dur)}</span>${h > 60 ? `<span>${esc(s.name)}</span>` : ''}</button>`;
      }).join('');
      return `<div class="col" data-m="${m.id}" style="height:${rows * ROW}px">${blocks}</div>`;
    }).join('');

    const nowMin = new Date().getHours() * 60 + new Date().getMinutes();
    const showNow = state.date === E.toISO(new Date()) && nowMin > open * 60 && nowMin < close * 60;
    $('#gridView').innerHTML = `<div class="sched"><div class="sched-inner" style="--cols:${E.masters.length}">
      <div class="sched-head"><div></div>${E.masters.map((m) => {
        const n = dayList().filter((b) => b.masterId === m.id && b.status !== 'cancelled').length;
        return `<div><span class="av" style="background:${m.tone[0]}">${initials(m.name)}</span><span><b>${m.name}</b><small>${n} ${plural(n, 'запись', 'записи', 'записей')}</small></span></div>`;
      }).join('')}</div>
      <div class="sched-body"><div class="times">${times.map((t) => `<div>${t}</div>`).join('')}</div>${cols}
        ${showNow ? `<div class="now" style="top:${(nowMin - open * 60) / 30 * ROW}px"></div>` : ''}
      </div></div></div>`;
  }

  function renderList() {
    const list = E.bookings().filter((b) => b.date >= state.date).filter(matches)
      .sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time)).slice(0, 120);
    if (!list.length) { $('#listView').innerHTML = '<div class="empty">Записей не найдено</div>'; return; }
    $('#listView').innerHTML = `<div class="list-wrap"><table>
      <thead><tr><th>Дата и время</th><th>Клиент</th><th>Услуга</th><th>Мастер</th><th>Сумма</th><th>Источник</th><th>Статус</th></tr></thead>
      <tbody>${list.map((b) => {
        const s = E.service(b.serviceId) || { name: '—' }; const m = E.master(b.masterId) || { name: '—' };
        return `<tr data-id="${b.id}">
          <td><b>${dateObj(b.date).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })}</b><small>${b.time}, ${E.dur(b.dur)}</small></td>
          <td><b>${esc(b.name)}</b><small>${esc(b.phone)}</small></td>
          <td>${esc(s.name)}</td><td>${m.name}</td>
          <td class="money">${E.rub(b.price)}</td>
          <td><span class="src-tag ${b.source}">${SOURCE[b.source] || b.source}</span></td>
          <td><span class="badge" style="--c:${STATUS[b.status].c}">${STATUS[b.status].label}</span></td></tr>`;
      }).join('')}</tbody></table></div>`;
  }

  function plural(n, one, few, many) {
    const m10 = n % 10, m100 = n % 100;
    if (m10 === 1 && m100 !== 11) return one;
    if (m10 >= 2 && m10 <= 4 && (m100 < 10 || m100 >= 20)) return few;
    return many;
  }

  /* ---------- карточка записи ---------- */
  const drawer = $('#drawer');
  function openDrawer(id) {
    const b = E.bookings().find((x) => x.id === id); if (!b) return;
    const s = E.service(b.serviceId) || { name: '—' }; const m = E.master(b.masterId) || { name: '—' };
    const history = E.bookings().filter((x) => x.phone === b.phone && x.status === 'done').length;
    $('#drawerBox').innerHTML = `
      <div class="dr-head">
        <div><span class="badge" style="--c:${STATUS[b.status].c}">${STATUS[b.status].label}</span>
          <h2>${esc(b.name)}</h2><a href="tel:${b.phone.replace(/[^\d+]/g, '')}">${esc(b.phone)}</a></div>
        <button class="ic" data-close aria-label="Закрыть">×</button>
      </div>
      <div class="dr-card">
        <div class="dr-row"><span>Услуга</span><b>${esc(s.name)}</b></div>
        <div class="dr-row"><span>Мастер</span><b>${m.name}</b></div>
        <div class="dr-row"><span>Дата</span><b>${dateObj(b.date).toLocaleDateString('ru-RU', { weekday: 'short', day: 'numeric', month: 'long' })}</b></div>
        <div class="dr-row"><span>Время</span><b>${b.time} – ${E.fromMin(E.toMin(b.time) + b.dur)}</b></div>
        <div class="dr-row"><span>Стоимость</span><b>${E.rub(b.price)}</b></div>
        <div class="dr-row"><span>Источник</span><b>${SOURCE[b.source] || b.source}</b></div>
        <div class="dr-row"><span>Визитов ранее</span><b>${history}</b></div>
      </div>
      <div><div class="dr-label">Статус</div><div class="st-btns">${Object.entries(STATUS).map(([k, v]) => `<button class="st-btn" data-set="${k}" aria-pressed="${b.status === k}" style="--c:${v.c}"><i></i>${v.label}</button>`).join('')}</div></div>
      <div><div class="dr-label">Комментарий</div><textarea id="drComment" rows="3" placeholder="Заметка для мастера">${esc(b.comment)}</textarea></div>
      <div class="dr-actions"><button class="danger" data-del>Удалить</button><button class="btn-gold" data-save>Сохранить</button></div>`;
    $('#drawerBox').dataset.id = id;
    drawer.classList.add('open'); drawer.setAttribute('aria-hidden', 'false');
  }
  function closeDrawer() { drawer.classList.remove('open'); drawer.setAttribute('aria-hidden', 'true'); }
  drawer.addEventListener('click', (e) => {
    const id = $('#drawerBox').dataset.id;
    if (e.target.closest('[data-close]')) return closeDrawer();
    const set = e.target.closest('[data-set]');
    if (set) { E.updateBooking(id, { status: set.dataset.set }); render(); openDrawer(id); toast('Статус обновлён', STATUS[set.dataset.set].label); }
    if (e.target.closest('[data-save]')) { E.updateBooking(id, { comment: $('#drComment').value }); closeDrawer(); render(); toast('Сохранено', 'Комментарий обновлён'); }
    if (e.target.closest('[data-del]') && confirm('Удалить запись? Это действие нельзя отменить.')) { E.removeBooking(id); closeDrawer(); render(); toast('Запись удалена', ''); }
  });

  /* ---------- новая запись ---------- */
  const dialog = $('#dialog'), form = $('#newForm');
  $('#fService').innerHTML = E.categories.map((c) => `<optgroup label="${c.name}">${E.services.filter((s) => s.cat === c.id).map((s) => `<option value="${s.id}">${s.name} — ${E.rub(s.price)}</option>`).join('')}</optgroup>`).join('');
  $('#fMaster').innerHTML = E.masters.map((m) => `<option value="${m.id}">${m.name}</option>`).join('');
  function fillTimes() {
    const s = E.service($('#fService').value);
    const slots = E.freeSlots($('#fMaster').value, $('#fDate').value, s.dur);
    $('#fTime').innerHTML = slots.length ? slots.map((t) => `<option>${t}</option>`).join('') : '<option value="">Нет свободного времени</option>';
  }
  ['#fService', '#fMaster', '#fDate'].forEach((s) => $(s).addEventListener('change', fillTimes));
  function openDialog(pre = {}) {
    form.reset();
    $('#fDate').value = state.date;
    if (pre.master) $('#fMaster').value = pre.master;
    $('#fService').value = 'm2';
    fillTimes();
    if (pre.time && [...$('#fTime').options].some((o) => o.value === pre.time)) $('#fTime').value = pre.time;
    dialog.classList.add('open'); dialog.setAttribute('aria-hidden', 'false');
    setTimeout(() => form.name.focus(), 50);
  }
  function closeDialog() { dialog.classList.remove('open'); dialog.setAttribute('aria-hidden', 'true'); }
  dialog.addEventListener('click', (e) => { if (e.target.closest('[data-close-d]')) closeDialog(); });
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const f = Object.fromEntries(new FormData(form));
    if (!f.time) return toast('Нет времени', 'Выберите другую дату или мастера');
    const s = E.service(f.serviceId);
    E.addBooking({ ...f, dur: s.dur, price: s.price, status: 'confirmed', source: 'admin' });
    state.date = f.date; closeDialog(); render();
    toast('Запись создана', `${f.name}, ${f.time}`);
  });

  /* ---------- события ---------- */
  $('#addBtn').addEventListener('click', () => openDialog());
  $('#prevDay').addEventListener('click', () => { state.date = E.toISO(E.addDays(dateObj(state.date), -1)); render(); });
  $('#nextDay').addEventListener('click', () => { state.date = E.toISO(E.addDays(dateObj(state.date), 1)); render(); });
  $('#todayBtn').addEventListener('click', () => { state.date = E.toISO(new Date()); render(); });
  $('#dateLabel').addEventListener('click', () => { const p = $('#datePick'); p.showPicker ? p.showPicker() : p.click(); });
  $('#datePick').addEventListener('change', (e) => { if (e.target.value) { state.date = e.target.value; render(); } });
  $('#search').addEventListener('input', (e) => { state.q = e.target.value.trim(); render(); });
  $('#statusFilter').addEventListener('click', (e) => { const c = e.target.closest('[data-st]'); if (c) { state.status = c.dataset.st; render(); } });
  $$('.seg button').forEach((b) => b.addEventListener('click', () => {
    state.view = b.dataset.view;
    $$('.seg button').forEach((x) => x.setAttribute('aria-selected', x === b));
    $('#gridView').hidden = state.view !== 'grid'; $('#listView').hidden = state.view !== 'list';
    render();
  }));
  document.addEventListener('click', (e) => {
    const bk = e.target.closest('[data-id]');
    if (bk && !e.target.closest('#drawer')) return openDrawer(bk.dataset.id);
    const col = e.target.closest('.col');
    if (col && e.target === col) {
      const y = e.clientY - col.getBoundingClientRect().top;
      const t = E.fromMin(E.studio.open * 60 + Math.floor(y / ROW) * 30);
      openDialog({ master: col.dataset.m, time: t });
    }
  });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') { closeDrawer(); closeDialog(); } });
  $('#resetDemo').addEventListener('click', () => { if (confirm('Сбросить все записи к демо-данным?')) { E.resetDemo(); render(); toast('Готово', 'Демо-данные пересозданы'); } });

  // Запись с сайта в соседней вкладке появляется сразу
  let known = new Set(E.bookings().map((b) => b.id));
  addEventListener('storage', (e) => {
    if (e.key !== 'everluxe.bookings.v2') return;
    E.saveBookings(JSON.parse(e.newValue || '[]'));
    E.bookings().filter((b) => !known.has(b.id)).forEach((b) => toast('Новая запись с сайта', `${b.name} · ${b.date.split('-').reverse().join('.')} в ${b.time}`));
    known = new Set(E.bookings().map((b) => b.id));
    render();
  });

  function toast(title, text) {
    const el = document.createElement('div'); el.className = 'toast';
    el.innerHTML = `<b>${esc(title)}</b><span>${esc(text)}</span>`;
    $('#toasts').appendChild(el); setTimeout(() => el.remove(), 3800);
  }

  render();
  // прокрутка ленты к текущему времени
  const nowEl = $('.now'); if (nowEl) nowEl.scrollIntoView({ block: 'center' });
})();
