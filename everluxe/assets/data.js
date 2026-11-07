/* Everluxe — общие данные сайта и CRM (демо).
   Записи хранятся в localStorage этого браузера: запись с сайта сразу видна в admin.html. */
(function () {
  const STORAGE_KEY = 'everluxe.bookings.v2';

  const studio = {
    name: 'Everluxe',
    tagline: 'nail studio',
    // Данные с Яндекс Карт: https://yandex.ru/maps/org/everluxe/164558803767/
    city: 'Самара',
    street: 'Ново-Вокзальная ул., 130',
    address: 'Ново-Вокзальная ул., 130, Самара',
    metro: 'Остановка «Улица Фадеева» — 115 м',
    phone: '+7 (927) 755-85-99',
    phoneHref: '+79277558599',
    hours: 'Пн–Сб 9:00–21:00', hoursNote: 'Воскресенье — выходной',
    yandex: { oid: '164558803767', ll: [50.214109, 53.239229], url: 'https://yandex.ru/maps/org/everluxe/164558803767/' },
    vk: 'https://vk.ru/ever_luxe',
    open: 9, close: 21, step: 30,
    closedDays: [0], // воскресенье
  };

  const categories = [
    { id: 'mani', name: 'Маникюр' },
    { id: 'pedi', name: 'Педикюр' },
    { id: 'design', name: 'Дизайн' },
    { id: 'brows', name: 'Брови и ресницы' },
    { id: 'courses', name: 'Обучение' },
  ];

  const services = [
    { id: 'm1', cat: 'mani', name: 'Маникюр без покрытия', note: 'Комбинированный или аппаратный', price: 1200, dur: 45 },
    { id: 'm2', cat: 'mani', name: 'Маникюр + гель-лак', note: 'Выравнивание, однотонное покрытие', price: 2300, dur: 105, hit: true },
    { id: 'm3', cat: 'mani', name: 'Укрепление гелем + покрытие', note: 'Для тонких и ломких ногтей', price: 2800, dur: 120 },
    { id: 'm4', cat: 'mani', name: 'Наращивание', note: 'До 2-й длины, любая форма', price: 3500, dur: 150 },
    { id: 'm5', cat: 'mani', name: 'Коррекция наращивания', note: 'До 4 недель носки', price: 3000, dur: 135 },
    { id: 'm6', cat: 'mani', name: 'Снятие покрытия', note: 'Без последующего покрытия', price: 300, dur: 15, from: false },
    { id: 'p1', cat: 'pedi', name: 'Педикюр без покрытия', note: 'Пальчики и стопы', price: 2000, dur: 60 },
    { id: 'p2', cat: 'pedi', name: 'Педикюр + гель-лак', note: 'Полная обработка и покрытие', price: 2800, dur: 105, hit: true },
    { id: 'p3', cat: 'pedi', name: 'Smart-педикюр пальчиков + покрытие', note: 'Без обработки стоп', price: 2200, dur: 75 },
    { id: 'p4', cat: 'pedi', name: 'Маникюр + педикюр в 4 руки', note: 'Два мастера одновременно', price: 4800, dur: 120 },
    { id: 'd1', cat: 'design', name: 'Френч или лунки', note: 'На все ногти', price: 400, dur: 15 },
    { id: 'd2', cat: 'design', name: 'Втирка, хром, «кошачий глаз»', note: 'На все ногти', price: 300, dur: 10 },
    { id: 'd3', cat: 'design', name: 'Ручная роспись', note: 'За 1 ноготь', price: 150, dur: 10, from: true },
    { id: 'd4', cat: 'design', name: 'Стразы, фольга, слайдеры', note: 'За 1 ноготь', price: 50, dur: 5, from: true },
    { id: 'b1', cat: 'brows', name: 'Коррекция и окрашивание бровей', note: 'Форма, краска или хна', price: 1200, dur: 45 },
    { id: 'b2', cat: 'brows', name: 'Долговременная укладка бровей', note: 'С уходом и окрашиванием', price: 2000, dur: 60 },
    { id: 'b3', cat: 'brows', name: 'Ламинирование ресниц', note: 'С окрашиванием и ботоксом', price: 2200, dur: 60 },
    { id: 'c1', cat: 'courses', name: 'Базовый курс маникюра', note: '5 дней, практика на моделях, сертификат', price: 25000, dur: 60, from: false, course: true },
    { id: 'c2', cat: 'courses', name: 'Повышение квалификации', note: '2 дня: архитектура и выравнивание', price: 12000, dur: 60, course: true },
    { id: 'c3', cat: 'courses', name: 'Курс nail-art', note: '1 день: френч, роспись, втирки', price: 9000, dur: 60, course: true },
  ];

  const masters = [
    { id: 'anna', name: 'Анна Соколова', short: 'Анна', dat: 'Анне', role: 'Топ-мастер, преподаватель', exp: '7 лет', tags: ['Архитектура', 'Наращивание', 'Обучение'], tone: ['#B7C7BB', '#7F9A88'] },
    { id: 'maria', name: 'Мария Ким', short: 'Мария', dat: 'Марии', role: 'Мастер nail-art', exp: '5 лет', tags: ['Роспись', 'Хром', 'Френч'], tone: ['#E6D5C3', '#C29D78'] },
    { id: 'kate', name: 'Екатерина Лебедева', short: 'Екатерина', dat: 'Екатерине', role: 'Мастер маникюра и педикюра', exp: '6 лет', tags: ['Педикюр', 'Smart-педикюр', 'Уход'], tone: ['#D8D2C7', '#8E8577'] },
    { id: 'dasha', name: 'Дарья Орлова', short: 'Дарья', dat: 'Дарье', role: 'Мастер маникюра', exp: '3 года', tags: ['Нюд', 'Укрепление', 'Экспресс'], tone: ['#E8D9D6', '#B98C86'] },
  ];

  // Реальные работы студии. Мастера проставлены условно — поправить на тех, кто делал
  const works = [
    { id: 'w9', src: 'assets/works/w9.jpg', title: 'Молочный и нюд с золотой поталью', master: 'anna', alt: 'Короткие миндальные ногти: белое и нюдовое покрытие, золотая поталь, чёрная линия и крапинки' },
    { id: 'w6', src: 'assets/works/w6.jpg', title: 'Чёрно-белая графика и зеркальный хром', master: 'maria', alt: 'Длинные миндальные ногти: чёрные с белыми линиями, белые матовые с чёрными линиями и серебряный хром' },
    { id: 'w7', src: 'assets/works/w7.jpg', title: 'Голубой френч и сплошное покрытие', master: 'dasha', alt: 'Миндальные ногти: сплошное голубое покрытие и нюдовые с голубым френчем' },
    { id: 'w8', src: 'assets/works/w8.jpg', title: 'Красное с переходом в чёрный', master: 'anna', alt: 'Длинные миндальные ногти: красный глянец и два ногтя с омбре от чёрного к красному' },
    { id: 'w10', src: 'assets/works/w10.jpg', title: 'Бежевый с серебряной графикой', master: 'kate', alt: 'Овальные ногти в бежевом покрытии, на двух — тонкие чёрные линии и серебряная фольга' },
  ];

  // Первый отзыв взят с карточки студии во ВКонтакте; остальные — ЗАГЛУШКИ, заменить реальными
  const reviews = [
    { name: 'Гостья студии', master: null, text: 'Вы делаете супер маникюр! Наконец нашла своего мастера, да ещё и рядом с домом.', date: 'из отзывов ВКонтакте', real: true },
    { name: 'Ксения', master: 'maria', text: 'Маша нарисовала ровно то, что я показала на картинке, только аккуратнее. Покрытие держится третью неделю.', date: 'пример отзыва' },
    { name: 'Ольга', master: 'kate', text: 'Делала педикюр перед отпуском. Аккуратно, без боли, инструменты вскрывали из крафт-пакета при мне.', date: 'пример отзыва' },
  ];

  /* ---------- даты ---------- */
  const pad = (n) => String(n).padStart(2, '0');
  const toISO = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  const addDays = (d, n) => { const x = new Date(d); x.setDate(x.getDate() + n); return x; };
  const toMin = (t) => { const [h, m] = t.split(':').map(Number); return h * 60 + m; };
  const fromMin = (m) => `${pad(Math.floor(m / 60))}:${pad(m % 60)}`;

  /* ---------- демо-записи ---------- */
  const clientNames = ['Алина Петрова', 'Ксения Белова', 'Ольга Смирнова', 'Вера Никитина', 'Наталья Ушакова', 'Полина Гусева', 'Яна Ершова', 'Ирина Фомина', 'Софья Мельник', 'Диана Карпова', 'Юлия Зайцева', 'Марина Ткач', 'Ева Логинова', 'Лиза Шевченко'];

  function seed() {
    const today = new Date();
    const list = [];
    let rnd = 7;
    const rand = (n) => { rnd = (rnd * 9301 + 49297) % 233280; return Math.floor((rnd / 233280) * n); };
    const bookable = services.filter((s) => !s.course && s.dur >= 45);
    for (let day = -4; day <= 7; day++) {
      const dObj = addDays(today, day);
      if (studio.closedDays.includes(dObj.getDay())) continue;
      const date = toISO(dObj);
      masters.forEach((m) => {
        let t = studio.open * 60 + rand(3) * 30;
        while (t < (studio.close - 2) * 60) {
          if (rand(10) < 4) { t += 90; continue; }
          const s = bookable[rand(bookable.length)];
          const status = day < 0 ? (rand(10) < 1 ? 'cancelled' : 'done')
            : day === 0 ? (t < today.getHours() * 60 ? 'done' : 'confirmed')
            : (rand(10) < 3 ? 'new' : 'confirmed');
          list.push({
            id: 'b' + Math.random().toString(36).slice(2, 9),
            name: clientNames[rand(clientNames.length)],
            phone: `+7 (9${rand(9)}${rand(9)}) ${100 + rand(899)}-${10 + rand(89)}-${10 + rand(89)}`,
            serviceId: s.id, masterId: m.id, date, time: fromMin(t), dur: s.dur, price: s.price,
            status, source: ['site', 'phone', 'vk', 'admin'][rand(4)], comment: '',
            createdAt: Date.now() - (5 - day) * 86400000,
          });
          t += Math.ceil(s.dur / 30) * 30 + (rand(2) ? 30 : 60);
        }
      });
    }
    return list;
  }

  /* ---------- хранилище ---------- */
  let memory = null;
  function load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) return JSON.parse(raw);
    } catch (e) { /* приватный режим */ }
    if (!memory) { memory = seed(); save(memory); }
    return memory;
  }
  function save(list) {
    memory = list;
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(list)); } catch (e) { /* ок */ }
  }

  const api = {
    studio, categories, services, masters, works, reviews,
    pad, toISO, addDays, toMin, fromMin,
    service: (id) => services.find((s) => s.id === id),
    master: (id) => masters.find((m) => m.id === id),
    rub: (n) => n.toLocaleString('ru-RU').replace(/ /g, ' ') + ' ₽',
    dur: (m) => (m >= 60 ? `${Math.floor(m / 60)} ч${m % 60 ? ' ' + (m % 60) + ' мин' : ''}` : `${m} мин`),
    bookings: () => load(),
    saveBookings: save,
    addBooking(b) {
      const list = load().slice();
      const item = { id: 'b' + Math.random().toString(36).slice(2, 9), status: 'new', createdAt: Date.now(), comment: '', ...b };
      list.push(item); save(list); return item;
    },
    updateBooking(id, patch) {
      const list = load().map((b) => (b.id === id ? { ...b, ...patch } : b)); save(list);
    },
    removeBooking(id) { save(load().filter((b) => b.id !== id)); },
    resetDemo() { memory = null; try { localStorage.removeItem(STORAGE_KEY); } catch (e) {} return load(); },
    /** Свободные слоты мастера на дату под длительность dur */
    freeSlots(masterId, date, dur) {
      if (studio.closedDays.includes(new Date(date + 'T12:00').getDay())) return [];
      const busy = load().filter((b) => b.masterId === masterId && b.date === date && b.status !== 'cancelled')
        .map((b) => [toMin(b.time), toMin(b.time) + b.dur]);
      const now = new Date();
      const isToday = date === toISO(now);
      const out = [];
      for (let t = studio.open * 60; t + dur <= studio.close * 60; t += studio.step) {
        if (isToday && t <= now.getHours() * 60 + now.getMinutes() + 60) continue;
        if (busy.some(([a, z]) => t < z && t + dur > a)) continue;
        out.push(fromMin(t));
      }
      return out;
    },
  };

  window.EL = api;
})();
