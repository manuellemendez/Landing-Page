# Apple-Style Portfolio Redesign — Design

**Date:** 2026-08-05
**Scope:** Portfolio page (`index.html` entry) only. Résumé page untouched.

## Goal

Redesign the portfolio as though Apple's marketing team built it: apple.com product-page
typography, spacing, color, and narrative rhythm. Replace the current warm editorial system
(terracotta accent, zero border-radius, noise grain, liquid WebGL hero, capability ticker)
with Apple's restraint.

The site's purpose from `PRODUCT.md` is unchanged: make a hiring manager confident that
Manuel ships useful software. This redesign changes how that confidence is signalled — from
editorial character to product-grade calm.

## Decisions

| Question | Decision |
| --- | --- |
| Fidelity | Full apple.com product-page language, not a hybrid |
| Structure | Reframe as product page: hero → feature sections → work → specs → CTA |
| Theme | Light base (`#fff` / `#f5f5f7`) with two full-bleed near-black chapters |
| Accent | Apple blue `#0071e3` |
| Hero | Centered display type, portrait as "product shot" below |
| Motion | Fade + rise on scroll; no scroll-pinning |
| Scope | Portfolio only; delete unused liquid WebGL; leave résumé alone |
| Implementation | Componentized — `src/sections/`, `src/hooks/`, `src/data/`, `src/styles/` |

### Résumé divergence is accepted

`resume.html` / `resume.css` keep the warm editorial system. The two pages will look
unrelated until a follow-up project reskins the résumé. This was chosen deliberately to keep
this project's scope bounded. `resume.css` is fully self-contained (defines its own `:root`
tokens, and `resume.html` loads its own font links), so nothing in this work can break it.

## Design System

### Typography

No webfonts. Apple's own stack, which resolves to real SF Pro on Apple devices and degrades
gracefully elsewhere:

```css
--font: -apple-system, BlinkMacSystemFont, "SF Pro Display", "Helvetica Neue",
        Helvetica, Arial, sans-serif;
```

Dropping Manrope and DM Mono removes two Google Fonts requests and the two `preconnect`
hints from `index.html`.

| Role | Size | Weight | Letter-spacing | Line-height |
| --- | --- | --- | --- | --- |
| Display | `clamp(2.75rem, 6vw, 5rem)` | 600 | `-0.015em` | 1.05 |
| Headline | `clamp(2rem, 4vw, 3rem)` | 600 | `-0.012em` | 1.08 |
| Title | `clamp(1.5rem, 2.4vw, 2rem)` | 600 | `-0.01em` | 1.15 |
| Body | `1.0625rem` | 400 | `0` | 1.47 |
| Eyebrow | `0.8125rem` | 600 | `0` | 1.4 |
| Caption | `0.75rem` | 400 | `0` | 1.4 |

Maximum weight is 600 and tightest tracking is `-0.015em`. The current site uses weight 800
at `-0.075em`; that reversal is the core of the visual change.

### Color

```css
--white:       #ffffff;   /* page base */
--grey-bg:     #f5f5f7;   /* alternating light bands */
--black:       #000000;   /* dark chapter bands */
--text:        #1d1d1f;   /* primary on light */
--text-2:      #6e6e73;   /* secondary on light */
--text-dark:   #f5f5f7;   /* primary on dark */
--text-2-dark: #86868b;   /* secondary on dark */
--hairline:    #d2d2d7;   /* 1px rules, card borders */
--blue:        #0071e3;   /* links, buttons, focus */
--blue-hover:  #0077ed;
```

Contrast, all WCAG AA or better: `#6e6e73` on `#fff` = 4.6:1 · `#86868b` on `#000` = 6.4:1 ·
`#0071e3` on `#fff` = 4.6:1 · `#1d1d1f` on `#fff` = 16.1:1.

### Geometry and motion

```css
--radius-sm:   12px;   /* small controls */
--radius-md:   18px;   /* project cards */
--radius-lg:   28px;   /* hero portrait, media */
--radius-pill: 980px;  /* buttons */
--width:       980px;  /* content column */
--width-wide:  1280px; /* work gallery */
--band-pad:    clamp(5rem, 10vw, 8.75rem);
--ease:        cubic-bezier(0.4, 0, 0.2, 1);
```

The easing curve has no overshoot, replacing the current `cubic-bezier(0.22, 1, 0.36, 1)`.

### Removed

Noise grain overlay, terracotta accent, zero-radius brutalism, overshoot easing, capability
ticker, section numbering (`01`/`02`/`03`), `OPEN TO WORK` orbit text, availability card,
`51.0447° N` portrait notes, hero pointer-glow, liquid WebGL.

## Page Structure

| Band | Background | Content |
| --- | --- | --- |
| Nav | `#fff` at 72% + `blur(20px) saturate(180%)` | Wordmark, 4 links, mobile sheet |
| Hero | `#fff` | Display name, tagline, two blue text links |
| Hero media | `#f5f5f7` | Portrait, `--radius-lg`, soft shadow, caption |
| Feature 1 | `#000` | "Product before polish." — statement only |
| Feature 2 | `#fff` | "Clarity at every layer." + Experience rows |
| Feature 3 | `#000` | "Built for real use." + Work gallery |
| Specs | `#fff` | Tech-specs table |
| CTA | `#f5f5f7` | "Let's build what's next." + pill button + copy email |
| Footer | `#fff`, hairline top | Name, year, three links |

