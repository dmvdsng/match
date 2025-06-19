// Загрузка HTML-шаблона карточки
async function loadTemplate(url) {
  const res = await fetch(url);
  return await res.text();
}

// Форматирование даты из YYYY-MM-DD → D MMMM
function formatDate(dateStr) {
  if (!dateStr) return '';

  const date = new Date(dateStr);

  if (isNaN(date)) {
    console.warn('⚠️ Не удалось распарсить дату:', dateStr);
    return '';
  }

  const options = { day: 'numeric', month: 'long' };
  return date.toLocaleDateString('ru-RU', options);
}

// Рендер карточки
function renderCard(template, data) {
  const logoOrInitial = data.logo
    ? `<img class="vacancy-logo" src="${data.logo}" alt="logo" />`
    : `<div class="vacancy-logo-fallback">${(data.company || '').trim()[0] || ''}</div>`;

  return template
    .replace('{{logoOrInitial}}', logoOrInitial)
    .replace('{{company}}', data.company)
    .replace('{{title}}', data.title)
    .replace('{{city}}', data.city)
    .replace('{{salary}}', data.salary)
    .replace('{{date}}', data.date)
    .replace('{{link}}', data.link);
}

// Контейнер карточек
const list = document.getElementById('vacancies-list');

// 🔹 Показываем 3 скелетона до загрузки
for (let i = 0; i < 8; i++) {
  list.insertAdjacentHTML('beforeend', `
    <div class="vacancy-card skeleton">
      <div class="vacancy-left">
        <div class="vacancy-logo-skeleton"></div>
        <div class="vacancy-info">
          <div class="skeleton-line short"></div>
          <div class="skeleton-line tiny"></div>
        </div>
      </div>
      <div class="vacancy-right">
        <div class="skeleton-line"></div>
        <div class="skeleton-line short"></div>
        <div class="skeleton-line tiny"></div>
      </div>
    </div>
  `);
}

// 🔹 Загружаем данные из Google Sheets
const sheetUrl = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRNP51SXrX9VYkbzyr8tDy4z2Qkwo7PRDxFqnrCK8OdsMdw-UCEDgEpx1KCM9oP6ibM94CDhhkkEr3h/pub?gid=0&single=true&output=csv';

fetch(sheetUrl)
  .then(response => response.text())
  .then(async csvText => {
    const rows = csvText.split('\n').slice(1); // Убираем заголовки
    const template = await loadTemplate('components/cardjob.html');

    // 🔹 Удаляем скелетоны
    list.innerHTML = '';

    rows.forEach(row => {
      const cols = row.split(',');

      const status = cols[7]?.trim().toLowerCase() || '';
      if (status !== 'true' && status !== '✅') return;

      if (cols[0] && cols[0].trim()) {
        const title = cols[0].trim();
        const company = cols[1].trim();
        const city = cols[2].trim();
        const link = cols[3]?.trim() || '';
        const salary = cols[4]?.trim() || '';
        const date = cols[5]?.trim() || '';
        const logo = cols[6]?.trim() || '';
        const initial = company[0]?.toUpperCase() || '?';

        const cardHTML = renderCard(template, {
          logo,
          company,
          title,
          city,
          salary,
          date: formatDate(date),
          initial,
          link,
        });

        list.insertAdjacentHTML('beforeend', cardHTML);

        // Анимация появления
        const lastCard = list.lastElementChild;
        requestAnimationFrame(() => {
          lastCard.classList.add('loaded');
        });
      }
    });
  });

// Мобильное меню
function toggleMenu() {
  const menu = document.getElementById('mobile-menu');
  const overlay = document.getElementById('overlay');
  const burger = document.querySelector('.burger-button');

  menu.classList.toggle('hidden');
  overlay.classList.toggle('hidden');
  burger.textContent = burger.textContent === '☰' ? '✕' : '☰';
}

document.getElementById('overlay').addEventListener('click', () => {
  toggleMenu();
});