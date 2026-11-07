/* Everluxe — React-острова с Motion (motion/react).
   Без сборки: React, Motion и htm приходят с esm.sh через import map в index.html.
   Остров 1 — прайс: вкладки с общей подложкой (layoutId) и смена списка через AnimatePresence.
   Остров 2 — работы: фильтр по мастеру с общей подложкой, сетка с layout-анимацией и уходом карточек.
   Запись открывает общий обработчик [data-book] в site.js. */
import { createElement, useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { motion, AnimatePresence, MotionConfig, LayoutGroup } from 'motion/react';
import htm from 'htm';

const html = htm.bind(createElement);
const E = window.EL;
const ease = [0.2, 0.7, 0.2, 1];
const spring = { type: 'spring', stiffness: 420, damping: 36, mass: 0.8 };

/* ---------------- Прайс ---------------- */
const listV = {
  hidden: {},
  show: { transition: { staggerChildren: 0.045 } },
  exit: { transition: { staggerChildren: 0.02, staggerDirection: -1 } },
};
const rowV = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease } },
  exit: { opacity: 0, y: -6, transition: { duration: 0.15 } },
};

function Price() {
  const [cat, setCat] = useState('mani');

  // быстрые карточки на первом экране переключают категорию
  useEffect(() => {
    const on = (e) => setCat(e.detail);
    window.addEventListener('el:price-cat', on);
    return () => window.removeEventListener('el:price-cat', on);
  }, []);

  const rows = E.services.filter((s) => s.cat === cat);

  return html`
    <div class="tabs" role="tablist" aria-label="Категории услуг">
      <${LayoutGroup} id="price-tabs">
        ${E.categories.map((c) => {
          const on = c.id === cat;
          return html`<button key=${c.id} class="tab" role="tab" aria-selected=${on} onClick=${() => setCat(c.id)}>
            ${on && html`<${motion.span} layoutId="tab-pill" class="pill" transition=${spring} />`}
            <span class="tab-label">${c.name}</span>
          </button>`;
        })}
      <//>
    </div>
    <div>
      <div class="price-panel" role="tabpanel">
        <${AnimatePresence} mode="wait" initial=${false}>
          <${motion.div} key=${cat} variants=${listV} initial="hidden" animate="show" exit="exit">
            ${rows.map((s) => html`
              <${motion.div} key=${s.id} class="price-row" variants=${rowV}>
                <div>
                  <div class="price-name">${s.name}${s.hit && html`<span class="hit">хит</span>`}</div>
                  <div class="price-note">${s.note}${s.course ? '' : ' · ' + E.dur(s.dur)}</div>
                </div>
                <div class="price-val">${s.from && html`<small>от</small>`}${E.rub(s.price)}</div>
                <${motion.button} class="price-book" data-book data-service=${s.id} aria-label=${'Записаться: ' + s.name}
                  whileHover=${{ x: 3 }} whileTap=${{ scale: 0.92 }}>→<//>
              <//>`)}
          <//>
        <//>
      </div>
    </div>`;
}

/* ---------------- Работы ---------------- */
function Works() {
  const [who, setWho] = useState('all');
  const list = E.works.filter((w) => who === 'all' || w.master === who);
  const chips = [{ id: 'all', short: 'Все работы' }, ...E.masters.filter((m) => E.works.some((w) => w.master === m.id))];

  return html`
    <div class="chips" role="group" aria-label="Фильтр по мастеру">
      <${LayoutGroup} id="work-chips">
        ${chips.map((m) => {
          const on = m.id === who;
          return html`<button key=${m.id} class="chip" aria-pressed=${on} onClick=${() => setWho(m.id)}>
            ${on && html`<${motion.span} layoutId="chip-pill" class="pill" transition=${spring} />`}
            <span class="chip-label">${m.short}</span>
          </button>`;
        })}
      <//>
    </div>
    <${motion.div} class="works-grid" layout>
      <${AnimatePresence} mode="popLayout" initial=${false}>
        ${list.map((w) => {
          const m = E.master(w.master);
          return html`
            <${motion.figure} key=${w.id} class="work" layout
              initial=${{ opacity: 0, scale: 0.94 }}
              animate=${{ opacity: 1, scale: 1 }}
              exit=${{ opacity: 0, scale: 0.94, transition: { duration: 0.18 } }}
              transition=${{ layout: spring, duration: 0.35, ease }}>
              <${motion.button} class="work-img" data-book data-master=${m.id} aria-label=${'Записаться к мастеру ' + m.name}
                whileHover="hover" whileTap=${{ scale: 0.985 }}>
                <${motion.img} src=${w.src} alt=${w.alt} loading="lazy"
                  variants=${{ hover: { scale: 1.05 } }} transition=${{ duration: 0.6, ease }} />
              <//>
              <figcaption><b>${w.title}</b><span>мастер <button class="link-btn" data-book data-master=${m.id}>${m.short}</button></span></figcaption>
            <//>`;
        })}
      <//>
    <//>`;
}

/* ---------------- монтирование ---------------- */
function mount(id, Comp) {
  const el = document.getElementById(id);
  if (!el) return;
  el.innerHTML = '';
  createRoot(el).render(html`<${MotionConfig} reducedMotion="user"><${Comp} /><//>`);
}
mount('priceRoot', Price);
mount('worksRoot', Works);
