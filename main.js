// FormSubmit (formsubmit.co) alias that forwards contact form messages to our inbox.
// Never put the real email address here: this file is public.
const FORM_ALIAS = "b3d99e31d7062b59e10abb33a99c02bc";
// Submissions faster than this after page load are treated as bots.
const MIN_FILL_MS = 3000;
const formLoadedAt = Date.now();

function formatCount(n) {
  if (n >= 1e9) return (n / 1e9).toFixed(1).replace(/\.0$/, "") + "B";
  if (n >= 1e6) return (n / 1e6).toFixed(1).replace(/\.0$/, "") + "M";
  if (n >= 1e3) return (n / 1e3).toFixed(1).replace(/\.0$/, "") + "K";
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

function renderStats() {
  const released = GAMES.filter((g) => g.link).length;
  const totalPlays = GAMES.reduce((sum, g) => sum + (g.plays || 0), 0);
  animateNumber(document.getElementById("stat-games"), released, String);
  animateNumber(document.getElementById("stat-plays"), totalPlays, (n) => formatCount(n) + "+");
  const aboutPlays = document.getElementById("about-plays");
  if (aboutPlays) aboutPlays.textContent = formatCount(totalPlays) + "+";
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

if (typeof GAMES !== "undefined") {
  renderGames();
  renderStats();
}
setupContactForm();
