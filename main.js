// FormSubmit (formsubmit.co) alias that forwards contact form messages to our inbox.
// Never put the real email address here: this file is public.
const FORM_ALIAS = "b3d99e31d7062b59e10abb33a99c02bc";
// Submissions faster than this after page load are treated as bots.
const MIN_FILL_MS = 3000;
const formLoadedAt = Date.now();

// Roblox's API blocks browser requests, so live counts go through the RoProxy mirror.
const LIVE_STATS_URL = "https://games.roproxy.com/v1/games?universeIds=";
const LIVE_REFRESH_MS = 60000;
const WALL_ROWS = 6;

const ICONS = {
  eye: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5c5 0 9 4.5 10 7-1 2.5-5 7-10 7S3 14.5 2 12c1-2.5 5-7 10-7Zm0 3a4 4 0 1 0 0 8 4 4 0 0 0 0-8Zm0 2a2 2 0 1 1 0 4 2 2 0 0 1 0-4Z"/></svg>',
  star: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m12 2 3 6.6 7 .8-5.2 4.8 1.4 7L12 17.7 5.8 21.2l1.4-7L2 9.4l7-.8L12 2Z"/></svg>',
  play: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 4.5v15a1 1 0 0 0 1.5.86l12.5-7.5a1 1 0 0 0 0-1.72L8.5 3.64A1 1 0 0 0 7 4.5Z"/></svg>',
  verified: '<svg class="verified" viewBox="0 0 24 24" aria-label="Verified"><path d="m12 1 2.8 2.2 3.5-.4.9 3.4 3 1.9-1.3 3.3 1.3 3.3-3 1.9-.9 3.4-3.5-.4L12 23l-2.8-2.2-3.5.4-.9-3.4-3-1.9L3.1 12.6 1.8 9.3l3-1.9.9-3.4 3.5.4L12 1Zm-1.3 14.6 6-6-1.4-1.4-4.6 4.6-2.1-2.1-1.4 1.4 3.5 3.5Z"/></svg>',
};

function formatCount(n) {
  const units = [[1e9, "B"], [1e6, "M"], [1e3, "K"]];
  for (let i = 0; i < units.length; i++) {
    const [size, suffix] = units[i];
    if (n >= size * 0.99995) {
      const value = Number((n / size).toFixed(1));
      if (value >= 1000 && i > 0) return Number((n / units[i - 1][0]).toFixed(1)) + units[i - 1][1];
      return value + suffix;
    }
  }
  return String(n);
}

const fullCount = (n) => Number(n || 0).toLocaleString("en-US");

