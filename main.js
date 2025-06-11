// Загрузка HTML-шаблона карточки
async function loadTemplate(url) {
    const res = await fetch(url);
    return await res.text();
  }
  
  // Форматирование даты из YYYY-MM-DD → D MMMM
  function formatDate(dateStr) {
    if (!dateStr) return '';
    const date = new Date(dateStr);
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
      .replace('{{date}}', data.date);
  }
  
  const sheetUrl = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRNP51SXrX9VYkbzyr8tDy4z2Qkwo7PRDxFqnrCK8OdsMdw-UCEDgEpx1KCM9oP6ibM94CDhhkkEr3h/pub?gid=0&single=true&output=csv';

  // Основной парсинг CSV
  fetch(sheetUrl)
    .then(response => response.text())
    .then(async csvText => {
      const rows = csvText.split('\n').slice(1); // без заголовка
      const list = document.getElementById('vacancies-list');
      const template = await loadTemplate('components/cardjob.html');
  
      rows.forEach(row => {
        const cols = row.split(',');
  
        if (cols[0] && cols[0].trim()) {
          const title = cols[0].trim();
          const company = cols[1].trim();
          const city = cols[2].trim();
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
          });
  
          const card = document.createElement('div');
          card.innerHTML = cardHTML;
          list.appendChild(card.firstElementChild);
        }
      });
    });