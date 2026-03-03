// Розклад на сьогодні
const schedulesToday = {
  "1.1": ["10:00-12:00", "16:00-18:00"],
  "1.2": ["10:00-12:00"],
  "2.1": ["14:00-16:00"],
  "2.2": ["13:30-16:00", "22:00-24:00"],
  "3.1": ["14:00-16:00"],
  "3.2": ["20:00-22:00"],
  "4.1": ["18:00-20:00"],
  "4.2": ["18:00-20:00"],
  "5.1": ["16:00-18:00"],
  "5.2": ["16:00-18:00"],
  "6.1": ["12:00-14:00"],
  "6.2": ["12:00-14:00"]
};

// Розклад на завтра
const schedulesTomorrow = {
  "1.1": ["очікую"],
  "1.2": ["очікую"],
  "2.1": ["очікую"],
  "2.2": ["очікую"],
  "3.1": ["очікую"],
  "3.2": ["очікую"],
  "4.1": ["очікую"],
  "4.2": ["очікую"],
  "5.1": ["очікую"],
  "5.2": ["очікую"],
  "6.1": ["очікую"],
  "6.2": ["очікую"]
};

// Перетворення часу у хвилини
function timeToMinutes(time) {
  if (!time || typeof time !== "string" || !time.includes(":")) return 0;
  if (time.trim() === "24:00") return 1440;
  const [h, m] = time.split(":").map(Number);
  if (isNaN(h) || isNaN(m)) return 0;
  return h * 60 + m;
}

// Статус клітинки
function getCellStatus(hourStart, ranges) {
  const hourEnd = hourStart + 60;
  let totalOverlap = 0;
  let firstOverlapStart = null;

  for (const range of ranges) {
    if (!range || range === "очікую") continue;
    const parts = range.split("-");
    if (parts.length !== 2) continue;

    const startMin = timeToMinutes(parts[0]);
    const endMin = timeToMinutes(parts[1]);

    const overlapStart = Math.max(hourStart, startMin);
    const overlapEnd = Math.min(hourEnd, endMin);

    if (overlapEnd > overlapStart) {
      totalOverlap += overlapEnd - overlapStart;
      if (firstOverlapStart === null) {
        firstOverlapStart = overlapStart;
      }
    }
  }

  if (totalOverlap >= 60) return "on";
  if (totalOverlap === 30) {
    if (firstOverlapStart !== null && firstOverlapStart % 60 === 0) return "on-left";
    return "on-right";
  }
  if (totalOverlap > 0) return "on";
  return "off-full";
}

// Перевірка чи черга має лише "очікую"
function isWaitingQueue(ranges) {
  return ranges.length === 1 && ranges[0] === "очікую";
}

// Генерація таблиці
function generateTable(scheduleData) {
  const container = document.getElementById("tableContainer");
  if (!container) return;

  container.innerHTML = "";
  const table = document.createElement("table");

  // Заголовок
  const headerRow = document.createElement("tr");
  const firstHeader = document.createElement("th");
  firstHeader.textContent = "Черга";
  headerRow.appendChild(firstHeader);

  for (let hour = 0; hour < 24; hour++) {
    const start = String(hour).padStart(2, "0") + ":00";
    const end = (hour === 23) ? "24:00" : String(hour + 1).padStart(2, "0") + ":00";
    const th = document.createElement("th");
    th.textContent = `${start}-${end}`;
    headerRow.appendChild(th);
  }
  table.appendChild(headerRow);

  // Рядки
  const queueKeys = Object.keys(scheduleData);
  queueKeys.forEach(queue => {
    const row = document.createElement("tr");

    const queueCell = document.createElement("td");
    queueCell.textContent = queue;
    queueCell.className = "queue-name";
    row.appendChild(queueCell);

    const ranges = scheduleData[queue];
    const waiting = isWaitingQueue(ranges);

    for (let hour = 0; hour < 24; hour++) {
      const cell = document.createElement("td");

      if (waiting) {
        cell.className = "waiting";
        cell.textContent = "?";
        cell.title = "Розклад очікується";
      } else {
        const hourStart = hour * 60;
        const status = getCellStatus(hourStart, ranges);
        cell.className = status;

        // Додаємо tooltip
        if (status === "on" || status === "on-left" || status === "on-right") {
          cell.title = `Черга ${queue}: відключення`;
        } else {
          cell.title = `Черга ${queue}: світло є`;
        }
      }

      row.appendChild(cell);
    }

    table.appendChild(row);
  });

  container.appendChild(table);
}

