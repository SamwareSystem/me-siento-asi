// @ts-check
"use strict";
/* Música de fondo: canción aleatoria de musica/lista.js, volumen 50 %, encadena otra al terminar. */
(function () {
  const VOLUME = 0.5;
  /** @type {string[]} */
  const songs = /** @type {any} */ (window).CANCIONES || [];
  if (!songs.length) return;
  const audio = new Audio();
  audio.volume = VOLUME;
  audio.preload = "auto";
  let last = -1, started = false, muted = false;

  function pick() {
    let i = Math.floor(Math.random() * songs.length);
    if (songs.length > 1 && i === last) i = (i + 1 + Math.floor(Math.random() * (songs.length - 1))) % songs.length;
    last = i;
    return i;
  }
  function next() {
    audio.src = "musica/" + encodeURIComponent(songs[pick()]);
    return audio.play();
  }
  audio.addEventListener("ended", () => { next().catch(() => {}); });
  audio.addEventListener("error", () => { if (songs.length > 1) setTimeout(() => next().catch(() => {}), 500); });

  const btn = document.createElement("button");
  btn.type = "button"; btn.className = "mus"; btn.textContent = "🔊"; btn.setAttribute("aria-label", "Silenciar música");
  btn.addEventListener("click", (e) => {
    e.stopPropagation();
    muted = !muted; audio.muted = muted;
    btn.textContent = muted ? "🔇" : "🔊";
    btn.setAttribute("aria-label", muted ? "Activar música" : "Silenciar música");
  });
  document.body.append(btn);

  const EVENTS = ["pointerdown", "touchend", "keydown", "click"];
  function arm() { EVENTS.forEach((ev) => document.addEventListener(ev, onGesture, true)); }
  function disarm() { EVENTS.forEach((ev) => document.removeEventListener(ev, onGesture, true)); }
  function onGesture() {
    if (started) return;
    next().then(() => { started = true; disarm(); }).catch(() => {});
  }
  // Intento inmediato (algunos navegadores lo permiten); si lo bloquean, arranca con el primer toque.
  next().then(() => { started = true; }).catch(() => { arm(); });
})();
