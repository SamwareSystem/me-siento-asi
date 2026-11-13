// @ts-check
"use strict";

/** @type {{ACCESS_KEY: string}} */
const CFG = /** @type {any} */ (window).APP_CONFIG;
const ENDPOINT = "https://api.web3forms.com/submit";
const PLACEHOLDER_KEY = "PEGA_AQUI_TU_ACCESS_KEY";

/** @param {string} sel @returns {HTMLElement} */
function el(sel) {
  const node = document.querySelector(sel);
  if (!node) throw new Error(`Elemento no encontrado: ${sel}`);
  return /** @type {HTMLElement} */ (node);
}
/** @param {string} sel @param {ParentNode} [root] @returns {HTMLElement[]} */
const all = (sel, root = document) => /** @type {HTMLElement[]} */ ([...root.querySelectorAll(sel)]);

const form = /** @type {HTMLFormElement} */ (el("#form"));
const send = /** @type {HTMLButtonElement} */ (el("#send"));
const status = el("#status");
const t1 = /** @type {HTMLInputElement} */ (el("#t1"));
const t2 = /** @type {HTMLInputElement} */ (el("#t2"));

/* ---------- Preguntas condicionales ---------- */
function applyConditions() {
  all("[data-when]").forEach((box) => {
    const [name, value] = (box.dataset.when || "").split("=");
    const checked = /** @type {HTMLInputElement|null} */ (form.querySelector(`input[name="${name}"]:checked`));
    const show = checked?.value === value;
    box.hidden = !show;
    all("input,textarea", box).forEach((i) => { /** @type {HTMLInputElement} */ (i).disabled = !show; });
  });
}

/* ---------- Periodo de tiempo + latidos ---------- */
/** @param {number} m */
function fmt(m) {
  const h = Math.floor(m / 60);
  return `${h % 12 || 12}:${String(m % 60).padStart(2, "0")}${h < 12 ? "am" : "pm"}`;
}
let periodText = "";
function updatePeriod() {
  const a = Number(t1.value), b = Number(t2.value);
  const lo = Math.min(a, b), hi = Math.max(a, b);
  el("#t1v").textContent = fmt(a);
  el("#t2v").textContent = fmt(b);
  const bar = el("#bar");
  bar.style.left = `${(lo / 1439) * 100}%`;
  bar.style.width = `${Math.max(((hi - lo) / 1439) * 100, 1)}%`;
  periodText = `${fmt(lo)} a ${fmt(hi)}`;
  const prev = /** @type {HTMLInputElement|null} */ (document.querySelector("#latidos input:checked"))?.dataset.i;
  const box = el("#latidos");
  const disabled = Boolean(box.closest("[data-when]")?.hasAttribute("hidden"));
  box.replaceChildren();
  [60, 70, 80, 90, 100].forEach((bpm, i) => {
    const n = Math.round((hi - lo) * bpm).toLocaleString("es-MX");
    const label = document.createElement("label");
    const input = document.createElement("input");
    input.type = "radio"; input.name = "latidos"; input.value = `${n} latidos`; input.required = true;
    input.dataset.i = String(i); input.checked = prev === String(i); input.disabled = disabled;
    const span = document.createElement("span");
    span.textContent = `${n} latidos`;
    label.append(input, span);
    box.append(label);
  });
}
[t1, t2].forEach((r) => r.addEventListener("input", updatePeriod));

/* ---------- Corazones ---------- */
const hearts = el("#hearts");
for (let i = 1; i <= 10; i++) {
  const label = document.createElement("label");
  const input = document.createElement("input");
  input.type = "radio"; input.name = "puntaje"; input.value = String(i); input.required = true;
  input.setAttribute("aria-label", `${i} de 10`);
  const span = document.createElement("span");
  span.textContent = "♥";
  label.append(input, span);
  hearts.append(label);
}
hearts.addEventListener("change", () => {
  const v = Number(/** @type {HTMLInputElement|null} */ (hearts.querySelector("input:checked"))?.value || 0);
  all("label", hearts).forEach((l, i) => l.classList.toggle("on", i < v));
});