### Why features carry evidence instead of imagery

Apple pairs each feature statement with a product visual. This site has three assets total
(portrait, one project screenshot, one video), and the portrait is spent on the hero. Three
consecutive text-only slabs would read as monotony rather than restraint.

So each feature statement is backed by evidence: Feature 1 stands alone as the single
text-only dramatic moment; Feature 2 is backed by Experience; Feature 3 is backed by Work.
Every asset is used and the light/dark rhythm alternates properly.

### Content changes

- **Experience** compresses from three prose blocks with tag pills to three hairline rows:
  company, role, one line each.
- **Toolkit** becomes the Specs table: Front-end / UI systems / Delivery / Languages.
- **Hero copy** shortens to a name, a two-line tagline, and two links.

## Architecture

```
src/
  Portfolio.jsx          composition only
  data/content.js        features, experience, projects, specs — all copy
  hooks/
    useReveal.js         IntersectionObserver; honors reduced-motion
    useScrolled.js       nav blur/hairline state
    useNavSheet.js       mobile sheet: open/close, focus trap, Esc, body scroll lock
    useCopyEmail.js      clipboard write + mailto fallback + label reset
  sections/
    Nav.jsx  Hero.jsx  HeroMedia.jsx  Feature.jsx
    Experience.jsx  Work.jsx  Specs.jsx  CallToAction.jsx  Footer.jsx
  styles/
    index.css            @imports the three below, in order
    tokens.css           the variables above
    base.css             reset, typography, focus, shared primitives
    sections.css         per-band layout
```

`Feature.jsx` has signature `{ eyebrow, title, body, tone, children }` where `tone` is
`"light" | "grey" | "dark"`. It renders the band, centers the statement, and slots evidence
through `children`. Feature 1 passes no children, Feature 2 wraps `<Experience/>`, Feature 3
wraps `<Work/>`. Every band's background derives from `tone`, so the light/dark rhythm cannot
drift as sections are edited.

All copy lives in `data/content.js`, so editing text never means editing JSX.

The four hooks are extractions of logic already present in `Portfolio.jsx` — the reveal
observer, the scroll listener, the nav focus trap, and the copy-email handler — not new
inventions. The pointer-move glow effect is dropped along with the WebGL.

### Files deleted

- `style.css` (replaced by `src/styles/`)
- `components/canvasui/LiquidVanilla.js` and the `components/` tree

### Files modified

- `src/main.jsx` — import `./styles/index.css` instead of `../style.css`. `index.css`
  `@import`s `tokens.css`, `base.css`, and `sections.css` in that order, so the entry point
  has exactly one stylesheet import.
- `index.html` — remove Google Fonts links and `preconnect` hints; update `theme-color`
  from `#151412` to `#ffffff`

## Behavior

### Motion

A single `.reveal` class: `opacity 0 → 1` and `translateY(24px) → 0` over `0.8s` on
`--ease`, staggered `70ms` in groups of three. The nav crossfades to blurred-with-hairline
past `24px` of scroll. Project video plays on hover and focus, pauses on leave and blur.

All of it is gated behind `prefers-reduced-motion: reduce` — reduced motion reveals content
instantly and never plays video automatically.

### Accessibility

WCAG 2.1 AA, per `PRODUCT.md`.

- Skip link retained.
- Mobile nav sheet keeps focus trap, Esc-to-close, and body scroll lock.
- Focus ring is `2px solid #0071e3` at `2px` offset; on dark bands it becomes `#fff`.
- Specs is a real `<table>` with `<th scope="row">`.
- Portrait and project screenshot keep descriptive alt text; the video keeps its
  `aria-label`.
- Contrast pairs verified above.

### Responsive

One breakpoint, at `768px`. Below it: display type sits at its `clamp()` floor, the portrait
goes full-width minus `20px` gutters, the work gallery stacks to one column, the specs table
collapses to label-over-value, and the nav collapses to the sheet.

## Verification

1. `pnpm build` completes clean.
2. Playwright at 1440px and 390px: screenshot every band.
3. Nav blur toggles past 24px scroll.
4. Mobile sheet opens, traps focus, closes on Esc.
5. Copy-email button swaps its label and reverts.
6. Project video plays on hover.
7. No console errors.
8. Résumé page loads unchanged (regression check).

## Known Issues

**`public/Images/Happy Times.mp4` is 29.7MB.** Any hover on the project card triggers a
29.7MB download. This is pre-existing, not introduced here, and is currently masked by
`preload="metadata"`. Out of scope for this redesign; worth a follow-up to compress or
replace it with a poster image plus a short loop.

## Risks

**The page may read as underdesigned rather than confident.** With webfonts, grain, and
WebGL all removed, very little is left but type and space — which is the point, but the line
between Apple-calm and empty is thin. If it lands wrong, the fix is a third dark chapter or
a stronger type scale, not re-adding decoration.

**Apple's language is recognizable enough to invite comparison.** A portfolio that looks like
apple.com invites the judgment of apple.com. Execution has to be tight — the spacing and
type scale carry the entire impression, so they are specified precisely above rather than
left to feel.
