# Apple-Style Portfolio Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild the portfolio page as an apple.com-style product page — system font stack, light base with two near-black chapters, `#0071e3` accent, componentized sections.

**Architecture:** `Portfolio.jsx` becomes pure composition. All copy moves to `src/data/content.js`. Four hooks in `src/hooks/` carry behavior (reveal, scroll state, mobile nav sheet, copy-email). Nine components in `src/sections/` render bands, with one reusable `Feature.jsx` driving all three feature sections via a `tone` prop. Styles split into `src/styles/{index,tokens,base,sections}.css`.

**Tech Stack:** Vite 7, React 19, plain CSS, pnpm. No new dependencies.

**Spec:** `docs/superpowers/specs/2026-08-05-apple-redesign-design.md`

## Global Constraints

- **No new dependencies.** `package.json` must be unchanged at the end.
- **No webfonts.** Font stack is exactly: `-apple-system, BlinkMacSystemFont, "SF Pro Display", "Helvetica Neue", Helvetica, Arial, sans-serif`
- **Max font-weight is 600.** Never 700 or 800 anywhere.
- **Tightest letter-spacing is `-0.015em`.** Never tighter.
- **Colors are only these:** `#ffffff` `#f5f5f7` `#000000` `#1d1d1f` `#6e6e73` `#86868b` `#d2d2d7` `#0071e3` `#0077ed`. No terracotta, no other hues.
- **Easing is `cubic-bezier(0.4, 0, 0.2, 1)`.** No overshoot curves.
- **One breakpoint: `768px`.** Do not add others.
- **Never touch** `resume.html`, `resume.css`, `src/Resume.jsx`, `src/resume-main.jsx`, or anything in `public/`.
- **All motion gated** behind `prefers-reduced-motion: reduce`.
- **Verification is build + browser, not unit tests.** This project has no test framework and the spec does not call for adding one. Every task ends with `pnpm build` passing plus a named Playwright check. Do not add Vitest.

---

## File Structure

| File | Responsibility |
| --- | --- |
| `src/data/content.js` | Every string on the page. No JSX. |
| `src/hooks/useReveal.js` | IntersectionObserver adds `.is-visible` to `.reveal` |
| `src/hooks/useScrolled.js` | Boolean: has the page scrolled past 24px |
| `src/hooks/useNavSheet.js` | Mobile sheet open/close, focus trap, Esc, scroll lock |
| `src/hooks/useCopyEmail.js` | Clipboard write, mailto fallback, label reset |
| `src/sections/Nav.jsx` | Sticky header, wordmark, links, mobile sheet |
| `src/sections/Hero.jsx` | Centered display name, tagline, two links |
| `src/sections/HeroMedia.jsx` | Portrait band |
| `src/sections/Feature.jsx` | Reusable band: eyebrow + headline + body + `children` |
| `src/sections/Experience.jsx` | Three hairline rows, slotted into Feature 2 |
| `src/sections/Work.jsx` | Two project cards + GitHub link, slotted into Feature 3 |
| `src/sections/Specs.jsx` | Tech-specs `<table>` |
| `src/sections/CallToAction.jsx` | Closing statement, pill button, copy-email |
| `src/sections/Footer.jsx` | Hairline footer |
| `src/styles/index.css` | `@import`s the three below, in order |
| `src/styles/tokens.css` | CSS custom properties |
| `src/styles/base.css` | Reset, typography classes, bands, buttons, reveal, a11y utilities |
| `src/styles/sections.css` | Per-band layout + the 768px breakpoint |
| `src/Portfolio.jsx` | **Rewritten.** Composition only. |
| `src/main.jsx` | **Modified.** Import `./styles/index.css`. |
| `index.html` | **Modified.** Drop font links, update `theme-color`. |
| `style.css` | **Deleted.** |
| `components/canvasui/LiquidVanilla.js` | **Deleted** (with the `components/` tree). |

---

### Task 1: Branch and content data

**Files:**
- Create: `src/data/content.js`

**Interfaces:**
- Consumes: nothing
- Produces: named exports `nav`, `hero`, `heroMedia`, `features`, `experience`, `projects`, `github`, `specs`, `contact`, `footer`. `features` is an array of exactly 3 objects each shaped `{ id, eyebrow, title, body, tone }` where `tone` is `"light" | "grey" | "dark"`. Every later task imports from this file and must not hardcode copy.

- [ ] **Step 1: Cut the working branch**

```bash
git checkout -b apple-redesign
```

- [ ] **Step 2: Create the content module**

Create `src/data/content.js`:

