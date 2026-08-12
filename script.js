document.documentElement.classList.add("js");

const DIALECTS = ["PNB", "PNT1", "PNT2", "PNT3", "PNT4", "PNN"];
const DIALECT_META = {
  PNB: { name: "Northern Vietnamese", short: "Northern" },
  PNT1: { name: "North-Central I", short: "Thanh Hoa" },
  PNT2: { name: "North-Central II", short: "Nghe An · Ha Tinh" },
  PNT3: { name: "North-Central III", short: "Quang Binh · Quang Tri · Hue" },
  PNT4: { name: "South-Central", short: "Da Nang · Binh Thuan" },
  PNN: { name: "Southern Vietnamese", short: "Southern" },
};

const TASK_NAMES = {
  mcqa: "MCQA",
  nli: "NLI",
  qa: "QA",
  sentiment: "Emotion recognition",
};

const LEADERBOARD = [
  { model: "Qwen2.5 0.5B", standard: 41.0, PNB: 39.6, PNN: 39.4, PNT1: 36.8, PNT2: 33.9, PNT3: 31.8, PNT4: 37.1, dialect: 36.4, gap: 4.5 },
  { model: "Qwen2.5 3B", standard: 66.8, PNB: 66.3, PNN: 65.4, PNT1: 64.2, PNT2: 60.0, PNT3: 56.4, PNT4: 62.3, dialect: 62.4, gap: 4.4 },
  { model: "Qwen2.5 7B", standard: 66.9, PNB: 67.5, PNN: 64.4, PNT1: 64.0, PNT2: 62.7, PNT3: 61.3, PNT4: 65.5, dialect: 64.2, gap: 2.7 },
  { model: "Llama 3.1 8B", standard: 64.3, PNB: 65.1, PNN: 62.1, PNT1: 61.6, PNT2: 58.0, PNT3: 57.6, PNT4: 63.0, dialect: 61.2, gap: 3.1 },
  { model: "Mistral 7B", standard: 52.8, PNB: 55.0, PNN: 49.0, PNT1: 52.0, PNT2: 45.4, PNT3: 43.4, PNT4: 49.5, dialect: 49.1, gap: 3.8 },
  { model: "Gemma 2 9B", standard: 72.5, PNB: 73.0, PNN: 70.7, PNT1: 70.7, PNT2: 68.5, PNT3: 67.3, PNT4: 70.0, dialect: 70.0, gap: 2.5, bestOpen: true },
  { model: "Gemma 3 4B", standard: 66.6, PNB: 68.0, PNN: 66.2, PNT1: 63.5, PNT2: 63.2, PNT3: 62.1, PNT4: 62.9, dialect: 64.3, gap: 2.3 },
  { model: "Vistral 7B", standard: 51.3, PNB: 51.5, PNN: 50.0, PNT1: 50.8, PNT2: 48.6, PNT3: 47.9, PNT4: 49.9, dialect: 49.8, gap: 1.5 },
  { model: "SeaLLM 7B", standard: 62.1, PNB: 62.8, PNN: 61.1, PNT1: 58.7, PNT2: 58.0, PNT3: 56.9, PNT4: 60.0, dialect: 59.6, gap: 2.5 },
  { model: "GPT-4o", standard: 77.8, PNB: 77.7, PNN: 75.8, PNT1: 77.4, PNT2: 76.6, PNT3: 75.9, PNT4: 77.5, dialect: 76.8, gap: 1.0, closed: true },
];

