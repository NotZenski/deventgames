// Shared header, footer and scroll effects for every page. Edit links here once and they update site-wide.
document.documentElement.classList.add("js");

const NAV_LINKS = [
  { href: "/#home", label: "Home", section: "home" },
  { href: "/#about", label: "About", section: "about" },
  { href: "/#games", label: "Games", section: "games", page: "games" },
  { href: "/#contact", label: "Contact", section: "contact" },
];

const FOOTER_LINKS = [
  { href: "/#home", label: "Home" },
  { href: "/#about", label: "About" },
  { href: "/#games", label: "Games" },
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
          (l) => `<a href="${isHome ? "#" + l.section : l.href}" data-section="${l.section}"${
            l.page === page ? ' class="is-active"' : ""
          }>${l.label}</a>`
        ).join("")}
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
        <p class="footer__tag">We make games people can't stop playing.</p>
      </div>
      <nav class="footer__links" aria-label="Footer">
        ${FOOTER_LINKS.map((l) => `<a href="${l.href}">${l.label}</a>`).join("")}
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
