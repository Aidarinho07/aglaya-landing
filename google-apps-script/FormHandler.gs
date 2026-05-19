/**
 * Обработчик формы лендинга «Тело, которое всё вывозит»
 *
 * Установка (один раз, ~3 минуты):
 * 1. Откройте https://script.google.com → Новый проект
 * 2. Вставьте этот код, сохраните (Ctrl+S)
 * 3. Запустите функцию testSend → разрешите доступ к Gmail
 * 4. Развернуть → Новое развертывание → Веб-приложение
 *    - Запуск от имени: я
 *    - Доступ: все
 * 5. Скопируйте URL и вставьте в config.js → googleScriptUrl
 */

const RECIPIENTS = [
  'Aida.Baimukhametova@tofsgroup.ru',
  'Aidar.Rakhimov@tofsgroup.ru',
  'rakhimov.aydar@yandex.ru',
];

const SUBJECT = 'Новая заявка — тренинг «Тело, которое всё вывозит»';

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const name = sanitize(data.name);
    const phone = sanitize(data.phone);
    const email = sanitize(data.email || 'Не указан');

    if (!name || !phone) {
      return jsonResponse({ success: false, message: 'Заполните имя и телефон' });
    }

    const body =
      'Новая заявка с лендинга\n\n' +
      'Имя: ' + name + '\n' +
      'Телефон: ' + phone + '\n' +
      'Email: ' + email + '\n\n' +
      'Согласие на обработку персональных данных получено.\n' +
      'Дата: ' + new Date().toLocaleString('ru-RU', { timeZone: 'Asia/Yekaterinburg' });

    GmailApp.sendEmail(RECIPIENTS.join(','), SUBJECT, body, {
      name: 'Лендинг Аглая',
    });

    return jsonResponse({ success: true });
  } catch (error) {
    return jsonResponse({ success: false, message: error.message });
  }
}

function doGet() {
  return jsonResponse({ success: true, message: 'Form handler is running' });
}

function testSend() {
  GmailApp.sendEmail(
    RECIPIENTS.join(','),
    'Тест формы лендинга',
    'Если вы видите это письмо — отправка заявок настроена правильно.'
  );
}

function sanitize(value) {
  return String(value || '').trim().slice(0, 500);
}

function jsonResponse(payload) {
  return ContentService
    .createTextOutput(JSON.stringify(payload))
    .setMimeType(ContentService.MimeType.JSON);
}
