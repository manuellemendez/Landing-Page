import { createLiquid } from "./components/canvasui/LiquidVanilla.js";

const header = document.querySelector("[data-header]");
const navToggle = document.querySelector("[data-nav-toggle]");
const nav = document.querySelector("[data-nav]");
const navLinks = nav ? nav.querySelectorAll("a") : [];
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

const liquidRoot = document.querySelector("[data-liquid]");
const liquidSource = document.querySelector("[data-liquid-source]");
const liquidContent = document.querySelector("[data-liquid-content]");
const liquidOutput = document.querySelector("[data-liquid-output]");

const liquid =
  liquidRoot && liquidSource && liquidContent && liquidOutput
    ? createLiquid(
        {
          source: liquidSource,
          content: liquidContent,
          output: liquidOutput,
        },
        {
          simResolution: window.innerWidth < 760 ? 64 : 96,
          dyeResolution: window.innerWidth < 760 ? 192 : 320,
          densityDissipation: 0.955,
          velocityDissipation: 0.985,
          pressureIterations: 4,
          curl: 2.2,
          radius: 0.24,
          force: 0.9,
          intensity: 1.35,
          distortion: 0.2,
          blend: 3,
          color: [0.788, 0.51, 0.353],
          rainbow: false,
        },
      )
    : null;

if (liquid) {
  if (!reduceMotion.matches) {
    window.setTimeout(() => liquid.splat(0.76, 0.43, -34, 26), 500);
  }
  window.addEventListener("pagehide", () => liquid.destroy(), { once: true });
}

const closeNavigation = () => {
  if (!navToggle || !nav) return;

  navToggle.setAttribute("aria-expanded", "false");
  nav.classList.remove("is-open");
  document.body.style.overflow = "";
};

if (navToggle && nav) {
  navToggle.addEventListener("click", () => {
    const isOpen = navToggle.getAttribute("aria-expanded") === "true";
    navToggle.setAttribute("aria-expanded", String(!isOpen));
    nav.classList.toggle("is-open", !isOpen);
    document.body.style.overflow = isOpen ? "" : "hidden";
  });

  navLinks.forEach((link) => link.addEventListener("click", closeNavigation));

  window.addEventListener("resize", () => {
    if (window.innerWidth > 760) closeNavigation();
  });
}

const setHeaderState = () => {
  if (header) header.classList.toggle("is-scrolled", window.scrollY > 24);
};

setHeaderState();
window.addEventListener("scroll", setHeaderState, { passive: true });

const revealItems = document.querySelectorAll(".reveal");

if ("IntersectionObserver" in window && !reduceMotion.matches) {
  const revealObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    },
    { threshold: 0.12, rootMargin: "0px 0px -6%" },
  );

  revealItems.forEach((item, index) => {
    item.style.transitionDelay = `${Math.min(index % 3, 2) * 70}ms`;
    revealObserver.observe(item);
  });
} else {
  revealItems.forEach((item) => item.classList.add("is-visible"));
}

const hero = document.querySelector(".hero");
const heroGlow = document.querySelector("[data-hero-glow]");

if (hero && heroGlow && !reduceMotion.matches) {
  hero.addEventListener("pointermove", (event) => {
    const bounds = hero.getBoundingClientRect();
    const x = ((event.clientX - bounds.left) / bounds.width) * 100;
    const y = ((event.clientY - bounds.top) / bounds.height) * 100;
    heroGlow.style.setProperty("--glow-x", `${x}%`);
    heroGlow.style.setProperty("--glow-y", `${y}%`);
  });
}

document.querySelectorAll(".project-video-wrap").forEach((project) => {
  const video = project.querySelector("video");
  if (!video || reduceMotion.matches) return;

  project.addEventListener("mouseenter", () => {
    video.play().catch(() => {});
  });

  project.addEventListener("mouseleave", () => {
    video.pause();
  });

  project.addEventListener("focusin", () => {
    video.play().catch(() => {});
  });

  project.addEventListener("focusout", () => {
    video.pause();
  });
});

const copyButton = document.querySelector("[data-copy-email]");

if (copyButton) {
  copyButton.addEventListener("click", async () => {
    const email = copyButton.dataset.copyEmail;
    const label = copyButton.querySelector("[data-copy-label]");

    try {
      await navigator.clipboard.writeText(email);
      if (label) label.textContent = "Email copied";
      window.setTimeout(() => {
        if (label) label.textContent = "Copy email";
      }, 1800);
    } catch {
      window.location.href = `mailto:${email}`;
    }
  });
}

const year = document.querySelector("[data-year]");
if (year) year.textContent = new Date().getFullYear();