```js
export const nav = {
  links: [
    { label: "Approach", href: "#approach" },
    { label: "Experience", href: "#experience" },
    { label: "Work", href: "#work" },
    { label: "Résumé", href: "resume.html" },
  ],
  cta: { label: "Contact", href: "#contact" },
};

export const hero = {
  name: "Manuel Mendez",
  tagline: ["Front-end engineering.", "Made clear."],
  links: [
    { label: "See the work", href: "#work" },
    { label: "Résumé", href: "resume.html" },
  ],
};

export const heroMedia = {
  src: "/Images/Me.jpg",
  alt: "Portrait of Manuel Mendez",
  width: 709,
  height: 938,
  caption: "Calgary, Canada · English / Español",
};

export const features = [
  {
    id: "approach",
    eyebrow: "Approach",
    title: "Product before polish.",
    body:
      "I start with the user, the constraint, and the outcome — not the trend. My path runs through both banking and software, so I can read the technical system and hear the human problem underneath it.",
    tone: "dark",
  },
  {
    id: "experience",
    eyebrow: "Experience",
    title: "Clarity at every layer.",
    body:
      "From interface decisions to team communication, I make the work easier to follow.",
    tone: "light",
  },
  {
    id: "work",
    eyebrow: "Selected work",
    title: "Built for real use.",
    body:
      "Responsive behavior, edge cases, and the details people feel.",
    tone: "dark",
  },
];

export const experience = [
  {
    company: "Vizzn Inc",
    role: "Front-end Engineer",
    period: "Most recent",
    note:
      "Production React and TypeScript interfaces for construction operations — dispatch, reporting, and real-time communication, localized.",
  },
  {
    company: "TD Canada Trust",
    role: "Personal Banking Associate",
    period: "Earlier",
    note:
      "Translated complex financial information into clear next steps, in conversations where accuracy mattered.",
  },
  {
    company: "EvolveU",
    role: "Full-stack Development",
    period: "2020—2021",
    note:
      "Immersive program building responsive applications across the stack through agile collaboration.",
  },
];

export const projects = [
  {
    id: "kindergarten",
    kicker: "Live website",
    title: "Mi Pequeño San Francisco de Asís",
    body:
      "A responsive online home for a family-run kindergarten, built to make its programs, values, and contact path easy for parents to understand.",
    href: "https://www.mipequenosanfranciscodeasis.com/",
    media: {
      type: "image",
      src: "/Images/photo-project1 (2).jpg",
      alt: "Homepage of the Mi Pequeño San Francisco de Asís kindergarten website",
      width: 1896,
      height: 928,
    },
  },
  {
    id: "happy-times",
    kicker: "Team build",
    title: "Happy Times",
    body:
      "A location-based full-stack application that helped people find happy-hour options around Calgary, created with a collaborative product team.",
    href: "https://loving-lumiere-9af642.netlify.app/",
    media: {
      type: "video",
      src: "/Images/Happy Times.mp4",
      label: "Preview of the Happy Times application",
    },
  },
];

export const github = "https://github.com/manuellemendez";

export const specs = [
  { label: "Front-end", value: "React, TypeScript, JavaScript, HTML, CSS" },
  {
    label: "UI systems",
    value: "shadcn/ui, Ant Design, React Router, Internationalization",
  },
  {
    label: "Delivery",
    value:
      "Server-side search and pagination, API integrations, OpenTelemetry, Git",
  },
  { label: "Languages", value: "English, Español" },
];

export const contact = {
  title: "Let's build what's next.",
  body:
    "I'm exploring front-end opportunities with teams that care about useful products, thoughtful craft, and good collaboration.",
  email: "manuellemendez@gmail.com",
};

export const footer = {
  links: [
    {
      label: "LinkedIn",
      href: "https://www.linkedin.com/in/manuel-mendez-379025190/",
    },
    { label: "GitHub", href: "https://github.com/manuellemendez" },
    { label: "Résumé", href: "resume.html" },
  ],
};
```

- [ ] **Step 3: Verify the module parses and exports what later tasks expect**

```bash
node --input-type=module -e "
import('./src/data/content.js').then((m) => {
  const required = ['nav','hero','heroMedia','features','experience','projects','github','specs','contact','footer'];
  const missing = required.filter((k) => !(k in m));
  if (missing.length) throw new Error('missing exports: ' + missing.join(', '));
  if (m.features.length !== 3) throw new Error('expected 3 features, got ' + m.features.length);
  if (m.projects.length !== 2) throw new Error('expected 2 projects, got ' + m.projects.length);
  console.log('content.js OK');
});
"
```

Expected: `content.js OK`

- [ ] **Step 4: Commit**

```bash
git add src/data/content.js
git commit -m "feat: extract portfolio copy into content module"
```

---

### Task 2: Style foundation, core hooks, and the flip

This is the atomic switch-over. The old design is removed and the new one takes its place in a single commit, because a half-flipped page does not run.

**Files:**
- Create: `src/styles/index.css`, `src/styles/tokens.css`, `src/styles/base.css`, `src/styles/sections.css`
- Create: `src/hooks/useReveal.js`, `src/hooks/useScrolled.js`, `src/hooks/useNavSheet.js`
- Create: `src/sections/Nav.jsx`, `src/sections/Hero.jsx`
- Modify: `src/main.jsx`, `src/Portfolio.jsx` (full rewrite), `index.html`
- Delete: `style.css`, `components/canvasui/LiquidVanilla.js`

**Interfaces:**
- Consumes: `nav`, `hero` from `src/data/content.js`
- Produces:
  - `useReveal()` → `void`. Call once at the top of `Portfolio`.
  - `useScrolled(threshold = 24)` → `boolean`
  - `useNavSheet()` → `{ isOpen: boolean, open: () => void, close: () => void, toggle: () => void, sheetRef: React.RefObject }`
  - CSS classes later tasks rely on: `.band`, `.band-light`, `.band-grey`, `.band-dark`, `.container`, `.container-wide`, `.display`, `.headline`, `.title`, `.eyebrow`, `.caption`, `.reveal`, `.chevron-link`, `.button`, `.button-quiet`, `.visually-hidden`, `.skip-link`

- [ ] **Step 1: Create the token sheet**

Create `src/styles/tokens.css`:

```css
:root {
  --font: -apple-system, BlinkMacSystemFont, "SF Pro Display", "Helvetica Neue",
    Helvetica, Arial, sans-serif;

  --white: #ffffff;
  --grey-bg: #f5f5f7;
  --black: #000000;
  --text: #1d1d1f;
  --text-2: #6e6e73;
  --text-dark: #f5f5f7;
  --text-2-dark: #86868b;
  --hairline: #d2d2d7;
  --hairline-dark: rgba(245, 245, 247, 0.18);
  --blue: #0071e3;
  --blue-hover: #0077ed;

  --radius-sm: 12px;
  --radius-md: 18px;
  --radius-lg: 28px;
  --radius-pill: 980px;

  --width: 980px;
  --width-wide: 1280px;
  --gutter: 22px;
  --band-pad: clamp(5rem, 10vw, 8.75rem);

  --ease: cubic-bezier(0.4, 0, 0.2, 1);
  --shadow: 0 18px 60px rgba(0, 0, 0, 0.12);
}
```

- [ ] **Step 2: Create the base sheet**

Create `src/styles/base.css`:

