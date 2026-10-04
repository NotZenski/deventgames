// Shared header and footer for every page. Edit links here once and they update site-wide.
const NAV_LINKS = [
  { href: "index.html", label: "Home", page: "home" },
  { href: "games.html", label: "Games", page: "games" },
  { href: "index.html#about", label: "About" },
  { href: "index.html#contact", label: "Contact" },
];

const FOOTER_COLUMNS = [
  {
    title: "Games",
    links: [
      { href: "index.html#games", label: "Top games" },
      { href: "games.html", label: "All games" },
    ],
  },
  {
    title: "Company",
    links: [
      { href: "index.html#about", label: "About us" },
      { href: "index.html#contact", label: "Contact" },
    ],
  },
  {
    title: "Legal",
    links: [
      { href: "privacy.html", label: "Privacy Policy" },
      { href: "terms.html", label: "Terms of Service" },
    ],
  },
];

function renderHeader() {
  const el = document.getElementById("site-header");
  if (!el) return;
  const current = document.body.dataset.page;
  el.className = "nav";
  el.innerHTML = `
    <a class="brand" href="index.html">
      <img class="logo-tile" src="assets/logo.png" alt="" width="40" height="40" />
      <span>Devent</span>
    </a>
    <button class="nav-toggle" aria-label="Open menu" aria-expanded="false">
      <span></span><span></span><span></span>
    </button>
    <nav class="nav-links">
      ${NAV_LINKS.map(
        (l) => `<a href="${l.href}"${l.page === current ? ' class="active"' : ""}>${l.label}</a>`
      ).join("")}
    </nav>`;

  const toggle = el.querySelector(".nav-toggle");
  const links = el.querySelector(".nav-links");
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

function renderFooter() {
  const el = document.getElementById("site-footer");
  if (!el) return;
  el.className = "footer";
  el.innerHTML = `
    <div class="footer-grid">
      <div class="footer-brand">
        <a class="brand" href="index.html">
          <img class="logo-tile" src="assets/logo.png" alt="" width="40" height="40" />
          <span>Devent Games</span>
        </a>
        <p>We make games people can't stop playing.</p>
      </div>
      ${FOOTER_COLUMNS.map(
        (col) => `
        <div class="footer-col">
          <h4>${col.title}</h4>
          ${col.links.map((l) => `<a href="${l.href}">${l.label}</a>`).join("")}
        </div>`
      ).join("")}
    </div>
    <div class="footer-bottom">
      <p>&copy; ${new Date().getFullYear()} Devent Inc. All rights reserved.</p>
      <p>Roblox is a trademark of Roblox Corporation. Devent Games is not affiliated with or endorsed by Roblox.</p>
    </div>`;
}

renderHeader();
renderFooter();
