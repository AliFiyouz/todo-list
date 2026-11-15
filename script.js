// ===== دفترچه یادداشت با Local Storage =====

const insertForm = document.querySelector("#form");
const noteInput = document.querySelector("#note");
const noteList = document.querySelector("#note-list");

const STORAGE_KEY = "notes";

// خواندن آرایه‌ی یادداشت‌ها از حافظه‌ی مرورگر
function getNotes() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch {
    return [];
  }
}

// ذخیره‌ی آرایه در حافظه‌ی مرورگر
function saveNotes(notes) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
}

// ساخت یک آیتم یادداشت در صفحه (li + دکمه‌ی حذف)
function renderNote(text) {
  const li = document.createElement("li");
  li.textContent = text;

  const removeBtn = document.createElement("span");
  removeBtn.textContent = "X";
  removeBtn.classList.add("remove-btn");

  li.appendChild(removeBtn);
  noteList.appendChild(li);
}

// افزودن یادداشت جدید
function newNote(e) {
  e.preventDefault(); // جلوی رفرش فرم
  const value = noteInput.value.trim();
  if (!value) return; // یادداشت خالی قبول نمی‌شود

  renderNote(value); // نمایش در صفحه

  const notes = getNotes();
  notes.push(value); // افزودن به آرایه
  saveNotes(notes); // ذخیره در حافظه

  noteInput.value = ""; // خالی‌کردن کادر
  noteInput.focus();
}

// حذف یادداشت (با event delegation روی کل لیست)
function handleRemove(e) {
  if (!e.target.classList.contains("remove-btn")) return;

  const li = e.target.parentElement;
  // متن یادداشت بدون "X" دکمه
  const text = li.firstChild.textContent;

  li.remove(); // حذف از صفحه

  // حذف از حافظه (فقط اولین مورد با همین متن)
  const notes = getNotes();
  const idx = notes.indexOf(text);
  if (idx > -1) notes.splice(idx, 1);
  saveNotes(notes);
}

// بارگذاری یادداشت‌های ذخیره‌شده هنگام باز شدن صفحه
function loadNotes() {
  getNotes().forEach(renderNote);
}

// ===== اتصال رویدادها =====
insertForm.addEventListener("submit", newNote);
noteList.addEventListener("click", handleRemove);
document.addEventListener("DOMContentLoaded", loadNotes);
