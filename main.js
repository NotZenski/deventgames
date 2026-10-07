// FormSubmit (formsubmit.co) alias that forwards contact form messages to our inbox.
// Never put the real email address here: this file is public.
const FORM_ALIAS = "b3d99e31d7062b59e10abb33a99c02bc";
// Submissions faster than this after page load are treated as bots.
const MIN_FILL_MS = 3000;
const formLoadedAt = Date.now();

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

function placeholderColor(title) {
  let hash = 0;
  for (const ch of title) hash = (hash * 31 + ch.charCodeAt(0)) % 30;
  return `linear-gradient(45deg, hsl(${hash}, 100%, 50%), hsl(${hash + 25}, 100%, 50%))`;
}

function renderGames() {
  const grid = document.getElementById("game-grid");
  if (!grid) return;
  const limit = Number(grid.dataset.limit) || GAMES.length;
  grid.innerHTML = "";

  for (const game of GAMES.slice(0, limit)) {
    const card = document.createElement("article");
    card.className = "game-card";

    const thumb = document.createElement("div");
    thumb.className = "game-thumb";
    if (game.image) {
      const img = document.createElement("img");
      img.src = game.image;
      img.alt = game.title;
      img.loading = "lazy";
      thumb.appendChild(img);
    } else {
      thumb.style.background = placeholderColor(game.title);
      thumb.textContent = game.title.charAt(0);
    }

    const title = document.createElement("h3");
    title.textContent = game.title;

    const plays = document.createElement("div");
    plays.className = "plays";
    plays.innerHTML = `<span class="play-icon">&#9654;</span><b>${formatCount(game.plays)}</b> plays`;
    if (game.universeId) plays.querySelector("b").dataset.universe = game.universeId;

    card.append(thumb, title, plays);

    if (game.link) {
      const btn = document.createElement("a");
      btn.className = "btn btn-dark";
      btn.href = game.link;
      btn.target = "_blank";
      btn.rel = "noopener";
      btn.textContent = "Play Game";
      card.appendChild(btn);
    } else {
      const soon = document.createElement("span");
      soon.className = "btn btn-dark disabled";
      soon.textContent = "Coming Soon";
      card.appendChild(soon);
    }

    grid.appendChild(card);
  }
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

// Roblox's API blocks browser requests, so live counts go through the RoProxy mirror.
const LIVE_STATS_URL = "https://games.roproxy.com/v1/games?universeIds=";
const LIVE_REFRESH_MS = 60000;

// Updates GAMES in place with the latest visits and active players.
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
      game.playing = live.playing || 0;
    }
  }
}

function setupLiveStats() {
  const playingEl = document.getElementById("stat-playing");
  const playsEl = document.getElementById("stat-plays");
  const aboutPlays = document.getElementById("about-plays");
  const playsText = (n) => formatCount(n) + "+";
  let firstRender = true;

  function show() {
    const playing = GAMES.reduce((sum, g) => sum + (g.playing || 0), 0);
    const plays = GAMES.reduce((sum, g) => sum + (g.plays || 0), 0);
    if (firstRender) {
      animateNumber(playingEl, playing, formatCount);
      animateNumber(playsEl, plays, playsText);
    } else {
      if (playingEl) playingEl.textContent = formatCount(playing);
      if (playsEl) playsEl.textContent = playsText(plays);
    }
    if (aboutPlays) aboutPlays.textContent = playsText(plays);
    document.querySelectorAll(".plays b[data-universe]").forEach((b) => {
      const game = GAMES.find((g) => String(g.universeId) === b.dataset.universe);
      if (game) b.textContent = formatCount(game.plays);
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

function renderStats() {
  setupLiveStats();
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
          _subject: "New message from deventgames.com",
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

const WALL_ROWS = 6;

function shuffled(list) {
  const copy = [...list];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

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

if (typeof GAMES !== "undefined") {
  renderHeroWall();
  renderGames();
  renderStats();
}
setupContactForm();
