const FORM_SUBJECT = 'Новая заявка — тренинг «Тело, которое всё вывозит»';

const FORM_RECIPIENTS = {
  primary: 'Aida.Baimukhametova@tofsgroup.ru',
  cc: 'Aidar.Rakhimov@tofsgroup.ru, rakhimov.aydar@yandex.ru',
};

document.addEventListener('DOMContentLoaded', () => {
  const modal = document.getElementById('registration-modal');
  const form = document.getElementById('registration-form');
  const formSuccess = document.querySelector('.form-success');
  const formError = document.getElementById('form-error');
  const submitBtn = document.getElementById('submit-btn');
  const burger = document.querySelector('.burger');
  const nav = document.querySelector('.nav');

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

  function showSuccess() {
    form.hidden = true;
    formSuccess.hidden = false;
    formError.hidden = true;

    setTimeout(() => {
      closeModal();
      form.hidden = false;
      formSuccess.hidden = true;
      form.reset();
    }, 3000);
  }

  function showError(message) {
    formError.textContent = message;
    formError.hidden = false;
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

  async function sendViaFormSubmit(payload) {
    const response = await fetch(`https://formsubmit.co/ajax/${FORM_RECIPIENTS.primary}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        name: payload.name,
        phone: payload.phone,
        email: payload.email,
        _subject: FORM_SUBJECT,
        _cc: FORM_RECIPIENTS.cc,
        _template: 'table',
        _captcha: 'false',
      }),
    });

    if (!response.ok) {
      throw new Error(`FormSubmit недоступен (${response.status})`);
    }

    return response.json();
  }

  async function sendViaWeb3Forms(payload) {
    const accessKey = window.FORM_CONFIG?.web3formsAccessKey;
    if (!accessKey) {
      throw new Error('Web3Forms key missing');
    }

    const response = await fetch('https://api.web3forms.com/submit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        access_key: accessKey,
        subject: FORM_SUBJECT,
        from_name: 'Лендинг Аглая',
        name: payload.name,
        phone: payload.phone,
        email: payload.email,
        message:
          `Имя: ${payload.name}\n` +
          `Телефон: ${payload.phone}\n` +
          `Email: ${payload.email}\n\n` +
          'Согласие на обработку ПДн получено.',
        ccemail: window.FORM_CONFIG?.ccEmails || '',
        botcheck: '',
      }),
    });

    const result = await response.json();
    if (!result.success) {
      throw new Error(result.message || 'Web3Forms error');
    }
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    formError.hidden = true;
    formError.textContent = '';

    const formData = new FormData(form);
    const payload = {
      name: String(formData.get('name') || '').trim(),
      phone: String(formData.get('phone') || '').trim(),
      email: String(formData.get('email') || '').trim() || 'Не указан',
    };

    submitBtn.disabled = true;
    submitBtn.textContent = 'Отправка…';

    try {
      const hasWeb3Key = Boolean(window.FORM_CONFIG?.web3formsAccessKey);

      if (hasWeb3Key) {
        await sendViaWeb3Forms(payload);
      } else {
        await sendViaFormSubmit(payload);
      }
      showSuccess();
    } catch (error) {
      const isFormSubmitDown = String(error.message).includes('FormSubmit') || error.name === 'TypeError';

      if (isFormSubmitDown && !window.FORM_CONFIG?.web3formsAccessKey) {
        showError(
          'Сервис FormSubmit сейчас недоступен (ошибка 522 на их стороне). ' +
          'Чтобы форма заработала без Google: зайдите на web3forms.com, укажите почту, ' +
          'вставьте полученный ключ в config.js и обновите сайт.'
        );
      } else {
        showError('Не удалось отправить заявку. Попробуйте ещё раз или напишите на rakhimov.aydar@yandex.ru');
      }
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Отправить заявку';
    }
  });

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

  const header = document.querySelector('.header');
  window.addEventListener('scroll', () => {
    header.style.boxShadow = window.scrollY > 20
      ? '0 4px 20px rgba(61, 43, 31, 0.08)'
      : 'none';
  });
});