function initializeNavigation() {
  const header = document.querySelector(".site-header");
  const toggle = document.querySelector(".nav-toggle");
  const nav = document.querySelector("#site-nav");
  const navLinks = [...nav.querySelectorAll("a[href^='#']")];

  const updateHeader = () => header.classList.toggle("scrolled", window.scrollY > 24);
  updateHeader();
  window.addEventListener("scroll", updateHeader, { passive: true });

  toggle.addEventListener("click", () => {
    const open = toggle.getAttribute("aria-expanded") === "true";
    toggle.setAttribute("aria-expanded", String(!open));
    nav.classList.toggle("open", !open);
  });

  navLinks.forEach((link) => link.addEventListener("click", () => {
    toggle.setAttribute("aria-expanded", "false");
    nav.classList.remove("open");
  }));

  document.addEventListener("click", (event) => {
    if (!nav.contains(event.target) && !toggle.contains(event.target)) {
      toggle.setAttribute("aria-expanded", "false");
      nav.classList.remove("open");
    }
  });

  const sections = navLinks
    .map((link) => document.querySelector(link.getAttribute("href")))
    .filter(Boolean);

  const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      navLinks.forEach((link) => {
        link.classList.toggle("active", link.getAttribute("href") === `#${entry.target.id}`);
      });
    });
  }, { rootMargin: "-28% 0px -62%", threshold: 0 });

  sections.forEach((section) => sectionObserver.observe(section));
}

function initializeRevealMotion() {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    document.querySelectorAll(".reveal").forEach((element) => element.classList.add("in-view"));
    return;
  }

  const observer = new IntersectionObserver((entries, revealObserver) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("in-view");
      revealObserver.unobserve(entry.target);
    });
  }, { rootMargin: "0px 0px -9%", threshold: 0.08 });

  document.querySelectorAll(".reveal").forEach((element) => observer.observe(element));
}

function renderLeaderboard(sortKey = "dialect") {
  const body = document.querySelector("#leaderboard-body");
  const sorted = [...LEADERBOARD].sort((a, b) => {
    if (sortKey === "gap") return a.gap - b.gap || b.dialect - a.dialect;
    return b[sortKey] - a[sortKey] || b.dialect - a.dialect;
  });

  body.replaceChildren(...sorted.map((row, index) => {
    const tr = document.createElement("tr");
    const badge = row.closed
      ? '<small>closed</small>'
      : row.bestOpen
        ? '<small>top open</small>'
        : "";
    const nameClass = row.bestOpen ? "model-name best-open" : "model-name";
    tr.innerHTML = `
      <td>${index + 1}</td>
      <td><span class="${nameClass}">${row.model}${badge}</span></td>
      <td>${row.standard.toFixed(1)}</td>
      <td>${row.PNB.toFixed(1)}</td>
      <td>${row.PNT1.toFixed(1)}</td>
      <td>${row.PNT2.toFixed(1)}</td>
      <td class="pnt3">${row.PNT3.toFixed(1)}</td>
      <td>${row.PNT4.toFixed(1)}</td>
      <td>${row.PNN.toFixed(1)}</td>
      <td class="metric-main">${row.dialect.toFixed(1)}</td>
      <td class="${row.gap <= 1.5 ? "gap-low" : ""}">${row.gap.toFixed(1)}</td>`;
    return tr;
  }));
}

function initializeLeaderboard() {
  const sort = document.querySelector("#leaderboard-sort");
  renderLeaderboard(sort.value);
  sort.addEventListener("change", () => renderLeaderboard(sort.value));
}

function initializeHeatmap() {
  document.querySelectorAll(".heatmap span[data-v]").forEach((cell) => {
    const value = Number(cell.dataset.v);
    if (value < 0) {
      const alpha = 0.4 + Math.min(Math.abs(value) / 1.5, 1) * 0.48;
      cell.style.background = `rgba(67, 151, 128, ${alpha})`;
      cell.style.color = "#082b24";
      return;
    }
    const ratio = Math.min(value / 10, 1);
    const alpha = 0.1 + ratio * 0.9;
    cell.style.background = `rgba(205, 73, 52, ${alpha})`;
    if (value >= 6) cell.style.color = "#fff";
  });
}

function initializeCitation() {
  const button = document.querySelector("#copy-bibtex");
  const citation = document.querySelector("#bibtex").textContent.trim();

  button.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(citation);
    } catch {
      const textarea = document.createElement("textarea");
      textarea.value = citation;
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      textarea.remove();
    }
    const original = button.innerHTML;
    button.textContent = "Copied ✓";
    window.setTimeout(() => { button.innerHTML = original; }, 1800);
  });
}

