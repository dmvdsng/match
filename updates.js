const updatesSheetUrl = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQFrojgjHeDrXtSdulTPZfkkSJzs2RVVrZSc46zbjnnkB-OsTa5yPXF444ZOMkWhmXECKxTGHtsKkzV/pub?gid=0&single=true&output=csv';

fetch(updatesSheetUrl)
  .then(res => res.text())
  .then(csv => {
    const rows = csv.trim().split('\n').slice(1); // Пропускаем заголовок
    const list = document.getElementById('updates-list');
    list.innerHTML = ''; // Очищаем

    rows.forEach(row => {
      // Используем RegExp, чтобы корректно разделить строку с учётом возможных запятых и кавычек
      const match = row.match(/^"?(.*?)"?,"?(.*?)"?,"?([\s\S]*)"?$/);
      if (!match) return;

      const [, date, version, descRaw] = match;

      const desc = descRaw
        .replace(/""/g, '"')       // двойные кавычки → одна
        .replace(/\r?\n/g, '<br>') // переносы строк в HTML
        .trim();

      const item = document.createElement('div');
      item.className = 'update-item';
      item.innerHTML = `
        <div class="update-date">${date.trim()}</div>
        <div class="update-version">${version.trim()}</div>
        <div class="update-desc">${desc}</div>
      `;

      list.appendChild(item);
    });
  })
  .catch(err => {
    console.error('❌ Ошибка загрузки обновлений:', err);
    const list = document.getElementById('updates-list');
    list.innerHTML = '<p>Не удалось загрузить обновления 😢</p>';
  });