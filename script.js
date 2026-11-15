// ===== دفترچه یادداشت — چند بخش انتخابی =====

// تعریف بخش‌ها (هر کدام ذخیره‌ی جداگانه دارد)
const SECTIONS = {
  notes:     { title: "📒 یادداشت‌ها",      key: "notes",             placeholder: "یادداشت جدید بنویس...",      empty: "هنوز یادداشتی نداری. اولین یادداشتت را بنویس! ✍️" },
  main:      { title: "✅ کارهای اصلی",      key: "section_main",      placeholder: "یک کار اصلی بنویس...",        empty: "کار اصلی‌ای ثبت نشده. مهم‌ترین کارت را بنویس! 💪" },
  habit:     { title: "🔁 کنترل عادت",       key: "section_habit",     placeholder: "یک عادت بنویس...",            empty: "عادتی ثبت نکرده‌ای. یک عادت خوب شروع کن! 🌱" },
  important: { title: "⭐ مهم",              key: "section_important", placeholder: "یک مورد مهم بنویس...",        empty: "موردی ثبت نشده. چیزهای مهم را اینجا بنویس! ⭐" },
  joy:       { title: "😊 لذت‌های هفته",      key: "section_joy",       placeholder: "یک لحظه‌ی خوب بنویس...",      empty: "هنوز چیزی ننوشتی. لحظه‌های خوب هفته را ثبت کن! 🌈" },
  improve:   { title: "📈 چطور بهتر شوم؟",    key: "section_improve",   placeholder: "یک ایده‌ی پیشرفت بنویس...",  empty: "ایده‌ای ثبت نشده. یک راه پیشرفت بنویس! 🚀" },
};

// عناصر صفحه
const form = document.querySelector("#form");
const input = document.querySelector("#note");
const list = document.querySelector("#note-list");
const counter = document.querySelector("#counter");
const emptyState = document.querySelector("#empty-state");
const clearDoneBtn = document.querySelector("#clear-done");
const filterBtns = document.querySelectorAll(".filter");
const sectionTitle = document.querySelector("#section-title");
const sectionsNav = document.querySelector("#sections");

let current = localStorage.getItem("activeSection") || "notes";
if (!SECTIONS[current]) current = "notes";
let items = [];
let filter = "all";

const toFa = (n) => String(n).replace(/\d/g, (d) => "۰۱۲۳۴۵۶۷۸۹"[d]);

// --- حافظه (با مهاجرت از فرمت رشته‌ای قدیمی) ---
function load() {
  try {
    const raw = JSON.parse(localStorage.getItem(SECTIONS[current].key)) || [];
    items = raw.map((it) =>
      typeof it === "string"
        ? { id: crypto.randomUUID(), text: it, done: false, createdAt: Date.now() }
        : it
    );
  } catch {
    items = [];
  }
}
function save() {
  localStorage.setItem(SECTIONS[current].key, JSON.stringify(items));
}

function formatDate(ts) {
  try {
    return new Intl.DateTimeFormat("fa-IR", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }).format(new Date(ts));
  } catch { return ""; }
}

// --- عملیات ---
function addItem(text) { items.unshift({ id: crypto.randomUUID(), text, done: false, createdAt: Date.now() }); save(); render(); }
function toggleDone(id) { const n = items.find((x) => x.id === id); if (n) { n.done = !n.done; save(); render(); } }
function removeItem(id) { items = items.filter((x) => x.id !== id); save(); render(); }
function editItem(id, t) { const n = items.find((x) => x.id === id); if (n) { n.text = t; save(); render(); } }

clearDoneBtn.addEventListener("click", () => {
  if (!items.some((n) => n.done)) return;
  items = items.filter((n) => !n.done); save(); render();
});

// --- ساخت ردیف ---
function createRow(note) {
  const li = document.createElement("li");
  li.className = "note-item" + (note.done ? " done" : "");

  const check = document.createElement("button");
  check.className = "check";
  check.innerHTML = note.done ? '<i class="fa-solid fa-circle-check"></i>' : '<i class="fa-regular fa-circle"></i>';
  check.title = "انجام شد / نشد";
  check.addEventListener("click", () => toggleDone(note.id));

  const body = document.createElement("div");
  body.className = "note-body";
  const span = document.createElement("span");
  span.className = "note-text";
  span.textContent = note.text;
  const time = document.createElement("small");
  time.className = "note-time";
  time.textContent = formatDate(note.createdAt);
  body.append(span, time);

  const editBtn = document.createElement("button");
  editBtn.className = "icon-btn edit";
  editBtn.innerHTML = '<i class="fa-solid fa-pen"></i>';
  editBtn.title = "ویرایش";
  editBtn.addEventListener("click", () => startEdit(li, note));
  span.addEventListener("dblclick", () => startEdit(li, note));

  const delBtn = document.createElement("button");
  delBtn.className = "icon-btn remove-btn";
  delBtn.innerHTML = '<i class="fa-solid fa-trash"></i>';
  delBtn.title = "حذف";
  delBtn.addEventListener("click", () => removeItem(note.id));

  li.append(check, body, editBtn, delBtn);
  return li;
}