function esc(text) {
  return String(text ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
}

function shuffled(list) {
  const copy = [...list];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function animateNumber(el, target, format) {
  if (!el) return;
  const duration = 1200;
  const start = performance.now();
  function tick(now) {
    const t = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - t, 3);
    el.textContent = format(Math.round(target * eased));
    if (t < 1) requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}

function setLive(el, text) {
  if (!el || el.textContent === text) return;
  el.textContent = text;
  el.classList.remove("tick");
  void el.offsetWidth;
  el.classList.add("tick");
}

/* Hero background: tilted rows of game icons scrolling in alternate directions */
function renderHeroWall() {
  const wall = document.getElementById("hero-wall");
  if (!wall) return;
  const thumbs = GAMES.map((g) => g.thumb || g.image).filter(Boolean);
  if (!thumbs.length) return;
  const slowdown = matchMedia("(prefers-reduced-motion: reduce)").matches ? 3 : 1;

  for (let r = 0; r < WALL_ROWS; r++) {
    const track = document.createElement("div");
    track.className = r % 2 ? "wall-track reverse" : "wall-track";
    const duration = (70 + Math.random() * 40) * slowdown;
    track.style.animationDuration = `${duration}s`;
    track.style.animationDelay = `-${Math.random() * duration}s`;

    // Two identical copies so translating by -50% loops seamlessly.
    const order = shuffled(thumbs);
    [...order, ...order].forEach((src) => {
      const img = document.createElement("img");
      img.src = src;
      img.alt = "";
      img.decoding = "async";
      track.appendChild(img);
    });
    wall.appendChild(track);
  }
}

function renderMarquee() {
  const track = document.getElementById("marquee");
  if (!track) return;
  const items = GAMES.map(
    (g) => `
    <a class="marquee__item" href="${esc(g.link)}" target="_blank" rel="noopener" tabindex="-1">
      <img src="${esc(g.thumb || g.image)}" alt="" loading="lazy" />
      <span><b>${esc(g.title)}</b> · <span data-live="plays" data-universe="${g.universeId}">${formatCount(g.plays)}</span> visits</span>
    </a>`
  ).join("");
  track.innerHTML = items + items;
}

function renderTeam() {
  const grid = document.getElementById("team");
  if (!grid || typeof TEAM === "undefined") return;
  grid.innerHTML = TEAM.map(
    (m, i) => `
    <a class="member reveal" style="--d:${i * 90}ms" href="${esc(m.link)}" target="_blank" rel="noopener">
      <span class="member__avatar">${m.avatar ? `<img src="${esc(m.avatar)}" alt="" loading="lazy" />` : ""}</span>
      <span class="member__name">${esc(m.name)}${m.verified ? ICONS.verified : ""}</span>
      <span class="member__handle">@${esc(m.username)}</span>
      <span class="member__role${m.role === "Founder" ? " member__role--founder" : ""}">${esc(m.role)}</span>
      <span class="member__link">View profile →</span>
    </a>`
  ).join("");
  observeReveals(grid);
}

/* Games grid with sorting */
let currentSort = document.getElementById("game-grid")?.dataset.sort || "playing";

function sortedGames() {
  const list = [...GAMES];
  if (currentSort === "plays") list.sort((a, b) => b.plays - a.plays);
  else if (currentSort === "newest") list.sort((a, b) => new Date(b.created || 0) - new Date(a.created || 0));
  else list.sort((a, b) => b.playing - a.playing || b.plays - a.plays);
  return list;
}

function gameCard(g, i, showPlaying = true) {
  const media = g.wide || g.image;
  return `
    <article class="game reveal" style="--d:${(i % 3) * 90}ms">
      <a class="game__media" href="${esc(g.link)}" target="_blank" rel="noopener" aria-label="Play ${esc(g.title)}">
        ${media ? `<img src="${esc(media)}" alt="" loading="lazy" decoding="async" />` : ""}
        ${showPlaying ? `<span class="badge"><span class="live-dot" aria-hidden="true"></span><span data-live="playing" data-universe="${g.universeId}">${fullCount(g.playing)}</span> playing</span>` : ""}
      </a>
      <div class="game__body">
        <h3 class="game__title"><a href="${esc(g.link)}" target="_blank" rel="noopener">${esc(g.title)}</a></h3>
        ${g.creator ? `<div class="game__by">by <a href="${esc(g.creatorLink)}" target="_blank" rel="noopener">${esc(g.creator)}</a></div>` : ""}
        <div class="game__meta">
          <span title="${fullCount(g.plays)} visits">${ICONS.eye}<b data-live="plays" data-universe="${g.universeId}">${formatCount(g.plays)}</b> visits</span>
          <span title="${fullCount(g.favorites)} favorites">${ICONS.star}<b data-live="favorites" data-universe="${g.universeId}">${formatCount(g.favorites || 0)}</b> favorites</span>
        </div>
        <div class="game__footer">
          <a class="game__play" href="${esc(g.link)}" target="_blank" rel="noopener">${ICONS.play} Play</a>
        </div>
      </div>
    </article>`;
}

function renderGames() {
  const grid = document.getElementById("game-grid");
  if (!grid) return;
  const limit = Number(grid.dataset.limit) || GAMES.length;
  const showPlaying = grid.dataset.playing !== "hide";
  grid.innerHTML = sortedGames().slice(0, limit).map((g, i) => gameCard(g, i, showPlaying)).join("");
  observeReveals(grid);
}

function setupSort() {
  const group = document.getElementById("sort");
  if (!group) return;
  group.addEventListener("click", (e) => {
    const btn = e.target.closest("button[data-sort]");
    if (!btn || btn.dataset.sort === currentSort) return;
    currentSort = btn.dataset.sort;
    group.querySelectorAll("button").forEach((b) => b.classList.toggle("is-active", b === btn));
    renderGames();
  });
}

/* Live stats: totals, game cards and marquee refresh every minute */
async function fetchLiveStats() {
  const byId = new Map(GAMES.filter((g) => g.universeId).map((g) => [g.universeId, g]));
  const ids = [...byId.keys()];
  for (let i = 0; i < ids.length; i += 50) {
    const res = await fetch(LIVE_STATS_URL + ids.slice(i, i + 50).join(","));
    if (!res.ok) throw new Error(res.statusText);
    const { data } = await res.json();
    for (const live of data) {
      const game = byId.get(live.id);
      if (!game) continue;
      if (live.visits) game.plays = live.visits;
      if (live.favoritedCount) game.favorites = live.favoritedCount;
      game.playing = live.playing || 0;
    }
  }
}

function setupLiveStats() {
  const statEls = {
    plays: document.getElementById("stat-plays"),
    playing: document.getElementById("stat-playing"),
    favorites: document.getElementById("stat-favorites"),
  };
  const aboutPlays = document.getElementById("about-plays");
  const plus = (n) => formatCount(n) + "+";
  const formats = { plays: plus, playing: formatCount, favorites: plus };
  let firstRender = true;

  function show() {
    const totals = { plays: 0, playing: 0, favorites: 0 };
    for (const g of GAMES) for (const key in totals) totals[key] += g[key] || 0;
    for (const key in statEls) {
      if (firstRender) animateNumber(statEls[key], totals[key], formats[key]);
      else setLive(statEls[key], formats[key](totals[key]));
    }
    if (aboutPlays) aboutPlays.textContent = plus(totals.plays);

    const byId = new Map(GAMES.map((g) => [String(g.universeId), g]));
    document.querySelectorAll("[data-live][data-universe]").forEach((el) => {
      const game = byId.get(el.dataset.universe);
      if (!game) return;
      const key = el.dataset.live;
      setLive(el, key === "playing" ? fullCount(game.playing) : formatCount(game[key] || 0));
    });
    firstRender = false;
  }

  async function refresh() {
    try {
      await fetchLiveStats();
    } catch {
      if (!firstRender) return;
    }
    show();
  }

  refresh();
  setInterval(refresh, LIVE_REFRESH_MS);
}

function setupContactForm() {
  const form = document.getElementById("contact-form");
  if (!form) return;
  const status = form.querySelector(".form-status");
  const button = form.querySelector("button");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const looksLikeBot = form._honey.value || Date.now() - formLoadedAt < MIN_FILL_MS;
    if (looksLikeBot) {
      form.reset();
      status.className = "form-status ok";
      status.textContent = "Thanks! Your message was sent. We'll get back to you soon.";
      return;
    }
    button.disabled = true;
    status.className = "form-status";
    status.textContent = "Sending...";
    try {
      if (!FORM_ALIAS) throw new Error("Contact form not configured");
      const res = await fetch(`https://formsubmit.co/ajax/${FORM_ALIAS}`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          email: form.email.value,
          message: form.message.value,
          over_13: "Yes",
          _subject: "New message from nomadstudios.gg",
          _template: "table",
          _captcha: "false",
          _blacklist: "crypto, bitcoin, seo services, backlinks, casino, viagra, porn",
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || String(data.success) !== "true") throw new Error(data.message || res.statusText);
      form.reset();
      status.classList.add("ok");
      status.textContent = "Thanks! Your message was sent. We'll get back to you soon.";
    } catch {
      status.classList.add("error");
      status.textContent = "Something went wrong sending your message. Please try again later.";
    } finally {
      button.disabled = false;
    }
  });
}

if (typeof GAMES !== "undefined") {
  renderHeroWall();
  renderMarquee();
  renderTeam();
  renderGames();
  setupSort();
  setupLiveStats();
}
setupContactForm();
