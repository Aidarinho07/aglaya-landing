const DEFAULT_BOOKING_MESSAGE =
  'Здравствуйте, хочу записаться на тренинг к Аглае Датешидзе';

const MOBILE_RE = /Android|iPhone|iPad|iPod|Mobile/i;

document.addEventListener('DOMContentLoaded', () => {
  const modal = document.getElementById('registration-modal');
  const toast = document.getElementById('booking-toast');
  const burger = document.querySelector('.burger');
  const nav = document.querySelector('.nav');
  let toastTimer;

  function getBookingConfig() {
    return window.FORM_CONFIG?.booking || {};
  }

  function getBookingMessage() {
    const cfg = getBookingConfig();
    return cfg.message || DEFAULT_BOOKING_MESSAGE;
  }

  function buildMessengerLinks() {
    const cfg = getBookingConfig();
    const message = encodeURIComponent(getBookingMessage());
    const links = {};

    if (cfg.telegram) {
      const username = String(cfg.telegram).replace(/^@/, '').trim();
      if (username) {
        links.telegram = MOBILE_RE.test(navigator.userAgent)
          ? `tg://resolve?domain=${username}&text=${message}`
          : `https://t.me/${username}?text=${message}`;
      }
    }

    if (cfg.vk) {
      const vkId = String(cfg.vk).replace(/\D/g, '');
      if (vkId) {
        links.vk = `https://vk.com/im?sel=${vkId}&msg=${message}`;
      }
    }

    if (cfg.max) {
      const maxRaw = String(cfg.max).trim();
      let maxUrl;

      if (/^https?:\/\//i.test(maxRaw)) {
        maxUrl = maxRaw.replace(/\/$/, '');
      } else {
        const maxSlug = maxRaw.replace(/^\/+/, '').replace(/\/$/, '');
        if (maxSlug && maxSlug !== ':share') {
          maxUrl = `https://max.ru/${maxSlug}`;
        }
      }

      if (maxUrl) {
        links.max = maxUrl;
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
        btn.dataset.webHref = href;
      } else {
        btn.hidden = true;
        btn.removeAttribute('href');
        delete btn.dataset.webHref;
      }
    });
  }

  async function copyBookingMessage() {
    const text = getBookingMessage();

    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.setAttribute('readonly', '');
      textarea.style.position = 'fixed';
      textarea.style.left = '-9999px';
      document.body.appendChild(textarea);
      textarea.select();

      let copied = false;
      try {
        copied = document.execCommand('copy');
      } catch {
        copied = false;
      }

      document.body.removeChild(textarea);
      return copied;
    }
  }

  function showBookingToast(copied) {
    if (!toast) return;

    toast.textContent = copied
      ? 'Текст скопирован — вставьте его в поле сообщения и отправьте'
      : 'Откройте чат и отправьте: «Здравствуйте, хочу записаться на тренинг…»';
    toast.hidden = false;
    toast.classList.add('is-visible');

    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      toast.classList.remove('is-visible');
      toast.hidden = true;
    }, 4500);
  }

  function openMessengerLink(url) {
    if (MOBILE_RE.test(navigator.userAgent)) {
      window.location.href = url;
      return;
    }

    window.open(url, '_blank', 'noopener,noreferrer');
  }

  async function handleMessengerClick(event) {
    const btn = event.currentTarget;
    const url = btn.dataset.webHref || btn.getAttribute('href');
    if (!url) return;

    event.preventDefault();

    const copied = await copyBookingMessage();
    closeModal();
    showBookingToast(copied);
    openMessengerLink(url);
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
    btn.addEventListener('click', handleMessengerClick);
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

  initLeadReveal();
});

function initLeadReveal() {
  const leads = document.querySelectorAll('.for-whom__lead');
  if (!leads.length) return;

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  leads.forEach((lead) => {
    if (reducedMotion) {
      lead.classList.add('is-visible');
      return;
    }

    const section = lead.closest('section');
    if (!section) return;

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
  });
}