function parseJsonl(text) {
  return text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => JSON.parse(line));
}

function taskName(value) {
  return TASK_NAMES[String(value || "").toLowerCase()] || value || "Unknown task";
}

function createField(label, value, className = "") {
  if (value === undefined || value === null || value === "") return null;
  const section = document.createElement("section");
  section.className = `field-block ${className}`.trim();
  const fieldLabel = document.createElement("span");
  fieldLabel.textContent = label;
  section.appendChild(fieldLabel);

  if (className.includes("context-block") && String(value).length > 260) {
    const details = document.createElement("details");
    const summary = document.createElement("summary");
    summary.textContent = "Show preserved context";
    const paragraph = document.createElement("p");
    paragraph.textContent = value;
    details.append(summary, paragraph);
    section.appendChild(details);
  } else {
    const paragraph = document.createElement("p");
    paragraph.textContent = value;
    section.appendChild(paragraph);
  }
  return section;
}

function createOptions(options, goldLabel) {
  if (!Array.isArray(options) || !options.length) return null;
  const section = document.createElement("section");
  section.className = "field-block";
  const label = document.createElement("span");
  label.textContent = "Options";
  const list = document.createElement("ol");
  list.className = "option-list";

  options.forEach((option, index) => {
    const letter = String.fromCharCode(65 + index);
    const item = document.createElement("li");
    if (String(goldLabel || "").toUpperCase() === letter) item.classList.add("correct");
    const marker = document.createElement("b");
    marker.textContent = `${letter}.`;
    const text = document.createElement("span");
    text.textContent = option;
    item.append(marker, text);
    list.appendChild(item);
  });

  section.append(label, list);
  return section;
}

function renderVariant(container, variant, item, isStandard) {
  container.replaceChildren();
  if (!variant) {
    const message = document.createElement("p");
    message.textContent = "No finalized text is available for this slot.";
    container.appendChild(message);
    return;
  }

  const fields = [
    createField("Context", variant.context, "context-block"),
    createField("Premise", variant.premise, "context-block"),
    createField("Hypothesis", variant.hypothesis),
    createField("Question", variant.question),
    createField("Text", variant.text),
    createOptions(variant.options, item.label),
  ].filter(Boolean);

  if (!fields.length) {
    fields.push(createField("Content", JSON.stringify(variant, null, 2)));
  }
  container.append(...fields);

  if (isStandard) {
    const answer = Array.isArray(item.answers) && item.answers.length
      ? item.answers.join("; ")
      : item.reference || item.label;
    if (answer !== undefined && answer !== null && answer !== "") {
      const gold = document.createElement("span");
      gold.className = "gold-answer";
      gold.textContent = `Gold: ${answer}`;
      container.appendChild(gold);
    }
  }
}

