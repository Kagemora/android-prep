(function () {
  const STORAGE_KEY = "android-prep-progress-v1";

  function loadProgress() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch (e) {
      return {};
    }
  }
  function saveProgress(progress) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  }

  let progress = loadProgress();
  let activeCat = CATEGORIES[0].id;
  let searchTerm = "";
  let openIds = new Set();

  const sidebarEl = document.getElementById("sidebar-tree");
  const tabsEl = document.getElementById("tabs");
  const contentEl = document.getElementById("content");
  const overallFillEl = document.getElementById("overall-fill");
  const overallLabelEl = document.getElementById("overall-label");
  const searchInput = document.getElementById("search-input");

  function questionsInCat(catId) {
    return QUESTIONS.filter((q) => q.cat === catId);
  }

  function catProgress(catId) {
    const qs = questionsInCat(catId);
    if (qs.length === 0) return null;
    const done = qs.filter((q) => progress[q.id]).length;
    return { done, total: qs.length };
  }

  function renderSidebar() {
    sidebarEl.innerHTML = "";
    CATEGORIES.forEach((cat) => {
      const item = document.createElement("div");
      item.className = "tree-item" + (cat.id === activeCat ? " active" : "");
      item.dataset.cat = cat.id;

      const icon = document.createElement("div");
      icon.className = "tree-icon";
      icon.textContent = cat.icon;

      const label = document.createElement("div");
      label.textContent = cat.label;

      item.appendChild(icon);
      item.appendChild(label);

      const p = catProgress(cat.id);
      if (p) {
        const prog = document.createElement("div");
        prog.className = "tree-progress";
        prog.textContent = `${p.done}/${p.total}`;
        item.appendChild(prog);
      }

      item.addEventListener("click", () => {
        activeCat = cat.id;
        openIds.clear();
        render();
      });

      sidebarEl.appendChild(item);
    });
  }

  function renderTabs() {
    tabsEl.innerHTML = "";
    const cat = CATEGORIES.find((c) => c.id === activeCat);
    const tab = document.createElement("div");
    tab.className = "tab visible";
    const dot = document.createElement("span");
    dot.className = "tab-dot";
    tab.appendChild(dot);
    const label = document.createElement("span");
    label.textContent = cat.label;
    tab.appendChild(label);
    tabsEl.appendChild(tab);
  }

  function renderOverall() {
    const total = QUESTIONS.filter((q) => q.code !== undefined || q.cat === "lifehacks" || q.cat === "resume").length;
    // считаем прогресс только по категориям с чекбоксами (не lifehacks/resume — там нет "выучено")
    const trackable = QUESTIONS.filter((q) => q.cat !== "lifehacks" && q.cat !== "resume");
    const done = trackable.filter((q) => progress[q.id]).length;
    const pct = trackable.length ? Math.round((done / trackable.length) * 100) : 0;
    overallFillEl.style.width = pct + "%";
    overallLabelEl.textContent = `${done}/${trackable.length} · ${pct}%`;
  }

  function highlightMatch(text) {
    return text;
  }

  function matchesSearch(q) {
    if (!searchTerm) return true;
    const hay = (q.q + " " + (q.what || "") + " " + (q.key || "") + " " + (q.example || "")).toLowerCase();
    return hay.includes(searchTerm.toLowerCase());
  }

  function renderQuestionCard(q) {
    const card = document.createElement("div");
    card.className = "qcard" + (progress[q.id] ? " done" : "") + (openIds.has(q.id) ? " open" : "");

    const head = document.createElement("div");
    head.className = "qhead";

    const check = document.createElement("div");
    check.className = "qcheck";
    check.textContent = progress[q.id] ? "✓" : "";
    check.addEventListener("click", (e) => {
      e.stopPropagation();
      progress[q.id] = !progress[q.id];
      saveProgress(progress);
      render();
    });

    const text = document.createElement("div");
    text.className = "qtext";
    text.textContent = q.q;

    const chevron = document.createElement("div");
    chevron.className = "qchevron";
    chevron.textContent = "▸";

    head.appendChild(check);
    head.appendChild(text);
    head.appendChild(chevron);
    head.addEventListener("click", () => {
      if (openIds.has(q.id)) openIds.delete(q.id);
      else openIds.add(q.id);
      render();
    });

    const body = document.createElement("div");
    body.className = "qbody";

    const rowWhat = document.createElement("div");
    rowWhat.className = "row what";
    rowWhat.innerHTML = `<b>Что это</b>${q.what}`;

    const rowKey = document.createElement("div");
    rowKey.className = "row key";
    rowKey.innerHTML = `<b>Ключевое отличие</b>${q.key}`;

    const rowExample = document.createElement("div");
    rowExample.className = "row example";
    rowExample.innerHTML = `<b>Пример / следствие</b>${q.example}`;

    body.appendChild(rowWhat);
    body.appendChild(rowKey);
    body.appendChild(rowExample);

    if (q.code) {
      const pre = document.createElement("pre");
      pre.textContent = q.code;
      body.appendChild(pre);
    }

    card.appendChild(head);
    card.appendChild(body);
    return card;
  }

  function renderInfoCard(q) {
    const card = document.createElement("div");
    card.className = "info-card";
    const h3 = document.createElement("h3");
    h3.textContent = q.q;
    card.appendChild(h3);

    const rowWhat = document.createElement("div");
    rowWhat.className = "row what";
    rowWhat.innerHTML = `<b>Суть</b>${q.what}`;
    const rowKey = document.createElement("div");
    rowKey.className = "row key";
    rowKey.innerHTML = `<b>Как применить</b>${q.key}`;
    const rowExample = document.createElement("div");
    rowExample.className = "row example";
    rowExample.innerHTML = `<b>Пример</b>${q.example}`;

    card.appendChild(rowWhat);
    card.appendChild(rowKey);
    card.appendChild(rowExample);
    return card;
  }

  function renderContent() {
    contentEl.innerHTML = "";
    const cat = CATEGORIES.find((c) => c.id === activeCat);

    const heading = document.createElement("h2");
    heading.className = "cat-heading";
    heading.textContent = cat.label;
    const sub = document.createElement("p");
    sub.className = "cat-subheading";
    const p = catProgress(cat.id);
    sub.textContent = p
      ? `Выучено ${p.done} из ${p.total}`
      : "Справочные материалы";
    contentEl.appendChild(heading);
    contentEl.appendChild(sub);

    const qs = questionsInCat(cat.id).filter(matchesSearch);

    if (qs.length === 0) {
      const empty = document.createElement("div");
      empty.className = "empty-state";
      empty.textContent = searchTerm
        ? "Ничего не найдено. Попробуй другой запрос."
        : "Пока пусто — добавь вопросы в js/data.js";
      contentEl.appendChild(empty);
      return;
    }

    const isInfoCat = cat.id === "lifehacks" || cat.id === "resume";
    qs.forEach((q) => {
      contentEl.appendChild(isInfoCat ? renderInfoCard(q) : renderQuestionCard(q));
    });
  }

  function render() {
    renderSidebar();
    renderTabs();
    renderContent();
    renderOverall();
  }

  searchInput.addEventListener("input", (e) => {
    searchTerm = e.target.value;
    render();
  });

  render();
})();
