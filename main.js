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
  grid.innerHTML = "";

  for (const game of GAMES) {
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

function setupNav() {
  const toggle = document.querySelector(".nav-toggle");
  const links = document.querySelector(".nav-links");
  toggle.addEventListener("click", () => {
    const open = links.classList.toggle("open");
    toggle.setAttribute("aria-expanded", open);
  });
  links.addEventListener("click", (e) => {
    if (e.target.tagName === "A") {
      links.classList.remove("open");
      toggle.setAttribute("aria-expanded", "false");
    }
  });
}

renderGames();
setupNav();

const released = GAMES.filter((g) => g.link).length;
const totalPlays = GAMES.reduce((sum, g) => sum + (g.plays || 0), 0);
animateNumber(document.getElementById("stat-games"), released, String);
animateNumber(document.getElementById("stat-plays"), totalPlays, (n) => formatCount(n) + "+");

document.getElementById("year").textContent = new Date().getFullYear();