/* ---------- Besito ---------- */
let kissTimer = 0;
const kiss = el("#kiss"), kissText = el("#kissText");
function rain() {
  const box = el("#rain");
  box.replaceChildren();
  for (let i = 0; i < 45; i++) {
    const s = document.createElement("span");
    s.textContent = i % 3 ? "💋" : "💗";
    s.style.left = `${Math.random() * 100}%`;
    s.style.fontSize = `${1.5 + Math.random() * 2}rem`;
    s.style.animationDuration = `${3 + Math.random() * 3}s`;
    s.style.animationDelay = `${Math.random() * 3}s`;
    box.append(s);
  }
}
/** @param {boolean} yes */
function showKiss(yes) {
  window.clearTimeout(kissTimer);
  kiss.hidden = false;
  rain();
  const done = "MWAHHH 💋";
  if (yes) kissText.textContent = done;
  else {
    kissText.textContent = "Igual se lo voy a dar 😌";
    kissTimer = window.setTimeout(() => { kissText.textContent = done; }, 2200);
  }
  el("#kissClose").focus();
}
el("#kissClose").addEventListener("click", () => { window.clearTimeout(kissTimer); kiss.hidden = true; });
document.addEventListener("keydown", (e) => { if (e.key === "Escape") kiss.hidden = true; });
form.addEventListener("change", (e) => {
  applyConditions();
  const t = /** @type {HTMLInputElement} */ (e.target);
  if (t.name === "beso") showKiss(t.value === "Sí");
});

/* ---------- Envío ---------- */
/** @param {string} msg */
function fail(msg) { status.hidden = false; status.textContent = msg; }

/** Respuestas visibles, numeradas igual que en pantalla. @returns {Array<[string,string]>} */
function collect() {
  /** @type {Array<[string,string]>} */
  const out = [];
  let n = 0;
  all(".q").forEach((q) => {
    if (q.closest("[hidden]")) return;
    n++;
    const name = q.dataset.name || "";
    let answer = "";
    if (name === "periodo") answer = periodText;
    else if (name === "puntaje") {
      const v = /** @type {HTMLInputElement|null} */ (q.querySelector("input:checked"))?.value;
      answer = v ? `${v} de 10 ♥` : "";
    } else {
      const f = /** @type {HTMLInputElement|null} */ (q.querySelector("input:checked, input.txt, textarea"));
      answer = f ? f.value.trim() : "";
    }
    out.push([`${String(n).padStart(2, "0")} · ${q.dataset.label}`, answer || "(sin respuesta)"]);
  });
  return out;
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  status.hidden = true;
  if (!form.checkValidity()) { form.reportValidity(); return; }
  if (!CFG || !CFG.ACCESS_KEY || CFG.ACCESS_KEY === PLACEHOLDER_KEY) {
    fail("Falta configurar la access key en js/config.js (ver GUIA.md).");
    return;
  }
  send.disabled = true;
  send.textContent = "Enviando…";
  const ctrl = new AbortController();
  const timeout = window.setTimeout(() => ctrl.abort(), 20000);
  try {
    const res = await fetch(ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({
        access_key: CFG.ACCESS_KEY,
        subject: `💌 Me siento así… (${new Date().toLocaleString("es-MX")})`,
        from_name: "Me siento así…",
        botcheck: /** @type {HTMLInputElement} */ (el("#botcheck")).checked,
        // Un campo por pregunta, en orden: Web3Forms los muestra como Pregunta | Respuesta.
        ...Object.fromEntries(collect()),
      }),
      signal: ctrl.signal,
    });
    /** @type {{success?: boolean, message?: string}} */
    const data = await res.json();
    if (!res.ok || !data.success) throw new Error(data.message || `Error ${res.status}`);
    form.hidden = true;
    el("#thanks").hidden = false;
    el("#msg").textContent = "";
    confetti(innerWidth / 2, innerHeight / 3);
    window.scrollTo({ top: 0, behavior: "smooth" });
  } catch (err) {
    const aborted = err instanceof DOMException && err.name === "AbortError";
    fail(aborted ? "Tardó demasiado. Revisa tu internet y vuelve a tocar Enviar." : "No se pudo enviar. Tus respuestas siguen aquí; intenta de nuevo en un momento.");
    console.error(err);
    send.disabled = false;
    send.textContent = "Enviar 💌";
  } finally {
    window.clearTimeout(timeout);
  }
});