function startEdit(li, note) {
  const body = li.querySelector(".note-body");
  const editor = document.createElement("input");
  editor.type = "text";
  editor.className = "edit-input";
  editor.value = note.text;
  body.replaceChildren(editor);
  editor.focus();
  editor.setSelectionRange(editor.value.length, editor.value.length);
  const commit = () => { const v = editor.value.trim(); if (v) editItem(note.id, v); else render(); };
  editor.addEventListener("keydown", (e) => { if (e.key === "Enter") commit(); if (e.key === "Escape") render(); });
  editor.addEventListener("blur", commit);
}

// --- فیلترها ---
filterBtns.forEach((btn) => btn.addEventListener("click", () => {
  filter = btn.dataset.filter;
  filterBtns.forEach((b) => b.classList.toggle("active", b === btn));
  render();
}));
function visible() {
  if (filter === "active") return items.filter((n) => !n.done);
  if (filter === "done") return items.filter((n) => n.done);
  return items;
}

// --- رندر لیست ---
function render() {
  list.replaceChildren();
  const vis = visible();
  vis.forEach((n) => list.appendChild(createRow(n)));
  const remaining = items.filter((n) => !n.done).length;
  counter.textContent = `${toFa(remaining)} فعال از ${toFa(items.length)}`;
  emptyState.textContent = SECTIONS[current].empty;
  emptyState.style.display = vis.length === 0 ? "block" : "none";
  clearDoneBtn.disabled = !items.some((n) => n.done);
}

// --- تعویض بخش ---
const listView = document.querySelector("#list-view");
const habitView = document.querySelector("#habit-view");

function switchSection(key) {
  if (!SECTIONS[key]) return;
  current = key;
  localStorage.setItem("activeSection", key);
  sectionTitle.textContent = SECTIONS[key].title;

  if (key === "habit") {
    // نمای جدول تقویم عادت
    listView.style.display = "none";
    habitView.style.display = "block";
    renderHabits();
  } else {
    // نمای لیست معمولی
    habitView.style.display = "none";
    listView.style.display = "block";
    input.placeholder = SECTIONS[key].placeholder;
    load();
    render();
  }
  updateSectionUI();
}

// --- ساخت تب‌های بالا + به‌روزرسانی حالت فعال ---
function buildTabs() {
  sectionsNav.replaceChildren();
  Object.entries(SECTIONS).forEach(([key, cfg]) => {
    const btn = document.createElement("button");
    btn.className = "section-tab";
    btn.dataset.section = key;
    btn.textContent = cfg.title;
    btn.addEventListener("click", () => switchSection(key));
    sectionsNav.appendChild(btn);
  });
}
function updateSectionUI() {
  // تب‌های بالا
  document.querySelectorAll(".section-tab").forEach((b) =>
    b.classList.toggle("active", b.dataset.section === current));
  // منوی سه‌بعدی کناری
  document.querySelectorAll(".side-menu a[data-section]").forEach((a) =>
    a.parentElement.classList.toggle("active", a.dataset.section === current));
}

// منوی سه‌بعدی کناری هم بخش را عوض کند
document.querySelectorAll(".side-menu a[data-section]").forEach((a) =>
  a.addEventListener("click", (e) => { e.preventDefault(); switchSection(a.dataset.section); })
);

// --- فرم افزودن ---
form.addEventListener("submit", (e) => {
  e.preventDefault();
  const v = input.value.trim();
  if (!v) return;
  addItem(v); input.value = ""; input.focus();
});

// ============================================================
//  ماژول عادت — جدول تقویم هفتگی
// ============================================================
const HABITS_KEY = "habits";
const habitForm = document.querySelector("#habit-form");
const habitInput = document.querySelector("#habit-input");
const habitTable = document.querySelector("#habit-table");
const habitEmpty = document.querySelector("#habit-empty");
const weekLabel = document.querySelector("#week-label");

let habits = loadHabits();
let weekOffset = 0; // 0 = هفته‌ی جاری، -1 = هفته‌ی قبل، ...

// روزهای هفته (فارسی، از شنبه)
const WEEK_DAYS = ["شنبه", "یکشنبه", "دوشنبه", "سه‌شنبه", "چهارشنبه", "پنجشنبه", "جمعه"];
const WEEK_SHORT = ["ش", "ی", "د", "س", "چ", "پ", "ج"];

function loadHabits() {
  try { return JSON.parse(localStorage.getItem(HABITS_KEY)) || []; }
  catch { return []; }
}
function saveHabits() { localStorage.setItem(HABITS_KEY, JSON.stringify(habits)); }

