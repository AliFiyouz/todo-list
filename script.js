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
function switchSection(key) {
  if (!SECTIONS[key]) return;
  current = key;
  localStorage.setItem("activeSection", key);
  sectionTitle.textContent = SECTIONS[key].title;
  input.placeholder = SECTIONS[key].placeholder;
  load();
  render();
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

// --- شروع ---
buildTabs();
switchSection(current);
