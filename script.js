const DEFAULT_BOOKING_MESSAGE =
  'Здравствуйте, хочу записаться на тренинг к Аглае Датешидзе';

document.addEventListener('DOMContentLoaded', () => {
  const modal = document.getElementById('registration-modal');
  const burger = document.querySelector('.burger');
  const nav = document.querySelector('.nav');

  function getBookingConfig() {
    return window.FORM_CONFIG?.booking || {};
  }

  function buildMessengerLinks() {
    const cfg = getBookingConfig();
    const message = encodeURIComponent(cfg.message || DEFAULT_BOOKING_MESSAGE);
    const links = {};

    if (cfg.telegram) {
      const username = String(cfg.telegram).replace(/^@/, '').trim();
      if (username) {
        links.telegram = `https://t.me/${username}?text=${message}`;
      }
    }

    if (cfg.vk) {
      const vkId = String(cfg.vk).replace(/\D/g, '');
      if (vkId) {
        links.vk = `https://vk.me/id${vkId}?message=${message}`;
      }
    }

    if (cfg.max) {
      const maxSlug = String(cfg.max)
        .trim()
        .replace(/^https?:\/\/(www\.)?max\.ru\//i, '')
        .replace(/\/$/, '');
      if (maxSlug && maxSlug !== ':share') {
        links.max = `https://max.ru/${maxSlug}?text=${message}`;
      }
    }

    return links;
  }

  function updateMessengerLinks() {
    const links = buildMessengerLinks();

    document.querySelectorAll('[data-messenger]').forEach((btn) => {
      const key = btn.dataset.messenger;
      const href = links[key];

      if (href) {
        btn.href = href;
        btn.hidden = false;
        btn.removeAttribute('aria-disabled');
      } else {
        btn.hidden = true;
        btn.removeAttribute('href');
      }
    });
  }

  function openModal() {
    updateMessengerLinks();
    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  document.querySelectorAll('[data-open-modal]').forEach((btn) => {
    btn.addEventListener('click', openModal);
  });

  document.querySelectorAll('[data-close-modal]').forEach((el) => {
    el.addEventListener('click', closeModal);
  });

  document.querySelectorAll('[data-messenger]').forEach((btn) => {
    btn.addEventListener('click', () => {
      closeModal();
    });
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('is-open')) {
      closeModal();
    }
  });

  burger.addEventListener('click', () => {
    const isOpen = nav.classList.toggle('is-open');
    burger.classList.toggle('is-active', isOpen);
    burger.setAttribute('aria-expanded', isOpen);
  });

  nav.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      nav.classList.remove('is-open');
      burger.classList.remove('is-active');
      burger.setAttribute('aria-expanded', 'false');
    });
  });

  const header = document.querySelector('.header');
  window.addEventListener('scroll', () => {
    header.style.boxShadow =
      window.scrollY > 20 ? '0 4px 20px rgba(61, 43, 31, 0.08)' : 'none';
  });

  initForWhomReveal();
});

function initForWhomReveal() {
  const lead = document.querySelector('.for-whom__lead');
  const section = document.getElementById('for-whom');
  if (!lead || !section) return;

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    lead.classList.add('is-visible');
    return;
  }

  const observer = new IntersectionObserver(
    ([entry]) => {
      if (entry.isIntersecting) {
        lead.classList.add('is-visible');
        observer.disconnect();
      }
    },
    { threshold: 0.35 }
  );

  observer.observe(section);
}