// کلید تاریخ محلی به شکل YYYY-MM-DD (بدون مشکل منطقه‌ی زمانی)
function dateKey(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

// شنبه‌ی هفته‌ای که تاریخ در آن است (شروع هفته‌ی ایرانی)
function saturdayOf(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  const offset = (d.getDay() + 1) % 7; // فاصله تا شنبه
  d.setDate(d.getDate() - offset);
  return d;
}

// ۷ تاریخ هفته‌ی جاری با توجه به weekOffset
function weekDates() {
  const base = new Date();
  base.setDate(base.getDate() + weekOffset * 7);
  const sat = saturdayOf(base);
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(sat);
    d.setDate(sat.getDate() + i);
    return d;
  });
}

// عدد روز به تقویم شمسی
function faDay(d) {
  try { return new Intl.DateTimeFormat("fa-IR", { day: "numeric" }).format(d); }
  catch { return String(d.getDate()); }
}
function faRange(dates) {
  try {
    const fmt = new Intl.DateTimeFormat("fa-IR", { month: "long", day: "numeric" });
    return `${fmt.format(dates[0])} تا ${fmt.format(dates[6])}`;
  } catch { return ""; }
}

function addHabit(name) {
  habits.push({ id: crypto.randomUUID(), name, log: {} });
  saveHabits();
  renderHabits();
}
function removeHabit(id) {
  habits = habits.filter((h) => h.id !== id);
  saveHabits();
  renderHabits();
}
function toggleHabitDay(id, key) {
  const h = habits.find((x) => x.id === id);
  if (!h) return;
  if (h.log[key]) delete h.log[key];
  else h.log[key] = true;
  saveHabits();
  renderHabits();
}

function renderHabits() {
  const dates = weekDates();
  const keys = dates.map(dateKey);
  const todayKey = dateKey(new Date());
  weekLabel.textContent = faRange(dates);

  habitTable.replaceChildren();
  habitEmpty.style.display = habits.length === 0 ? "block" : "none";
  if (habits.length === 0) return;

  // سربرگ جدول
  const thead = document.createElement("thead");
  const hr = document.createElement("tr");
  hr.appendChild(Object.assign(document.createElement("th"), { className: "habit-name-col", textContent: "عادت" }));
  dates.forEach((d, i) => {
    const th = document.createElement("th");
    th.className = "day-col" + (keys[i] === todayKey ? " today" : "");
    th.innerHTML = `<span class="dow">${WEEK_SHORT[i]}</span><span class="dom">${faDay(d)}</span>`;
    th.title = WEEK_DAYS[i];
    hr.appendChild(th);
  });
  hr.appendChild(Object.assign(document.createElement("th"), { className: "count-col", textContent: "✓" }));
  thead.appendChild(hr);
  habitTable.appendChild(thead);

  // بدنه
  const tbody = document.createElement("tbody");
  habits.forEach((h) => {
    const tr = document.createElement("tr");

    // نام عادت + دکمه حذف
    const nameTd = document.createElement("td");
    nameTd.className = "habit-name";
    const nameSpan = document.createElement("span");
    nameSpan.textContent = h.name;
    const del = document.createElement("button");
    del.className = "habit-del";
    del.innerHTML = '<i class="fa-solid fa-trash"></i>';
    del.title = "حذف عادت";
    del.addEventListener("click", () => removeHabit(h.id));
    nameTd.append(del, nameSpan);
    tr.appendChild(nameTd);

    // سلول‌های روز
    let count = 0;
    keys.forEach((k, i) => {
      const td = document.createElement("td");
      td.className = "day-cell" + (k === todayKey ? " today" : "");
      const done = !!h.log[k];
      if (done) count++;
      const dot = document.createElement("button");
      dot.className = "day-dot" + (done ? " on" : "");
      dot.innerHTML = done ? '<i class="fa-solid fa-check"></i>' : "";
      dot.setAttribute("aria-label", WEEK_DAYS[i]);
      dot.addEventListener("click", () => toggleHabitDay(h.id, k));
      td.appendChild(dot);
      tr.appendChild(td);
    });

    // شمارش هفته
    const countTd = document.createElement("td");
    countTd.className = "habit-count";
    countTd.textContent = `${toFa(count)}/۷`;
    tr.appendChild(countTd);

    tbody.appendChild(tr);
  });
  habitTable.appendChild(tbody);
}

// فرم افزودن عادت
habitForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const v = habitInput.value.trim();
  if (!v) return;
  addHabit(v);
  habitInput.value = "";
  habitInput.focus();
});

// ناوبری هفته
document.querySelector("#prev-week").addEventListener("click", () => { weekOffset--; renderHabits(); });
document.querySelector("#next-week").addEventListener("click", () => { weekOffset++; renderHabits(); });
document.querySelector("#this-week").addEventListener("click", () => { weekOffset = 0; renderHabits(); });

// --- شروع ---
buildTabs();
switchSection(current);
