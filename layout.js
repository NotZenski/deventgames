// Shared header, footer and scroll effects for every page. Edit links here once and they update site-wide.
document.documentElement.classList.add("js");

const DISCORD_INVITE = "JsSbcFWZdx";
const DISCORD_URL = `https://discord.gg/${DISCORD_INVITE}`;
const DISCORD_ICON =
  '<svg class="ico" viewBox="0 0 24 24" aria-hidden="true"><path d="M20.32 4.37a19.8 19.8 0 0 0-4.89-1.52.07.07 0 0 0-.08.04c-.2.37-.44.86-.6 1.25a18.27 18.27 0 0 0-5.5 0 12.6 12.6 0 0 0-.61-1.25.08.08 0 0 0-.08-.04 19.74 19.74 0 0 0-4.88 1.52.07.07 0 0 0-.04.03C.53 9.05-.32 13.58.1 18.06a.08.08 0 0 0 .03.05 19.9 19.9 0 0 0 6 3.03.08.08 0 0 0 .08-.02c.46-.63.87-1.3 1.23-2a.08.08 0 0 0-.04-.1 13.1 13.1 0 0 1-1.87-.9.08.08 0 0 1 0-.12l.36-.3a.07.07 0 0 1 .08 0c3.93 1.8 8.18 1.8 12.06 0a.07.07 0 0 1 .08 0l.37.3a.08.08 0 0 1 0 .12c-.6.35-1.22.65-1.87.9a.08.08 0 0 0-.04.1c.36.7.77 1.37 1.22 2a.08.08 0 0 0 .09.02 19.84 19.84 0 0 0 6-3.03.08.08 0 0 0 .03-.05c.5-5.18-.84-9.68-3.55-13.66a.06.06 0 0 0-.03-.03ZM8.02 15.33c-1.18 0-2.16-1.08-2.16-2.42 0-1.33.96-2.42 2.16-2.42 1.21 0 2.18 1.1 2.16 2.42 0 1.34-.96 2.42-2.16 2.42Zm7.97 0c-1.18 0-2.15-1.08-2.15-2.42 0-1.33.95-2.42 2.15-2.42 1.21 0 2.18 1.1 2.16 2.42 0 1.34-.95 2.42-2.16 2.42Z"/></svg>';

const NAV_LINKS = [
  { href: "/#home", label: "Home", section: "home" },
  { href: "/#about", label: "About", section: "about" },
  { href: "/games", label: "Games", page: "games" },
  { href: "/#contact", label: "Contact", section: "contact" },
];

const FOOTER_LINKS = [
  { href: "/#home", label: "Home" },
  { href: "/#about", label: "About" },
  { href: "/games", label: "Games" },
  { href: DISCORD_URL, label: "Discord" },
  { href: "/#contact", label: "Contact" },
  { href: "/privacy", label: "Privacy" },
  { href: "/terms", label: "Terms" },
];

const isHome = document.body.dataset.page === "home";

function brandMarkup() {
  return `
    <a class="brand" href="/#home" aria-label="Nomad Studios home">
      <img class="logo-tile" src="/assets/logo.png" alt="" width="36" height="36" />
      <span>Nomad Studios</span>
    </a>`;
}

function renderHeader() {
  const el = document.getElementById("site-header");
  if (!el) return;
  const page = document.body.dataset.page;
  el.className = isHome ? "nav" : "nav is-solid";
  el.innerHTML = `
    <div class="container nav__inner">
      ${brandMarkup()}
      <nav class="nav__links" id="nav-links" aria-label="Primary">
        ${NAV_LINKS.map(
          (l) => `<a href="${isHome && l.section ? "#" + l.section : l.href}"${l.section ? ` data-section="${l.section}"` : ""}${
            l.page === page ? ' class="is-active"' : ""
          }>${l.label}</a>`
        ).join("")}
        <a class="nav__discord" href="${DISCORD_URL}" target="_blank" rel="noopener">${DISCORD_ICON} Discord</a>
      </nav>
      <button class="nav__toggle" aria-label="Open menu" aria-expanded="false" aria-controls="nav-links">
        <span></span><span></span><span></span>
      </button>
    </div>`;

  const toggle = el.querySelector(".nav__toggle");
  const links = el.querySelector(".nav__links");
  const close = () => {
    links.classList.remove("is-open");
    toggle.setAttribute("aria-expanded", "false");
  };
  toggle.addEventListener("click", () => {
    const open = links.classList.toggle("is-open");
    toggle.setAttribute("aria-expanded", open);
  });
  links.addEventListener("click", (e) => {
    if (e.target.tagName === "A") close();
  });

  if (!isHome) return;
  const onScroll = () => el.classList.toggle("is-scrolled", window.scrollY > 20);
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  const navLinks = [...links.querySelectorAll("a")];
  const spy = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        navLinks.forEach((a) => a.classList.toggle("is-active", a.dataset.section === entry.target.id));
      }
    },
    { rootMargin: "-45% 0px -50% 0px" }
  );
  NAV_LINKS.forEach((l) => {
    const section = document.getElementById(l.section);
    if (section) spy.observe(section);
  });
}

function renderFooter() {
  const el = document.getElementById("site-footer");
  if (!el) return;
  el.className = "footer";
  el.innerHTML = `
    <div class="container footer__inner">
      <div>
        ${brandMarkup()}
        <p class="footer__tag">Worlds worth wandering.</p>
      </div>
      <nav class="footer__links" aria-label="Footer">
        ${FOOTER_LINKS.map(
          (l) => `<a href="${l.href}"${l.href.startsWith("http") ? ' target="_blank" rel="noopener"' : ""}>${l.label}</a>`
        ).join("")}
      </nav>
    </div>
    <div class="container footer__bottom">
      <span>&copy; ${new Date().getFullYear()} Nomad Studios, a Devent company. All rights reserved.</span>
      <span>Roblox is a trademark of Roblox Corporation. Nomad Studios is not endorsed by Roblox.</span>
    </div>`;
}

const revealObserver =
  "IntersectionObserver" in window
    ? new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (!entry.isIntersecting) continue;
            entry.target.classList.add("is-in");
            revealObserver.unobserve(entry.target);
          }
        },
        { rootMargin: "0px 0px -8% 0px" }
      )
    : null;

function observeReveals(root = document) {
  root.querySelectorAll(".reveal:not(.is-in)").forEach((el) => {
    if (revealObserver) revealObserver.observe(el);
    else el.classList.add("is-in");
  });
}

function cleanAddress() {
  const path = location.pathname;
  if (!path.endsWith(".html") || path.endsWith("/404.html")) return;
  const clean = path.replace(/(index)?\.html$/, "") || "/";
  history.replaceState(null, "", clean + location.search + location.hash);
}

cleanAddress();
renderHeader();
renderFooter();
observeReveals();