```css
*,
*::before,
*::after {
  box-sizing: border-box;
}

html {
  background: var(--white);
  scroll-behavior: smooth;
}

body {
  margin: 0;
  color: var(--text);
  background: var(--white);
  font-family: var(--font);
  font-size: 1.0625rem;
  line-height: 1.47;
  text-rendering: optimizeLegibility;
  -webkit-font-smoothing: antialiased;
}

img,
video {
  display: block;
  max-width: 100%;
  height: auto;
}

a {
  color: inherit;
  text-decoration: none;
}

:focus-visible {
  border-radius: 4px;
  outline: 2px solid var(--blue);
  outline-offset: 2px;
}

.band-dark :focus-visible {
  outline-color: var(--white);
}

.display {
  margin: 0;
  font-size: clamp(2.75rem, 6vw, 5rem);
  font-weight: 600;
  line-height: 1.05;
  letter-spacing: -0.015em;
}

.headline {
  margin: 0;
  font-size: clamp(2rem, 4vw, 3rem);
  font-weight: 600;
  line-height: 1.08;
  letter-spacing: -0.012em;
}

.title {
  margin: 0;
  font-size: clamp(1.5rem, 2.4vw, 2rem);
  font-weight: 600;
  line-height: 1.15;
  letter-spacing: -0.01em;
}

.eyebrow {
  margin: 0;
  color: var(--text-2);
  font-size: 0.8125rem;
  font-weight: 600;
  line-height: 1.4;
}

.caption {
  margin: 0;
  color: var(--text-2);
  font-size: 0.75rem;
  line-height: 1.4;
}

.band {
  padding: var(--band-pad) var(--gutter);
}

.band-light {
  color: var(--text);
  background: var(--white);
}

.band-grey {
  color: var(--text);
  background: var(--grey-bg);
}

.band-dark {
  color: var(--text-dark);
  background: var(--black);
}

.band-dark .eyebrow,
.band-dark .caption {
  color: var(--text-2-dark);
}

.container {
  width: 100%;
  max-width: var(--width);
  margin: 0 auto;
}

.container-wide {
  width: 100%;
  max-width: var(--width-wide);
  margin: 0 auto;
}

.chevron-link {
  color: var(--blue);
  font-size: 1.0625rem;
  transition: color 0.2s var(--ease);
}

.chevron-link:hover {
  color: var(--blue-hover);
  text-decoration: underline;
}

.button {
  display: inline-block;
  padding: 12px 22px;
  border: 0;
  border-radius: var(--radius-pill);
  color: var(--white);
  background: var(--blue);
  font-family: var(--font);
  font-size: 1.0625rem;
  line-height: 1.47;
  cursor: pointer;
  transition: background 0.2s var(--ease);
}

.button:hover {
  background: var(--blue-hover);
}

.button-quiet {
  padding: 12px 8px;
  color: var(--blue);
  background: transparent;
}

.button-quiet:hover {
  color: var(--blue-hover);
  background: transparent;
  text-decoration: underline;
}

.reveal {
  opacity: 0;
  transform: translateY(24px);
  transition:
    opacity 0.8s var(--ease),
    transform 0.8s var(--ease);
}

.reveal.is-visible {
  opacity: 1;
  transform: none;
}

.visually-hidden {
  position: absolute;
  width: 1px;
  height: 1px;
  margin: -1px;
  padding: 0;
  overflow: hidden;
  clip: rect(0 0 0 0);
  white-space: nowrap;
  border: 0;
}

.skip-link {
  position: absolute;
  top: -100px;
  left: 50%;
  z-index: 100;
  padding: 12px 22px;
  transform: translateX(-50%);
  border-radius: 0 0 var(--radius-sm) var(--radius-sm);
  color: var(--blue);
  background: var(--white);
}

.skip-link:focus {
  top: 0;
}

@media (prefers-reduced-motion: reduce) {
  html {
    scroll-behavior: auto;
  }

  .reveal {
    opacity: 1;
    transform: none;
    transition: none;
  }

  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

- [ ] **Step 3: Create the sections sheet with nav and hero rules**

Later tasks append to this file. Create `src/styles/sections.css`:

```css
/* Nav */
.nav {
  position: sticky;
  top: 0;
  z-index: 50;
  border-bottom: 1px solid transparent;
  transition:
    background 0.3s var(--ease),
    border-color 0.3s var(--ease);
}

.nav.is-scrolled {
  border-bottom-color: var(--hairline);
  background: rgba(255, 255, 255, 0.72);
  -webkit-backdrop-filter: saturate(180%) blur(20px);
  backdrop-filter: saturate(180%) blur(20px);
}

.nav-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  max-width: var(--width-wide);
  height: 48px;
  margin: 0 auto;
  padding: 0 var(--gutter);
}

.nav-wordmark {
  font-size: 0.875rem;
  font-weight: 600;
  letter-spacing: -0.01em;
}

.nav-sheet {
  display: flex;
  gap: 28px;
}

.nav-sheet a {
  color: var(--text);
  font-size: 0.8125rem;
  transition: color 0.2s var(--ease);
}

.nav-sheet a:hover {
  color: var(--blue);
}

.nav-sheet .nav-cta {
  color: var(--blue);
}

.nav-toggle {
  display: none;
}

/* Hero */
.hero-inner {
  text-align: center;
}

.hero-tagline {
  margin: 20px 0 0;
  color: var(--text-2);
  font-size: clamp(1.25rem, 2.2vw, 1.75rem);
  font-weight: 400;
  line-height: 1.2;
}

.hero-tagline span {
  display: block;
}

.hero-links {
  display: flex;
  justify-content: center;
  gap: 32px;
  margin: 32px 0 0;
}

/* Breakpoint */
@media (max-width: 768px) {
  .nav-toggle {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 44px;
    height: 44px;
    margin-right: -10px;
    padding: 0;
    border: 0;
    background: transparent;
    cursor: pointer;
  }

  .nav-toggle-icon {
    position: relative;
  }

  .nav-toggle-icon,
  .nav-toggle-icon::before,
  .nav-toggle-icon::after {
    display: block;
    width: 18px;
    height: 1px;
    background: var(--text);
    transition:
      transform 0.3s var(--ease),
      opacity 0.2s var(--ease);
  }

  .nav-toggle-icon::before,
  .nav-toggle-icon::after {
    position: absolute;
    left: 0;
    content: "";
  }

  .nav-toggle-icon::before {
    top: -6px;
  }

  .nav-toggle-icon::after {
    top: 6px;
  }

  .nav-toggle-icon.is-open {
    background: transparent;
  }

  .nav-toggle-icon.is-open::before {
    top: 0;
    transform: rotate(45deg);
  }

  .nav-toggle-icon.is-open::after {
    top: 0;
    transform: rotate(-45deg);
  }

  .nav-sheet {
    position: fixed;
    inset: 48px 0 0;
    flex-direction: column;
    gap: 0;
    padding: 24px var(--gutter);
    visibility: hidden;
    opacity: 0;
    background: rgba(255, 255, 255, 0.94);
    -webkit-backdrop-filter: saturate(180%) blur(20px);
    backdrop-filter: saturate(180%) blur(20px);
    transition:
      opacity 0.3s var(--ease),
      visibility 0.3s var(--ease);
  }

  .nav-sheet.is-open {
    visibility: visible;
    opacity: 1;
  }

  .nav-sheet a {
    padding: 18px 0;
    border-bottom: 1px solid var(--hairline);
    font-size: 1.25rem;
  }

  .hero-links {
    flex-direction: column;
    gap: 16px;
  }
}
```

- [ ] **Step 4: Create the style entry point**

Create `src/styles/index.css`:

```css
@import "./tokens.css";
@import "./base.css";
@import "./sections.css";
```

- [ ] **Step 5: Create the reveal hook**

Create `src/hooks/useReveal.js`:

```js
import { useEffect } from "react";