function initializeExplorer() {
  const state = { cases: [], filtered: [], index: 0, dialect: "PNT3", task: "all" };
  const elements = {
    task: document.querySelector("#task-filter"),
    select: document.querySelector("#sample-select"),
    previous: document.querySelector("#prev-sample"),
    next: document.querySelector("#next-sample"),
    meta: document.querySelector("#explorer-meta"),
    tabs: document.querySelector("#dialect-tabs"),
    standard: document.querySelector("#standard-content"),
    dialect: document.querySelector("#dialect-content"),
    dialectTitle: document.querySelector("#dialect-title"),
    dialectCode: document.querySelector("#dialect-code"),
    status: document.querySelector("#dataset-status"),
  };

  function populateTabs() {
    elements.tabs.replaceChildren(...DIALECTS.map((code) => {
      const button = document.createElement("button");
      button.type = "button";
      button.role = "tab";
      button.dataset.dialect = code;
      button.setAttribute("aria-selected", String(code === state.dialect));
      button.textContent = `${code} · ${DIALECT_META[code].short}`;
      button.addEventListener("click", () => {
        state.dialect = code;
        populateTabs();
        renderCurrent();
      });
      return button;
    }));
  }

  function populateSelect() {
    elements.select.replaceChildren(...state.filtered.map((item, index) => {
      const option = document.createElement("option");
      option.value = String(index);
      option.textContent = `${String(index + 1).padStart(3, "0")} · ${item.id} · ${taskName(item.task)}`;
      return option;
    }));
    elements.select.value = String(state.index);
  }

  function renderCurrent() {
    const item = state.filtered[state.index];
    if (!item) {
      elements.meta.innerHTML = "<span>No examples match this filter.</span>";
      elements.standard.textContent = "No example selected.";
      elements.dialect.textContent = "No example selected.";
      return;
    }

    elements.select.value = String(state.index);
    elements.meta.replaceChildren(...[
      item.id,
      taskName(item.task),
      item.source_dataset,
      item.domain,
      `${item.num_dialects || 6}/6 dialects`,
    ].filter(Boolean).map((value) => {
      const span = document.createElement("span");
      span.textContent = value;
      return span;
    }));

    const meta = DIALECT_META[state.dialect];
    elements.dialectTitle.textContent = `${meta.name} · ${meta.short}`;
    elements.dialectCode.textContent = state.dialect;
    renderVariant(elements.standard, item.variants?.standard, item, true);
    renderVariant(elements.dialect, item.variants?.[state.dialect], item, false);
  }

  function applyTaskFilter(preferredId) {
    state.filtered = state.task === "all"
      ? [...state.cases]
      : state.cases.filter((item) => String(item.task).toLowerCase() === state.task);
    const preferredIndex = preferredId
      ? state.filtered.findIndex((item) => item.id === preferredId)
      : -1;
    state.index = preferredIndex >= 0 ? preferredIndex : 0;
    populateSelect();
    renderCurrent();
  }

  function move(direction) {
    if (!state.filtered.length) return;
    state.index = (state.index + direction + state.filtered.length) % state.filtered.length;
    renderCurrent();
  }

  populateTabs();
  elements.task.addEventListener("change", () => {
    state.task = elements.task.value;
    applyTaskFilter();
  });
  elements.select.addEventListener("change", () => {
    state.index = Number(elements.select.value);
    renderCurrent();
  });
  elements.previous.addEventListener("click", () => move(-1));
  elements.next.addEventListener("click", () => move(1));

  let loadingStarted = false;
  function loadDataset() {
    if (loadingStarted) return;
    loadingStarted = true;
    fetch("data/vialectbench.jsonl")
      .then((response) => {
        if (!response.ok) throw new Error(`Dataset request failed (${response.status})`);
        return response.text();
      })
      .then((text) => {
        state.cases = parseJsonl(text);
        elements.status.textContent = `${state.cases.length} source groups loaded`;
        applyTaskFilter("MCQA_0010_1");
      })
      .catch((error) => {
        elements.status.textContent = "Dataset unavailable";
        elements.meta.innerHTML = "<span>Explorer could not load</span>";
        elements.standard.textContent = "Serve this folder with a local web server to use the explorer.";
        elements.dialect.textContent = error.message;
        elements.select.innerHTML = "<option>Dataset unavailable</option>";
      });
  }

  const explorer = document.querySelector("[data-explorer]");
  if (window.location.hash === "#explorer") {
    loadDataset();
  } else if ("IntersectionObserver" in window) {
    const loadObserver = new IntersectionObserver((entries, observer) => {
      if (!entries.some((entry) => entry.isIntersecting)) return;
      observer.disconnect();
      loadDataset();
    }, { rootMargin: "500px 0px" });
    loadObserver.observe(explorer);
  } else {
    loadDataset();
  }
}

initializeNavigation();
initializeRevealMotion();
initializeLeaderboard();
initializeHeatmap();
initializeCitation();
initializeExplorer();
