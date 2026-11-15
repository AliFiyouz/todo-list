// ===== دفترچه یادداشت — نسخه‌ی کامل =====

const form = document.querySelector("#form");
const input = document.querySelector("#note");
const list = document.querySelector("#note-list");
const counter = document.querySelector("#counter");
const emptyState = document.querySelector("#empty-state");
const clearDoneBtn = document.querySelector("#clear-done");
const filterBtns = document.querySelectorAll(".filter");

const STORAGE_KEY = "notes";
let notes = loadNotes();
let filter = "all"; // all | active | done

// --- اعداد فارسی ---
const toFa = (n) => String(n).replace(/\d/g, (d) => "۰۱۲۳۴۵۶۷۸۹"[d]);

// --- خواندن از حافظه (با مهاجرت از فرمت قدیمیِ آرایه‌ی رشته‌ای) ---
function loadNotes() {
  try {
    const raw = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    return raw.map((item) =>
      typeof item === "string"
        ? { id: crypto.randomUUID(), text: item, done: false, createdAt: Date.now() }
        : item
    );
  } catch {
    return [];
  }
}

function saveNotes() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
}

// --- قالب‌بندی تاریخ ---
function formatDate(ts) {
  try {
    return new Intl.DateTimeFormat("fa-IR", {
      month: "short", day: "numeric", hour: "2-digit", minute: "2-digit",
    }).format(new Date(ts));
  } catch {
    return "";
  }
}

// --- افزودن یادداشت ---
function addNote(text) {
  notes.unshift({ id: crypto.randomUUID(), text, done: false, createdAt: Date.now() });
  saveNotes();
  render();
}

// --- تغییر وضعیت انجام‌شده ---
function toggleDone(id) {
  const n = notes.find((x) => x.id === id);
  if (n) { n.done = !n.done; saveNotes(); render(); }
}

// --- حذف ---
function removeNote(id) {
  notes = notes.filter((x) => x.id !== id);
  saveNotes();
  render();
}

// --- ویرایش ---
function editNote(id, newText) {
  const n = notes.find((x) => x.id === id);
  if (n) { n.text = newText; saveNotes(); render(); }
}

// --- پاک‌کردن انجام‌شده‌ها ---
clearDoneBtn.addEventListener("click", () => {
  if (!notes.some((n) => n.done)) return;
  notes = notes.filter((n) => !n.done);
  saveNotes();
  render();
});

// --- ساخت یک ردیف یادداشت ---
function createItem(note) {
  const li = document.createElement("li");
  li.className = "note-item" + (note.done ? " done" : "");
  li.dataset.id = note.id;

  // چک‌باکس انجام‌شده
  const check = document.createElement("button");
  check.className = "check";
  check.innerHTML = note.done ? '<i class="fa-solid fa-circle-check"></i>' : '<i class="fa-regular fa-circle"></i>';
  check.title = "انجام شد / نشد";
  check.addEventListener("click", () => toggleDone(note.id));

  // متن + تاریخ
  const body = document.createElement("div");
  body.className = "note-body";
  const span = document.createElement("span");
  span.className = "note-text";
  span.textContent = note.text;
  const time = document.createElement("small");
  time.className = "note-time";
  time.textContent = formatDate(note.createdAt);
  body.append(span, time);

  // دکمه‌ی ویرایش (با دابل‌کلیک روی متن هم کار می‌کند)
  const editBtn = document.createElement("button");
  editBtn.className = "icon-btn edit";
  editBtn.innerHTML = '<i class="fa-solid fa-pen"></i>';
  editBtn.title = "ویرایش";
  editBtn.addEventListener("click", () => startEdit(li, note));
  span.addEventListener("dblclick", () => startEdit(li, note));

  // دکمه‌ی حذف
  const delBtn = document.createElement("button");
  delBtn.className = "icon-btn remove-btn";
  delBtn.innerHTML = '<i class="fa-solid fa-trash"></i>';
  delBtn.title = "حذف";
  delBtn.addEventListener("click", () => removeNote(note.id));

  li.append(check, body, editBtn, delBtn);
  return li;
}

// --- حالت ویرایش درجا ---
function startEdit(li, note) {
  const body = li.querySelector(".note-body");
  const editor = document.createElement("input");
  editor.type = "text";
  editor.className = "edit-input";
  editor.value = note.text;
  body.replaceChildren(editor);
  editor.focus();
  editor.setSelectionRange(editor.value.length, editor.value.length);

  const commit = () => {
    const v = editor.value.trim();
    if (v) editNote(note.id, v);
    else render();
  };
  editor.addEventListener("keydown", (e) => {
    if (e.key === "Enter") commit();
    if (e.key === "Escape") render();
  });
  editor.addEventListener("blur", commit);
}

// --- فیلترها ---
filterBtns.forEach((btn) => {
  btn.addEventListener("click", () => {
    filter = btn.dataset.filter;
    filterBtns.forEach((b) => b.classList.toggle("active", b === btn));
    render();
  });
});

function visibleNotes() {
  if (filter === "active") return notes.filter((n) => !n.done);
  if (filter === "done") return notes.filter((n) => n.done);
  return notes;
}

// --- رندر کامل ---
function render() {
  list.replaceChildren();
  const vis = visibleNotes();
  vis.forEach((n) => list.appendChild(createItem(n)));

  const remaining = notes.filter((n) => !n.done).length;
  counter.textContent = `${toFa(remaining)} فعال از ${toFa(notes.length)}`;

  emptyState.style.display = vis.length === 0 ? "block" : "none";
  clearDoneBtn.disabled = !notes.some((n) => n.done);
}

// --- افزودن از طریق فرم ---
form.addEventListener("submit", (e) => {
  e.preventDefault();
  const v = input.value.trim();
  if (!v) return;
  addNote(v);
  input.value = "";
  input.focus();
});

render(); // نمایش اولیه