export function useReveal() {
  useEffect(() => {
    const items = document.querySelectorAll(".reveal");
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

    if (!("IntersectionObserver" in window) || reduceMotion.matches) {
      items.forEach((item) => item.classList.add("is-visible"));
      return undefined;
    }

    const observer = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          obs.unobserve(entry.target);
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -6%" },
    );

    items.forEach((item, index) => {
      item.style.transitionDelay = `${Math.min(index % 3, 2) * 70}ms`;
      observer.observe(item);
    });

    return () => observer.disconnect();
  }, []);
}
```

- [ ] **Step 6: Create the scroll hook**

Create `src/hooks/useScrolled.js`:

```js
import { useEffect, useState } from "react";

export function useScrolled(threshold = 24) {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const update = () => setIsScrolled(window.scrollY > threshold);
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, [threshold]);

  return isScrolled;
}
```

- [ ] **Step 7: Create the nav sheet hook**

Create `src/hooks/useNavSheet.js`:

```js
import { useCallback, useEffect, useRef, useState } from "react";

const FOCUSABLE = [
  "a[href]",
  "button:not([disabled])",
  '[tabindex]:not([tabindex="-1"])',
].join(", ");

export function useNavSheet() {
  const [isOpen, setIsOpen] = useState(false);
  const sheetRef = useRef(null);
  const lastFocusedRef = useRef(null);

  const getFocusable = useCallback(
    () => Array.from(sheetRef.current?.querySelectorAll(FOCUSABLE) ?? []),
    [],
  );

  const close = useCallback(() => {
    setIsOpen(false);
    document.body.style.overflow = "";
    lastFocusedRef.current?.focus?.();
    lastFocusedRef.current = null;
  }, []);

  const open = useCallback(() => {
    lastFocusedRef.current = document.activeElement;
    setIsOpen(true);
    document.body.style.overflow = "hidden";
    window.setTimeout(() => getFocusable()[0]?.focus(), 10);
  }, [getFocusable]);

  const toggle = useCallback(
    () => (isOpen ? close() : open()),
    [isOpen, close, open],
  );

  useEffect(() => {
    if (!isOpen) return undefined;

    const handleKeydown = (event) => {
      if (event.key === "Escape") {
        close();
        return;
      }
      if (event.key !== "Tab") return;

      const focusable = getFocusable();
      if (focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    const handleResize = () => {
      if (window.innerWidth > 768) close();
    };

    window.addEventListener("keydown", handleKeydown);
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("keydown", handleKeydown);
      window.removeEventListener("resize", handleResize);
    };
  }, [isOpen, close, getFocusable]);

  useEffect(
    () => () => {
      document.body.style.overflow = "";
    },
    [],
  );

  return { isOpen, open, close, toggle, sheetRef };
}
```

- [ ] **Step 8: Create the Nav component**

Create `src/sections/Nav.jsx`:

```jsx
import { nav } from "../data/content.js";
import { useNavSheet } from "../hooks/useNavSheet.js";
import { useScrolled } from "../hooks/useScrolled.js";

export default function Nav() {
  const isScrolled = useScrolled();
  const { isOpen, close, toggle, sheetRef } = useNavSheet();

  return (
    <header className={`nav${isScrolled ? " is-scrolled" : ""}`}>
      <div className="nav-inner">
        <a className="nav-wordmark" href="#top">
          Manuel Mendez
        </a>

        <button
          className="nav-toggle"
          type="button"
          aria-expanded={isOpen}
          aria-controls="nav-sheet"
          onClick={toggle}
        >
          <span className="visually-hidden">
            {isOpen ? "Close menu" : "Open menu"}
          </span>
          <span
            className={`nav-toggle-icon${isOpen ? " is-open" : ""}`}
            aria-hidden="true"
          />
        </button>

        <nav
          className={`nav-sheet${isOpen ? " is-open" : ""}`}
          id="nav-sheet"
          aria-label="Main"
          ref={sheetRef}
        >
          {nav.links.map((link) => (
            <a key={link.href} href={link.href} onClick={close}>
              {link.label}
            </a>
          ))}
          <a className="nav-cta" href={nav.cta.href} onClick={close}>
            {nav.cta.label}
          </a>
        </nav>
      </div>
    </header>
  );
}
```

- [ ] **Step 9: Create the Hero component**

Create `src/sections/Hero.jsx`:

```jsx
import { hero } from "../data/content.js";

export default function Hero() {
  return (
    <section className="band band-light hero" id="top" aria-labelledby="hero-title">
      <div className="container hero-inner">
        <h1 className="display reveal" id="hero-title">
          {hero.name}
        </h1>
        <p className="hero-tagline reveal">
          {hero.tagline.map((line) => (
            <span key={line}>{line}</span>
          ))}
        </p>
        <p className="hero-links reveal">
          {hero.links.map((link) => (
            <a className="chevron-link" key={link.href} href={link.href}>
              {link.label}
              <span aria-hidden="true"> ›</span>
            </a>
          ))}
        </p>
      </div>
    </section>
  );
}
```

- [ ] **Step 10: Rewrite Portfolio.jsx as the new shell**

Replace the entire contents of `src/Portfolio.jsx`:

```jsx
import { useReveal } from "./hooks/useReveal.js";
import Hero from "./sections/Hero.jsx";
import Nav from "./sections/Nav.jsx";

export default function Portfolio() {
  useReveal();

  return (
    <>
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <Nav />
      <main id="main">
        <Hero />
      </main>
    </>
  );
}
```

- [ ] **Step 11: Repoint the style import**

Replace the entire contents of `src/main.jsx`:

```jsx
import { createRoot } from "react-dom/client";
import Portfolio from "./Portfolio.jsx";
import "./styles/index.css";

createRoot(document.getElementById("root")).render(<Portfolio />);
```

- [ ] **Step 12: Strip webfonts from index.html**

In `index.html`, delete these three elements from `<head>`:

```html
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link
      href="https://fonts.googleapis.com/css2?family=DM+Mono:wght@300;400;500&family=Manrope:wght@400;500;600;700;800&display=swap"
      rel="stylesheet"
    />
```

Then change the theme colour line from:

```html
    <meta name="theme-color" content="#151412" />
```

to:

```html
    <meta name="theme-color" content="#ffffff" />
```

Leave every other tag in `index.html` alone — the description, Open Graph tags, title, and favicon all stay.

- [ ] **Step 13: Delete the old design**

```bash
git rm style.css
git rm -r components
```

- [ ] **Step 14: Verify the build**

```bash
pnpm build
```

Expected: exits 0, no errors. `dist/` contains both `index.html` and `resume.html`.

- [ ] **Step 15: Verify in the browser**

Start the dev server (`pnpm dev`), then with Playwright:

1. Navigate to the dev server URL.
2. Confirm the console has zero errors.
3. Screenshot at 1440px — expect a white page, centred "Manuel Mendez" in large SF-style type, two-line grey tagline, two blue chevron links.
4. Evaluate `getComputedStyle(document.querySelector('.display')).fontWeight` — expect `"600"`.
5. Evaluate `getComputedStyle(document.querySelector('.display')).fontFamily` — expect it to start with `-apple-system`.
6. Scroll down 200px, then evaluate `document.querySelector('.nav').className` — expect it to contain `is-scrolled`.
7. Navigate to `/resume.html` — expect the warm terracotta résumé to render exactly as before.

- [ ] **Step 16: Commit**

```bash
git add -A
git commit -m "feat: replace editorial design with Apple-style foundation

Adds token/base/sections stylesheets, reveal + scroll + nav-sheet hooks,
and the Nav and Hero sections. Removes style.css, the liquid WebGL
component, and the Google Fonts dependency."
```

---

### Task 3: Hero media band

**Files:**
- Create: `src/sections/HeroMedia.jsx`
- Modify: `src/styles/sections.css` (append), `src/Portfolio.jsx`

**Interfaces:**
- Consumes: `heroMedia` from `src/data/content.js`; `.band`, `.band-grey`, `.container`, `.caption`, `.reveal` from Task 2
- Produces: default export `HeroMedia` taking no props

- [ ] **Step 1: Create the component**

Create `src/sections/HeroMedia.jsx`:

```jsx
import { heroMedia } from "../data/content.js";

export default function HeroMedia() {
  return (
    <section className="band band-grey hero-media">
      <div className="container">
        <img
          className="hero-portrait reveal"
          src={heroMedia.src}
          alt={heroMedia.alt}
          width={heroMedia.width}
          height={heroMedia.height}
          fetchPriority="high"
          decoding="async"
        />
        <p className="caption reveal">{heroMedia.caption}</p>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Add the styles**

Append to `src/styles/sections.css`, immediately before the `@media (max-width: 768px)` block:

```css
/* Hero media */
.hero-portrait {
  width: min(100%, 420px);
  margin: 0 auto;
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow);
}

.hero-media .caption {
  margin-top: 20px;
  text-align: center;
}
```

- [ ] **Step 3: Render it**

In `src/Portfolio.jsx`, add the import alongside the others:

```jsx
import HeroMedia from "./sections/HeroMedia.jsx";
```

and add the element directly after `<Hero />` inside `<main>`:

```jsx
        <Hero />
        <HeroMedia />
```

- [ ] **Step 4: Verify**

```bash
pnpm build
```

Expected: exits 0.

Then in the browser: screenshot at 1440px. Expect a light-grey band below the hero holding the portrait at 420px wide with 28px rounded corners and a soft shadow, caption centred beneath it. Evaluate `getComputedStyle(document.querySelector('.hero-portrait')).borderRadius` — expect `"28px"`.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: add hero portrait band"
```

---

### Task 4: Feature component and the first dark chapter

**Files:**
- Create: `src/sections/Feature.jsx`
- Modify: `src/styles/sections.css` (append), `src/Portfolio.jsx`

**Interfaces:**
- Consumes: `features` from `src/data/content.js`
- Produces: default export `Feature` with props `{ id, eyebrow, title, body, tone, children }`. `tone` defaults to `"light"` and maps `light → .band-light`, `grey → .band-grey`, `dark → .band-dark`. The section gets `id={id}` and `aria-labelledby={id + "-title"}`. `children` render **outside** the inner `.container`, so evidence sections control their own width. Tasks 5 and 6 pass their components as `children`.

- [ ] **Step 1: Create the component**

Create `src/sections/Feature.jsx`:

```jsx
const TONE_CLASS = {
  light: "band-light",
  grey: "band-grey",
  dark: "band-dark",
};

export default function Feature({
  id,
  eyebrow,
  title,
  body,
  tone = "light",
  children,
}) {
  const headingId = `${id}-title`;

  return (
    <section
      className={`band ${TONE_CLASS[tone]} feature`}
      id={id}
      aria-labelledby={headingId}
    >
      <div className="container feature-inner">
        <p className="eyebrow reveal">{eyebrow}</p>
        <h2 className="headline reveal" id={headingId}>
          {title}
        </h2>
        <p className="feature-body reveal">{body}</p>
      </div>
      {children}
    </section>
  );
}
```

- [ ] **Step 2: Add the styles**

Append to `src/styles/sections.css`, immediately before the `@media (max-width: 768px)` block:

```css
/* Feature */
.feature-inner {
  text-align: center;
}

.feature-inner .headline {
  margin-top: 12px;
}

.feature-body {
  max-width: 640px;
  margin: 20px auto 0;
  color: var(--text-2);
  font-size: 1.1875rem;
}

.band-dark .feature-body {
  color: var(--text-2-dark);
}
```

- [ ] **Step 3: Render the first feature**

In `src/Portfolio.jsx`, add these imports:

```jsx
import { features } from "./data/content.js";
import Feature from "./sections/Feature.jsx";
```

Add this line at module scope, after the imports and before the component:

```jsx
const [approach, experienceFeature, workFeature] = features;
```

Then add the element after `<HeroMedia />` inside `<main>`:

```jsx
        <HeroMedia />
        <Feature {...approach} />
```

Note: `experienceFeature` and `workFeature` are unused until Tasks 5 and 6. If the build warns about unused variables, leave them — they are wired up shortly.

- [ ] **Step 4: Verify**

```bash
pnpm build
```

Expected: exits 0.

In the browser: screenshot at 1440px. Expect a full-bleed black band below the portrait, with a grey "Approach" eyebrow, white "Product before polish." headline, and grey body copy, all centred. Evaluate `getComputedStyle(document.querySelector('#approach')).backgroundColor` — expect `"rgb(0, 0, 0)"`. Evaluate `document.querySelector('#approach').getAttribute('aria-labelledby')` — expect `"approach-title"`.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: add reusable Feature band and approach chapter"
```

---

### Task 5: Experience rows inside the second feature

**Files:**
- Create: `src/sections/Experience.jsx`
- Modify: `src/styles/sections.css` (append), `src/Portfolio.jsx`

**Interfaces:**
- Consumes: `experience` from `src/data/content.js`; `Feature` from Task 4
- Produces: default export `Experience` taking no props. Renders a `.container` wrapper — it is slotted as a `Feature` child, so it supplies its own width constraint.

- [ ] **Step 1: Create the component**

Create `src/sections/Experience.jsx`:

```jsx
import { experience } from "../data/content.js";

export default function Experience() {
  return (
    <div className="container experience">
      {experience.map((role) => (
        <article className="experience-row reveal" key={role.company}>
          <p className="experience-period">{role.period}</p>
          <div className="experience-main">
            <h3 className="title">{role.company}</h3>
            <p className="experience-role">{role.role}</p>
            <p className="experience-note">{role.note}</p>
          </div>
        </article>
      ))}
    </div>
  );
}
```

- [ ] **Step 2: Add the styles**

Append to `src/styles/sections.css`, immediately before the `@media (max-width: 768px)` block:

```css
/* Experience */
.experience {
  margin-top: clamp(3rem, 6vw, 5rem);
}

.experience-row {
  display: grid;
  grid-template-columns: 160px 1fr;
  gap: 32px;
  padding: 32px 0;
  border-top: 1px solid var(--hairline);
  text-align: left;
}

.experience-row:last-child {
  border-bottom: 1px solid var(--hairline);
}

.experience-period {
  margin: 0;
  color: var(--text-2);
  font-size: 0.8125rem;
}

.experience-role {
  margin: 6px 0 0;
  color: var(--text-2);
  font-size: 1.0625rem;
}

.experience-note {
  max-width: 52ch;
  margin: 12px 0 0;
  color: var(--text-2);
}
```

Then add these rules **inside** the existing `@media (max-width: 768px)` block:

```css
  .experience-row {
    grid-template-columns: 1fr;
    gap: 8px;
  }
```

- [ ] **Step 3: Render it**

In `src/Portfolio.jsx`, add the import:

```jsx
import Experience from "./sections/Experience.jsx";
```

Add the element after `<Feature {...approach} />` inside `<main>`:

```jsx
        <Feature {...approach} />
        <Feature {...experienceFeature}>
          <Experience />
        </Feature>
```

- [ ] **Step 4: Verify**

```bash
pnpm build
```

Expected: exits 0.

In the browser: screenshot at 1440px. Expect a white band titled "Clarity at every layer." followed by three left-aligned rows separated by hairlines — period label in a 160px left column, company/role/note on the right. Evaluate `document.querySelectorAll('.experience-row').length` — expect `3`.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: add experience rows to clarity chapter"
```

---

### Task 6: Work gallery inside the third feature

**Files:**
- Create: `src/sections/Work.jsx`
- Modify: `src/styles/sections.css` (append), `src/Portfolio.jsx`

**Interfaces:**
- Consumes: `projects`, `github` from `src/data/content.js`; `Feature` from Task 4
- Produces: default export `Work` taking no props. Renders a `.container-wide` wrapper. Handles video hover-play internally; no parent wiring needed.

- [ ] **Step 1: Create the component**

Create `src/sections/Work.jsx`:

```jsx
import { useCallback, useRef } from "react";
import { github, projects } from "../data/content.js";

function ProjectCard({ project }) {
  const videoRef = useRef(null);
  const { media } = project;

  const play = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    video.play().catch(() => {});
  }, []);

  const pause = useCallback(() => {
    videoRef.current?.pause();
  }, []);

  return (
    <article className="project reveal">
      <a
        className="project-media"
        href={project.href}
        target="_blank"
        rel="noreferrer"
        aria-label={`Open ${project.title}`}
        onMouseEnter={play}
        onMouseLeave={pause}
        onFocus={play}
        onBlur={pause}
      >
        {media.type === "image" ? (
          <img
            src={media.src}
            alt={media.alt}
            width={media.width}
            height={media.height}
            loading="lazy"
            decoding="async"
          />
        ) : (
          <video
            ref={videoRef}
            src={media.src}
            muted
            loop
            playsInline
            preload="metadata"
            aria-label={media.label}
          />
        )}
      </a>

      <div className="project-details">
        <p className="eyebrow">{project.kicker}</p>
        <h3 className="title">{project.title}</h3>
        <p>{project.body}</p>
        <a
          className="chevron-link"
          href={project.href}
          target="_blank"
          rel="noreferrer"
        >
          Visit site
          <span aria-hidden="true"> ›</span>
        </a>
      </div>
    </article>
  );
}

export default function Work() {
  return (
    <div className="container-wide work">
      <div className="work-grid">
        {projects.map((project) => (
          <ProjectCard key={project.id} project={project} />
        ))}
      </div>
      <a
        className="chevron-link work-github reveal"
        href={github}
        target="_blank"
        rel="noreferrer"
      >
        More on GitHub
        <span aria-hidden="true"> ›</span>
      </a>
    </div>
  );
}
```

- [ ] **Step 2: Add the styles**

Append to `src/styles/sections.css`, immediately before the `@media (max-width: 768px)` block:

```css
/* Work */
.work {
  margin-top: clamp(3rem, 6vw, 5rem);
  text-align: center;
}

.work-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 24px;
}