// Отримання рядка дати у форматі YYYY-MM-DD
function getDateStr(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

// Заповнення списку дат
function fillDates() {
  const select = document.getElementById("dateSelect");
  if (!select) return;

  const today = new Date();
  const todayStr = getDateStr(today);
  const todayOption = document.createElement("option");
  todayOption.value = todayStr;
  todayOption.textContent = "Сьогодні (" + today.toLocaleDateString("uk-UA") + ")";
  select.appendChild(todayOption);

  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);
  const tomorrowStr = getDateStr(tomorrow);
  const tomorrowOption = document.createElement("option");
  tomorrowOption.value = tomorrowStr;
  tomorrowOption.textContent = "Завтра (" + tomorrow.toLocaleDateString("uk-UA") + ")";
  select.appendChild(tomorrowOption);

  // Додаткові дати (виключаючи сьогодні та завтра)
  const extraDates = [];
  for (let d = 22; d <= 28; d++) {
    extraDates.push(`2026-02-${String(d).padStart(2, "0")}`);
  }
  for (let d = 1; d <= 31; d++) {
    extraDates.push(`2026-03-${String(d).padStart(2, "0")}`);
  }

  extraDates.forEach(dateStr => {
    // Не дублювати сьогодні та завтра
    if (dateStr === todayStr || dateStr === tomorrowStr) return;

    const option = document.createElement("option");
    option.value = dateStr;
    option.textContent = dateStr.split("-").reverse().join(".");
    select.appendChild(option);
  });
}

// Оновлення лінії індикатора поточного часу
function updateClockIndicator(isToday) {
  const indicator = document.getElementById("clockIndicator");
  if (!indicator) return;

  if (!isToday) {
    indicator.style.display = "none";
    return;
  }

  const table = document.querySelector("table");
  if (!table) {
    indicator.style.display = "none";
    return;
  }

  const headerCells = table.querySelectorAll("th");
  if (headerCells.length < 2) {
    indicator.style.display = "none";
    return;
  }

  const now = new Date();
  const hour = now.getHours();
  const minutes = now.getMinutes();

  // Перша клітинка даних (індекс 1 — перша година)
  const firstDataCell = headerCells[1];
  const cellWidth = firstDataCell.offsetWidth;
  const tableLeft = firstDataCell.offsetLeft;

  const offset = tableLeft + cellWidth * (hour + minutes / 60);

  indicator.style.left = offset + "px";
  indicator.style.height = table.offsetHeight + "px";
  indicator.style.display = "block";
}

// Підсвічування поточної години (тільки для сьогодні)
function highlightCurrentHour(isToday) {
  const table = document.querySelector("table");
  if (!table) return;

  // Прибираємо попереднє підсвічування
  table.querySelectorAll("td").forEach(td => td.classList.remove("current-hour"));
  table.querySelectorAll("th").forEach(th => th.classList.remove("current-hour"));

  if (!isToday) return;

  const now = new Date();
  const hour = now.getHours();

  const rows = table.querySelectorAll("tr");
  rows.forEach((row, idx) => {
    if (idx === 0) {
      // Підсвічуємо заголовок
      const ths = row.querySelectorAll("th");
      if (ths.length > hour + 1) {
        ths[hour + 1].classList.add("current-hour");
      }
    } else {
      const cells = row.querySelectorAll("td");
      if (cells.length > hour + 1) {
        cells[hour + 1].classList.add("current-hour");
      }
    }
  });
}

// Визначення чи обрана дата — сьогодні
function isSelectedDateToday(selectedValue) {
  const today = new Date();
  return selectedValue === getDateStr(today);
}

// Визначення чи обрана дата — завтра
function isSelectedDateTomorrow(selectedValue) {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return selectedValue === getDateStr(tomorrow);
}

// Оновлення відображення
function updateDisplay(selectedValue) {
  const isToday = isSelectedDateToday(selectedValue);
  const isTomorrow = isSelectedDateTomorrow(selectedValue);

  if (isToday) {
    generateTable(schedulesToday);
  } else if (isTomorrow) {
    generateTable(schedulesTomorrow);
  } else {
    const container = document.getElementById("tableContainer");
    if (container) {
      container.innerHTML = '<div class="no-data-message">📋 Розклад недоступний для цієї дати.</div>';
    }
  }

  // Оновлюємо дату в інформаційному блоці
  const alertDate = document.getElementById("alertDate");
  if (alertDate) {
    try {
      const dateObj = new Date(selectedValue);
      alertDate.textContent = dateObj.toLocaleDateString("uk-UA");
    } catch {
      alertDate.textContent = selectedValue;
    }
  }

  updateClockIndicator(isToday);
  highlightCurrentHour(isToday);
}

// Запуск після завантаження сторінки
document.addEventListener("DOMContentLoaded", () => {
  fillDates();

  const select = document.getElementById("dateSelect");
  if (!select) return;

  // Початкове відображення — сьогодні
  updateDisplay(select.value);

  // Обробка зміни дати
  select.addEventListener("change", (e) => {
    updateDisplay(e.target.value);
  });

  // Оновлення щохвилини
  setInterval(() => {
    if (select) {
      updateClockIndicator(isSelectedDateToday(select.value));
      highlightCurrentHour(isSelectedDateToday(select.value));
    }
  }, 60000);
});
