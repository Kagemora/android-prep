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

  // ---------- Безопасный рендер текста с авто-подсветкой инлайн-кода ----------
  const KOTLIN_KEYWORDS = new Set([
    "val", "var", "fun", "class", "object", "interface", "override", "suspend",
    "inline", "reified", "sealed", "data", "companion", "private", "public",
    "protected", "internal", "open", "abstract", "null", "true", "false",
    "this", "super", "when", "return", "import", "package", "lateinit",
    "lazy", "const", "enum", "typealias", "operator", "infix", "crossinline",
    "noinline", "vararg", "init", "by", "throw", "try", "catch", "finally",
    // Частые имена функций стандартной библиотеки и API — встречаются как
    // голые слова без скобок прямо в заголовках вопросов ("map vs mapTo")
    "map", "mapTo", "fold", "reduce", "filter", "flatMap", "zip", "distinct",
    "let", "run", "apply", "also", "with", "launch", "async", "await", "join",
    "delay", "collect", "emit", "flowOn", "debounce", "invalidate",
    "requestLayout", "equals", "hashCode", "toString", "copy", "Flow",
    "StateFlow", "SharedFlow", "LiveData", "ViewModel", "Activity", "Fragment",
    "Context", "Intent", "Bundle", "RecyclerView", "DiffUtil", "ViewHolder",
    "HashMap", "ArrayList", "LinkedList", "Retrofit", "Room", "Dagger", "Hilt",
    "Job", "Deferred", "Dispatchers", "Mutex", "Semaphore", "Handler",
    "Looper", "WorkManager", "Service", "remember", "rememberSaveable",
  ]);

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  // Находит индекс закрывающей скобки, учитывая вложенность open/close
  function findMatchingBracket(text, openIndex, openChar, closeChar) {
    let depth = 0;
    for (let i = openIndex; i < text.length; i++) {
      if (text[i] === openChar) depth++;
      else if (text[i] === closeChar) {
        depth--;
        if (depth === 0) return i;
      }
    }
    return -1;
  }

  // Экранирует текст и попутно оборачивает похожие на код фрагменты
  // (generic-типы, вызовы функций, ключевые слова) в <code class="inline-code">,
  // чтобы 1) ничего не ломалось от символов < >  2) код в прозе выглядел как код
  function renderInlineText(text) {
    if (!text) return "";
    const identRe = /^[A-Za-z_][A-Za-z0-9_]*/;
    let out = "";
    let i = 0;
    while (i < text.length) {
      const ch = text[i];
      if (/[A-Za-z_]/.test(ch)) {
        let cursor = i;
        let sawCodeSignal = false;
        while (cursor < text.length) {
          const m = identRe.exec(text.slice(cursor));
          if (!m) break;
          cursor += m[0].length;
          if (text[cursor] === "<") {
            const close = findMatchingBracket(text, cursor, "<", ">");
            if (close === -1) break;
            cursor = close + 1;
            sawCodeSignal = true;
          }
          if (text[cursor] === "(") {
            const close = findMatchingBracket(text, cursor, "(", ")");
            if (close === -1) break;
            cursor = close + 1;
            sawCodeSignal = true;
            let k = cursor;
            while (text[k] === " ") k++;
            if (text[k] === "{") {
              const closeB = findMatchingBracket(text, k, "{", "}");
              if (closeB !== -1) cursor = closeB + 1;
            }
          }
          if (text.slice(cursor, cursor + 2) === "::") { cursor += 2; continue; }
          if (text[cursor] === "." && /[A-Za-z_]/.test(text[cursor + 1] || "")) { cursor += 1; continue; }
          break;
        }
        if (sawCodeSignal && cursor > i) {
          out += `<code class="inline-code">${escapeHtml(text.slice(i, cursor))}</code>`;
          i = cursor;
          continue;
        }
        const kw = identRe.exec(text.slice(i));
        if (kw && KOTLIN_KEYWORDS.has(kw[0])) {
          out += `<code class="inline-code">${escapeHtml(kw[0])}</code>`;
          i += kw[0].length;
          continue;
        }
      }
      out += escapeHtml(ch);
      i++;
    }
    return out;
  }

  function questionsInCat(catId) {
    return QUESTIONS.filter((q) => q.cat === catId);
  }

  function catProgress(catId) {
    const qs = questionsInCat(catId);
    if (qs.length === 0) return null;
    const done = qs.filter((q) => progress[q.id]).length;
    return { done, total: qs.length };
  }

  // Категории делятся на два смысловых блока: технические темы и
  // справочные материалы (лайфхаки/резюме) — второй блок выделен зелёным
  // и идёт отдельной секцией, отсортированной по алфавиту, как и первый.
  const META_CAT_IDS = new Set(["lifehacks", "resume"]);

  function renderSidebar() {
    sidebarEl.innerHTML = "";

    const techCats = CATEGORIES.filter((c) => !META_CAT_IDS.has(c.id))
      .slice()
      .sort((a, b) => a.label.localeCompare(b.label));
    const metaCats = CATEGORIES.filter((c) => META_CAT_IDS.has(c.id))
      .slice()
      .sort((a, b) => a.label.localeCompare(b.label));

    function renderTreeItem(cat) {
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

      return item;
    }

    techCats.forEach((cat) => sidebarEl.appendChild(renderTreeItem(cat)));

    if (metaCats.length) {
      const divider = document.createElement("div");
      divider.className = "sidebar-title sidebar-title-secondary";
      divider.textContent = "Справочные материалы";
      sidebarEl.appendChild(divider);
      metaCats.forEach((cat) => sidebarEl.appendChild(renderTreeItem(cat)));
    }
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
    text.innerHTML = renderInlineText(q.q);

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
    rowWhat.innerHTML = `<b>Что это</b>${renderInlineText(q.what)}`;

    const rowKey = document.createElement("div");
    rowKey.className = "row key";
    rowKey.innerHTML = `<b>Ключевое отличие</b>${renderInlineText(q.key)}`;

    const rowExample = document.createElement("div");
    rowExample.className = "row example";
    rowExample.innerHTML = `<b>Пример / следствие</b>${renderInlineText(q.example)}`;

    body.appendChild(rowWhat);
    body.appendChild(rowKey);
    body.appendChild(rowExample);

    if (q.code) {
      const pre = document.createElement("pre");
      const codeEl = document.createElement("code");
      codeEl.className = "language-kotlin";
      codeEl.textContent = q.code;
      pre.appendChild(codeEl);
      body.appendChild(pre);
      if (window.Prism) Prism.highlightElement(codeEl);
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
    rowWhat.innerHTML = `<b>Суть</b>${renderInlineText(q.what)}`;
    const rowKey = document.createElement("div");
    rowKey.className = "row key";
    rowKey.innerHTML = `<b>Как применить</b>${renderInlineText(q.key)}`;
    const rowExample = document.createElement("div");
    rowExample.className = "row example";
    rowExample.innerHTML = `<b>Пример</b>${renderInlineText(q.example)}`;

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