.project {
  text-align: left;
}

.project-media {
  display: block;
  overflow: hidden;
  border-radius: var(--radius-md);
  background: #111111;
  aspect-ratio: 16 / 10;
}

.project-media img,
.project-media video {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.6s var(--ease);
}

.project-media:hover img,
.project-media:hover video {
  transform: scale(1.03);
}

.project-details {
  padding: 24px 4px 0;
}

.project-details .title {
  margin-top: 8px;
}

.project-details p {
  max-width: 46ch;
  color: var(--text-2-dark);
}

.work-github {
  display: inline-block;
  margin-top: 48px;
}
```

Then add this rule **inside** the existing `@media (max-width: 768px)` block:

```css
  .work-grid {
    grid-template-columns: 1fr;
  }
```

- [ ] **Step 3: Render it**

In `src/Portfolio.jsx`, add the import:

```jsx
import Work from "./sections/Work.jsx";
```

Add the element after the experience feature inside `<main>`:

```jsx
        <Feature {...workFeature}>
          <Work />
        </Feature>
```

- [ ] **Step 4: Verify**

```bash
pnpm build
```

Expected: exits 0.

In the browser: screenshot at 1440px. Expect a black band titled "Built for real use." with two side-by-side cards at 18px radius — kindergarten screenshot left, Happy Times video right — each with kicker, title, body, and a blue "Visit site ›" link, plus a centred "More on GitHub ›" link below.

Hover the video card, wait briefly, then evaluate `document.querySelector('.project-media video').paused` — expect `false`. Move the mouse away and evaluate again — expect `true`.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: add work gallery to real-use chapter"
```