/* ---------- Decoración ---------- */
/** @param {string} c @returns {string} */
const HT = (c) => `<svg class="${c}" viewBox="-.7 -.55 1.4 1.2"><use href="#h"/></svg>`;
el("#hs").innerHTML = HT("hrt b") + HT("hrt a") + HT("hrt c");
all("[data-hs]").forEach((n) => { n.innerHTML = HT("hrt b") + HT("hrt a") + HT("hrt c"); });
all("[data-h]").forEach((n) => { n.innerHTML = HT("hrt"); });
el("#ft").innerHTML = `con mucho cariño ${HT("hrt")}`;
all("svg.hrt:not([viewBox])").forEach((n) => n.setAttribute("viewBox", "-.7 -.55 1.4 1.2"));
[["left:-13px;top:-12px", "var(--rose)"], ["right:-13px;top:-12px", "var(--lil)"], ["left:-13px;bottom:-12px", "var(--lil)"], ["right:-13px;bottom:-12px", "var(--rose)"]].forEach(([pos, col]) => {
  const i = document.createElement("i");
  i.className = "cn"; i.style.cssText = `${pos};color:${col}`; i.innerHTML = HT("hrt");
  /** @type {SVGElement} */ (i.firstChild).style.cssText = "width:26px;height:23px";
  el("#app").append(i);
});
const cols = ["#F7BFD0", "#CDB8F0", "#FFD3C2", "#F9C9D8"];
for (let i = 0; i < 16; i++) {
  const e = document.createElement("i"), s = 14 + Math.random() * 20;
  e.className = "fl"; e.innerHTML = HT("hrt");
  /** @type {SVGElement} */ (e.firstChild).style.cssText = `width:${s}px;height:${s * 0.86}px`;
  e.style.cssText = `left:${Math.random() * 96}vw;top:${Math.random() * 92}vh;color:${cols[i % 4]};animation-delay:-${Math.random() * 6}s`;
  document.body.append(e);
}
/** @param {number} x @param {number} y */
function confetti(x, y) {
  for (let i = 0; i < 14; i++) {
    const e = document.createElement("i");
    e.className = "cf"; e.innerHTML = HT("hrt");
    e.style.cssText = `left:${x}px;top:${y}px;color:${["#E85D82", "#8F6CD0", "#EE7A58", "#F5A9BF"][i % 4]};--x:${(Math.random() - 0.5) * 240}px;--y:${-60 - Math.random() * 170}px;--r:${(Math.random() - 0.5) * 160}deg`;
    document.body.append(e);
    setTimeout(() => e.remove(), 1000);
  }
}
function progress() {
  const qs = all(".q").filter((q) => !q.closest("[hidden]"));
  const done = qs.filter((q) => q.dataset.name === "periodo" || q.querySelector("input:checked") || /** @type {HTMLInputElement|null} */ (q.querySelector("input.txt, textarea"))?.value.trim()).length;
  el("#pbar").style.width = `${(done / qs.length) * 100}%`;
  el("#msg").textContent = `Has respondido ${done} de ${qs.length} preguntas`;
}
form.addEventListener("input", progress);
form.addEventListener("change", progress);
form.addEventListener("click", (e) => { if (/** @type {HTMLElement} */ (e.target).closest(".hearts label")) confetti(/** @type {MouseEvent} */ (e).clientX, /** @type {MouseEvent} */ (e).clientY); });

applyConditions();
updatePeriod();
progress();
