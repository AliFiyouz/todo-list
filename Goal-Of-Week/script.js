// ===== اهداف این هفته =====

const form = document.querySelector("#goal-form");
const input = document.querySelector("#goal-input");
const list = document.querySelector("#goal-list");
const empty = document.querySelector("#empty");
const progressFill = document.querySelector("#progress-fill");
const progressLabel = document.querySelector("#progress-label");
const progressCount = document.querySelector("#progress-count");

const STORAGE_KEY = "weeklyGoals";
let goals = loadGoals();

const toFa = (n) => String(n).replace(/\d/g, (d) => "۰۱۲۳۴۵۶۷۸۹"[d]);

function loadGoals() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch {
    return [];
  }
}
function save() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(goals));
}

function addGoal(text) {
  goals.push({ id: crypto.randomUUID(), text, done: false });
  save();
  render();
}
function toggle(id) {
  const g = goals.find((x) => x.id === id);
  if (g) { g.done = !g.done; save(); render(); }
}
function remove(id) {
  goals = goals.filter((x) => x.id !== id);
  save();
  render();
}

function createItem(goal) {
  const li = document.createElement("li");
  li.className = "goal-item" + (goal.done ? " done" : "");

  const check = document.createElement("button");
  check.className = "check";
  check.innerHTML = goal.done
    ? '<i class="fa-solid fa-circle-check"></i>'
    : '<i class="fa-regular fa-circle"></i>';
  check.title = "محقق شد / نشد";
  check.addEventListener("click", () => toggle(goal.id));

  const span = document.createElement("span");
  span.className = "goal-text";
  span.textContent = goal.text;

  const del = document.createElement("button");
  del.className = "remove-btn";
  del.innerHTML = '<i class="fa-solid fa-trash"></i>';
  del.title = "حذف";
  del.addEventListener("click", () => remove(goal.id));

  li.append(check, span, del);
  return li;
}

function render() {
  list.replaceChildren();
  goals.forEach((g) => list.appendChild(createItem(g)));

  const total = goals.length;
  const done = goals.filter((g) => g.done).length;
  const pct = total ? Math.round((done / total) * 100) : 0;

  progressFill.style.width = pct + "%";
  progressLabel.textContent = `${toFa(pct)}٪ محقق شد`;
  progressCount.textContent = `${toFa(done)} از ${toFa(total)}`;

  empty.style.display = total === 0 ? "block" : "none";
}

form.addEventListener("submit", (e) => {
  e.preventDefault();
  const v = input.value.trim();
  if (!v) return;
  addGoal(v);
  input.value = "";
  input.focus();
});

render();