---

### Task 7: Tech specs table

**Files:**
- Create: `src/sections/Specs.jsx`
- Modify: `src/styles/sections.css` (append), `src/Portfolio.jsx`

**Interfaces:**
- Consumes: `specs` from `src/data/content.js`
- Produces: default export `Specs` taking no props. Renders a real `<table>` with `<th scope="row">` per the spec's accessibility requirement.

- [ ] **Step 1: Create the component**

Create `src/sections/Specs.jsx`:

```jsx
import { specs } from "../data/content.js";

export default function Specs() {
  return (
    <section className="band band-light specs" id="specs" aria-labelledby="specs-title">
      <div className="container">
        <h2 className="headline reveal" id="specs-title">
          Tech Specs
        </h2>
        <table className="specs-table reveal">
          <tbody>
            {specs.map((spec) => (
              <tr key={spec.label}>
                <th scope="row">{spec.label}</th>
                <td>{spec.value}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Add the styles**

Append to `src/styles/sections.css`, immediately before the `@media (max-width: 768px)` block:

```css
/* Specs */
.specs .headline {
  text-align: center;
}

.specs-table {
  width: 100%;
  margin-top: clamp(3rem, 6vw, 4rem);
  border-collapse: collapse;
  text-align: left;
}

.specs-table th,
.specs-table td {
  padding: 24px 0;
  border-top: 1px solid var(--hairline);
  font-weight: 400;
  vertical-align: top;
}

