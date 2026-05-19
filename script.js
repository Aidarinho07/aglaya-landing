const FORM_CONFIG = {
  endpoint: 'https://formsubmit.co/ajax/Aida.Baimukhametova@tofsgroup.ru',
  cc: 'Aidar.Rakhimov@tofsgroup.ru',
  subject: 'Новая заявка — тренинг «Тело, которое всё вывозит»',
};

document.addEventListener('DOMContentLoaded', () => {
  const modal = document.getElementById('registration-modal');
  const form = document.getElementById('registration-form');
  const formSuccess = document.querySelector('.form-success');
  const formError = document.getElementById('form-error');
  const submitBtn = document.getElementById('submit-btn');
  const burger = document.querySelector('.burger');
  const nav = document.querySelector('.nav');
  // Modal open/close
  function openModal() {
    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  document.querySelectorAll('[data-open-modal]').forEach(btn => {
    btn.addEventListener('click', openModal);
  });

  document.querySelectorAll('[data-close-modal]').forEach(el => {
    el.addEventListener('click', closeModal);
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('is-open')) {
      closeModal();
    }
  });

  // Form submission
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    formError.hidden = true;
    formError.textContent = '';

    const formData = new FormData(form);
    const payload = {
      name: formData.get('name'),
      phone: formData.get('phone'),
      email: formData.get('email') || 'Не указан',
      consent: 'Согласие на обработку ПДн получено',
      _subject: FORM_CONFIG.subject,
      _cc: FORM_CONFIG.cc,
      _template: 'table',
      _captcha: 'false',
    };

    submitBtn.disabled = true;
    submitBtn.textContent = 'Отправка…';

    try {
      const response = await fetch(FORM_CONFIG.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error('Не удалось отправить заявку');
      }

      form.hidden = true;
      formSuccess.hidden = false;

      setTimeout(() => {
        closeModal();
        form.hidden = false;
        formSuccess.hidden = true;
        form.reset();
      }, 3000);
    } catch {
      formError.textContent = 'Не удалось отправить заявку. Попробуйте ещё раз или напишите нам в Telegram.';
      formError.hidden = false;
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Отправить заявку';
    }
  });
  // Phone mask (simple)
  const phoneInput = document.getElementById('phone');
  phoneInput.addEventListener('input', (e) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.startsWith('8')) value = '7' + value.slice(1);
    if (!value.startsWith('7') && value.length > 0) value = '7' + value;

    let formatted = '';
    if (value.length > 0) formatted = '+7';
    if (value.length > 1) formatted += ' (' + value.slice(1, 4);
    if (value.length > 4) formatted += ') ' + value.slice(4, 7);
    if (value.length > 7) formatted += '-' + value.slice(7, 9);
    if (value.length > 9) formatted += '-' + value.slice(9, 11);

    e.target.value = formatted;
  });

  // Mobile menu
  burger.addEventListener('click', () => {
    const isOpen = nav.classList.toggle('is-open');
    burger.classList.toggle('is-active', isOpen);
    burger.setAttribute('aria-expanded', isOpen);
  });

  nav.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      nav.classList.remove('is-open');
      burger.classList.remove('is-active');
      burger.setAttribute('aria-expanded', 'false');
    });
  });

  // Header shadow on scroll
  const header = document.querySelector('.header');
  window.addEventListener('scroll', () => {
    header.style.boxShadow = window.scrollY > 20
      ? '0 4px 20px rgba(61, 43, 31, 0.08)'
      : 'none';
  });
});