.specs-table th {
  width: 200px;
  padding-right: 32px;
  font-weight: 600;
}

.specs-table td {
  color: var(--text-2);
}

.specs-table tr:last-child th,
.specs-table tr:last-child td {
  border-bottom: 1px solid var(--hairline);
}
```

Then add these rules **inside** the existing `@media (max-width: 768px)` block:

```css
  .specs-table th,
  .specs-table td {
    display: block;
    width: auto;
    padding-right: 0;
  }

  .specs-table th {
    padding-bottom: 8px;
  }

  .specs-table td {
    padding-top: 0;
    border-top: 0;
  }

  .specs-table tr:last-child th {
    border-bottom: 0;
  }
```

- [ ] **Step 3: Render it**

In `src/Portfolio.jsx`, add the import:

```jsx
import Specs from "./sections/Specs.jsx";
```

Add the element after the work feature inside `<main>`:

```jsx
        <Specs />
```

- [ ] **Step 4: Verify**

```bash
pnpm build
```

Expected: exits 0.

In the browser: screenshot at 1440px. Expect a white band with a centred "Tech Specs" headline and four hairline-separated rows, label bold in a 200px left column and value in grey on the right.

Evaluate `document.querySelectorAll('.specs-table th[scope="row"]').length` — expect `4`.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: add tech specs table"
```

---

### Task 8: Call to action and footer

**Files:**
- Create: `src/hooks/useCopyEmail.js`, `src/sections/CallToAction.jsx`, `src/sections/Footer.jsx`
- Modify: `src/styles/sections.css` (append), `src/Portfolio.jsx`

**Interfaces:**
- Consumes: `contact`, `footer` from `src/data/content.js`
- Produces:
  - `useCopyEmail(email, idleLabel = "Copy email")` → `{ label: string, copy: () => Promise<void> }`
  - default exports `CallToAction` and `Footer`, both taking no props

- [ ] **Step 1: Create the copy-email hook**

Create `src/hooks/useCopyEmail.js`:

```js
import { useCallback, useEffect, useRef, useState } from "react";

export function useCopyEmail(email, idleLabel = "Copy email") {
  const [label, setLabel] = useState(idleLabel);
  const timeoutRef = useRef(null);

  const copy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(email);
      setLabel("Email copied");
      if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
      timeoutRef.current = window.setTimeout(() => setLabel(idleLabel), 1800);
    } catch {
      window.location.href = `mailto:${email}`;
    }
  }, [email, idleLabel]);

  useEffect(
    () => () => {
      if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
    },
    [],
  );

  return { label, copy };
}
```

- [ ] **Step 2: Create the call to action**

Create `src/sections/CallToAction.jsx`:

```jsx
import { contact } from "../data/content.js";
import { useCopyEmail } from "../hooks/useCopyEmail.js";

export default function CallToAction() {
  const { label, copy } = useCopyEmail(contact.email);

  return (
    <section className="band band-grey cta" id="contact" aria-labelledby="cta-title">
      <div className="container cta-inner">
        <h2 className="headline reveal" id="cta-title">
          {contact.title}
        </h2>
        <p className="cta-body reveal">{contact.body}</p>
        <div className="cta-actions reveal">
          <a className="button" href={`mailto:${contact.email}`}>
            Start a conversation
          </a>
          <button className="button button-quiet" type="button" onClick={copy}>
            {label}
          </button>
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 3: Create the footer**

Create `src/sections/Footer.jsx`:

```jsx
import { footer } from "../data/content.js";

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="container-wide footer-inner">
        <p>Manuel Mendez © {new Date().getFullYear()}</p>
        <nav className="footer-links" aria-label="Footer">
          {footer.links.map((link) => {
            const isExternal = link.href.startsWith("http");
            return (
              <a
                key={link.href}
                href={link.href}
                target={isExternal ? "_blank" : undefined}
                rel={isExternal ? "noreferrer" : undefined}
              >
                {link.label}
              </a>
            );
          })}
          <a href="#top">Back to top</a>
        </nav>
      </div>
    </footer>
  );
}
```

- [ ] **Step 4: Add the styles**

Append to `src/styles/sections.css`, immediately before the `@media (max-width: 768px)` block:

```css
/* Call to action */
.cta-inner {
  text-align: center;
}

.cta-body {
  max-width: 560px;
  margin: 20px auto 0;
  color: var(--text-2);
}

.cta-actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  gap: 16px;
  margin-top: 36px;
}

/* Footer */
.site-footer {
  padding: 32px var(--gutter);
  border-top: 1px solid var(--hairline);
  color: var(--text-2);
  background: var(--white);
  font-size: 0.75rem;
}

.footer-inner {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
}

.footer-inner p {
  margin: 0;
}

.footer-links {
  display: flex;
  flex-wrap: wrap;
  gap: 24px;
}

.footer-links a {
  transition: color 0.2s var(--ease);
}

.footer-links a:hover {
  color: var(--blue);
}
```

Then add this rule **inside** the existing `@media (max-width: 768px)` block:

```css
  .footer-inner {
    flex-direction: column;
    align-items: flex-start;
  }
```

- [ ] **Step 5: Render them**

In `src/Portfolio.jsx`, add the imports:

```jsx
import CallToAction from "./sections/CallToAction.jsx";
import Footer from "./sections/Footer.jsx";
```

Add `<CallToAction />` after `<Specs />` inside `<main>`, and `<Footer />` after the closing `</main>` tag. The complete file should now read:

```jsx
import { features } from "./data/content.js";
import { useReveal } from "./hooks/useReveal.js";
import CallToAction from "./sections/CallToAction.jsx";
import Experience from "./sections/Experience.jsx";
import Feature from "./sections/Feature.jsx";
import Footer from "./sections/Footer.jsx";
import Hero from "./sections/Hero.jsx";
import HeroMedia from "./sections/HeroMedia.jsx";
import Nav from "./sections/Nav.jsx";
import Specs from "./sections/Specs.jsx";
import Work from "./sections/Work.jsx";

const [approach, experienceFeature, workFeature] = features;

export default function Portfolio() {
  useReveal();

  return (
    <>
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <Nav />
      <main id="main">
        <Hero />
        <HeroMedia />
        <Feature {...approach} />
        <Feature {...experienceFeature}>
          <Experience />
        </Feature>
        <Feature {...workFeature}>
          <Work />
        </Feature>
        <Specs />
        <CallToAction />
      </main>
      <Footer />
    </>
  );
}
```

- [ ] **Step 6: Verify**

```bash
pnpm build
```

Expected: exits 0.

In the browser: screenshot at 1440px. Expect a light-grey closing band with "Let's build what's next.", a blue pill button, and a quiet "Copy email" button, then a white hairline footer.

Click the "Copy email" button and evaluate its text content — expect `"Email copied"`. Wait 2 seconds and evaluate again — expect `"Copy email"`. (If the headless browser denies clipboard permission the label will not change and the page will navigate to `mailto:` — that is the intended fallback, not a failure; grant clipboard permission to test the primary path.)

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat: add call to action and footer"
```

---

### Task 9: Responsive, accessibility, and final verification

No new files. This task confirms the whole page against the spec and fixes whatever the checks surface.

**Files:**
- Modify: `src/styles/sections.css` or `src/styles/base.css` only if a check fails

**Interfaces:**
- Consumes: everything from Tasks 1–8
- Produces: nothing new

- [ ] **Step 1: Full-page desktop verification**

Build and serve (`pnpm build && pnpm preview`), then with Playwright at 1440×900:

1. Full-page screenshot. Confirm the band order top to bottom is: white hero → grey portrait → **black** → white experience → **black** work → white specs → grey CTA → white footer.
2. Confirm zero console errors.
3. Evaluate this and expect an empty array:

```js
Array.from(document.querySelectorAll('*'))
  .filter((el) => {
    const weight = getComputedStyle(el).fontWeight;
    return Number(weight) > 600;
  })
  .map((el) => el.className);
```

4. Evaluate this and expect an empty array — no leftover webfonts:

```js
performance.getEntriesByType('resource')
  .map((r) => r.name)
  .filter((n) => n.includes('fonts.googleapis') || n.includes('fonts.gstatic'));
```

- [ ] **Step 2: Mobile verification at 390×844**

1. Full-page screenshot. Confirm: display type has shrunk, portrait spans the width minus gutters, work cards stack to one column, experience rows stack label-over-content, specs rows stack label-over-value, footer stacks left-aligned.
2. Confirm the hamburger button is visible and the desktop link row is not.
3. Click the hamburger. Confirm the sheet covers the viewport below the 48px bar.
4. Evaluate `document.activeElement.textContent` — expect `"Approach"` (focus moved into the sheet).
5. Press `Tab` repeatedly past the last link and confirm focus wraps back to the first rather than escaping to the page.
6. Press `Escape`. Confirm the sheet closes and `document.body.style.overflow` is `""`.

- [ ] **Step 3: Reduced-motion verification**

Emulate `prefers-reduced-motion: reduce`, reload, then:

1. Evaluate `getComputedStyle(document.querySelector('.hero-tagline')).opacity` — expect `"1"` immediately, with no scrolling.
2. Hover the Happy Times card, wait, and evaluate `document.querySelector('.project-media video').paused` — expect `true` (video must not autoplay under reduced motion).

- [ ] **Step 4: Keyboard and contrast verification**

1. Load the page, press `Tab` once. Confirm the "Skip to content" link becomes visible at the top.
2. Press `Enter` and confirm focus moves to `#main`.
3. Tab through the whole page. Confirm every interactive element shows a visible focus ring, and that the ring is white (not blue) on the two black bands.

- [ ] **Step 5: Résumé regression check**

Navigate to `/resume.html`. Confirm it renders in the original warm terracotta style with Manrope and DM Mono loading, completely unaffected.

- [ ] **Step 6: Fix anything the checks surfaced**

Apply the minimum change needed. Re-run the specific failing check. If everything passed, skip this step.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "fix: responsive and accessibility corrections from verification pass"
```

Skip this commit if Step 6 changed nothing.

- [ ] **Step 8: Report back**

Summarise for the user: what the page looks like now, which checks passed, anything that needed fixing, and the two open items from the spec — the 29.7MB `Happy Times.mp4`, and the résumé page still carrying the old design.

---

## Notes for the implementer

**The `Feature` component is the piece to get right.** Three sections flow through it. If a band's background looks wrong, the fix belongs in `TONE_CLASS` or the `tone` value in `content.js` — never a one-off override in `sections.css`.

**`sections.css` has one media query, at the bottom.** Every task appends its rules above it and adds any responsive rules inside it. Do not create a second `@media` block.

**Copy never goes in JSX.** If a string needs changing, it changes in `src/data/content.js`.
