---
name: Manuel Mendez Portfolio
description: A confident minimal portfolio for a product-minded front-end engineer.
colors:
  ink: "oklch(0.16 0.025 205)"
  ink-soft: "oklch(0.195 0.027 205)"
  paper: "oklch(0.93 0.018 195)"
  paper-deep: "oklch(0.84 0.026 195)"
  accent: "oklch(0.7 0.115 190)"
  signal: "oklch(0.84 0.1 150)"
  muted: "oklch(0.64 0.035 200)"
  line-dark: "oklch(0.93 0.018 195 / 0.16)"
  line-light: "oklch(0.16 0.025 205 / 0.18)"
typography:
  display:
    fontFamily: '"Manrope", "Helvetica Neue", Arial, sans-serif'
    fontSize: "clamp(4rem, 7.6vw, 8.8rem)"
    fontWeight: 800
    lineHeight: 0.9
    letterSpacing: "-0.075em"
  headline:
    fontFamily: '"Manrope", "Helvetica Neue", Arial, sans-serif'
    fontSize: "clamp(2.7rem, 5vw, 5.7rem)"
    fontWeight: 600
    lineHeight: 1
    letterSpacing: "-0.065em"
  title:
    fontFamily: '"Manrope", "Helvetica Neue", Arial, sans-serif'
    fontSize: "clamp(1.8rem, 3.4vw, 3.4rem)"
    fontWeight: 600
    lineHeight: 1
    letterSpacing: "-0.055em"
  body:
    fontFamily: '"Manrope", "Helvetica Neue", Arial, sans-serif'
    fontSize: "clamp(1rem, 1.25vw, 1.22rem)"
    fontWeight: 400
    lineHeight: 1.7
    letterSpacing: "normal"
  label:
    fontFamily: '"DM Mono", "SFMono-Regular", Consolas, monospace'
    fontSize: "0.72rem"
    fontWeight: 400
    lineHeight: 1.6
    letterSpacing: "0.14em"
rounded:
  none: "0"
  sm: "0"
  md: "0"
  lg: "0"
spacing:
  xs: "0.5rem"
  sm: "1rem"
  md: "2rem"
  lg: "4rem"
  xl: "clamp(4rem, 8vw, 7rem)"
components:
  button-primary:
    backgroundColor: "{colors.accent}"
    textColor: "{colors.ink}"
    rounded: "{rounded.none}"
    padding: "0.9rem 1.15rem"
  button-primary-hover:
    backgroundColor: "transparent"
    textColor: "{colors.accent}"
    rounded: "{rounded.none}"
    padding: "0.9rem 1.15rem"
  button-light:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.paper}"
    rounded: "{rounded.none}"
    padding: "0.9rem 1.15rem"
  nav-link:
    textColor: "{colors.paper-deep}"
    typography: "{typography.label}"
  nav-link-hover:
    textColor: "{colors.accent}"
  chip:
    backgroundColor: "transparent"
    textColor: "{colors.muted}"
    rounded: "{rounded.none}"
    padding: "0.5rem 0.7rem"
---

# Design System: Manuel Mendez Portfolio

## 1. Overview

**Creative North Star: "The Craftsman's Bench"**

This portfolio reads like weathered copper architecture after rain: dark mineral surfaces, a controlled verdigris patina, and pale metal catching the light. Every element has a reason to be there. It is grounded and exact, built for hiring managers who want evidence of real craft without theatrical flair.

The system uses a focused full palette. Typography does most of the hierarchy work. Verdigris marks identity and action; pale patina is reserved for live status. Motion is minimal and stateful: subtle reveals on scroll, a hover lift on buttons, and a video preview on project cards.

**Key characteristics:**
- **Mineral-black and pearl.** Blue-green ink grounds the page, mineral pearl carries text, verdigris drives identity, and pale patina signals availability.
- **Angular, not rounded.** Sharp clip-paths and 0px radii throughout. The fluid hero background is the one deliberately organic element.
- **Monospace labels, sans-serif everything else.** DM Mono handles metadata and small labels; Manrope carries headlines and body.
- **Section numbers as wayfinding.** 01–04 labels run vertically on desktop, anchoring the scroll rhythm.
- **Restrained motion.** Reveal-on-scroll for content, hover micro-interactions for interactive elements, full reduced-motion support.
- **A character with a job.** The M-01 companion demonstrates interaction craft through cursor tracking, contextual responses, and one deliberate wave.

## 2. Colors

The palette borrows from oxidized copper rather than generic digital color: blue-green black, mineral pearl, controlled verdigris, and one tightly scoped pale-patina signal.

### Primary
- **Verdigris** (`oklch(0.7 0.115 190)`): The identity color. Used for primary buttons, active navigation, section numbers, project actions, company names, and the contact surface.
- **Pale Patina** (`oklch(0.84 0.1 150)`): A semantic signal used only for live availability.

### Neutral
- **Ink** (`oklch(0.16 0.025 205)`): Primary background, nearly black with a blue-green mineral undertone.
- **Ink Soft** (#1d1b18): Scrolled header background.
- **Surface** (`oklch(0.225 0.032 205)`): Character stage and media backplates, slightly lighter than ink-soft.
- **Surface Raised** (`oklch(0.205 0.03 205)`): Project media backplates and other raised dark surfaces.
- **Paper** (`oklch(0.93 0.018 195)`): Mineral pearl for primary text and borders.
- **Paper Deep** (`oklch(0.84 0.026 195)`): Secondary text and navigation at rest.
- **Muted** (`oklch(0.64 0.035 200)`): Tertiary metadata and captions.
- **Line Dark** (`rgba(238, 233, 223, 0.16)`): Divider lines and chip borders on dark surfaces.
- **Line Light** (`rgba(21, 20, 18, 0.18)`): Divider lines on the light (accent) contact surface.

### Named Rules
**The Two-Signal Rule.** Verdigris owns identity and action. Pale patina communicates live status only. Never use both as interchangeable decoration.

**The No Pure Black Rule.** Backgrounds carry a mineral blue-green undertone and text carries a pearl tint. Neither pure black nor pure white belongs in the system.

## 3. Typography

**Display Font:** Manrope (with Helvetica Neue, Arial fallback)
**Body Font:** Manrope (same stack)
**Label/Mono Font:** DM Mono (with SFMono-Regular, Consolas fallback)

The pairing is confident minimal: Manrope's tight apertures and high weight contrast give headlines authority, while DM Mono keeps labels feeling technical and precise without turning the site into a terminal.

### Hierarchy
- **Display** (800, clamp(4rem, 7.6vw, 8.8rem), line-height 0.9): Hero headline only. Max-width ~10ch. Tight tracking (-0.075em).
- **Headline** (600, clamp(2.7rem, 5vw, 5.7rem), line-height 1): Section statements and experience heading.
- **Title** (600, clamp(1.8rem, 3.4vw, 3.4rem), line-height 1): Timeline roles, project titles.
- **Body** (400, clamp(1rem, 1.25vw, 1.22rem), line-height 1.7): Paragraphs. Max-width ~55–65ch for comfortable reading.
- **Label** (400, 0.72rem, letter-spacing 0.14em, uppercase): Section indices, metadata, tags, nav. Also used for buttons in uppercase with 0.06em tracking.

### Named Rules
**The Big Type, Small Type Rule.** Hierarchy is built on scale contrast and weight, not on many intermediate sizes. Use display/headline/title/body/label only.

**The Caps Are Labels Rule.** Uppercase + wide tracking is reserved for metadata, navigation, and tags. Never uppercase body text.

## 4. Elevation

This system is flat by default. Depth is created through tonal layering (ink → ink-soft → paper-deep), not through shadow. The 3D companion creates its own depth through material and light while the surrounding interface stays flat. Glassmorphism is used sparingly on the scrolled header only.

### Named Rules
**The Flat-By-Default Rule.** Surfaces sit flat. Use tonal contrast or a thin line (`--line-dark`) to separate them, not drop shadows.

**The Glass Is Rare Rule.** Backdrop blur appears only when an element must float above content that still needs to be partially visible. Otherwise use solid ink-soft.

## 5. Components

### Buttons
- **Shape:** Sharp corners (0px border-radius). Inline-flex with min-height 3.4rem.
- **Primary:** Verdigris background, ink text, 1px transparent border, uppercase DM Mono label, 0.06em tracking.
- **Primary hover:** Transparent background with verdigris text and border.
- **Light (on accent surface):** Ink background, paper text, ink border. Hover: transparent background, ink text.
- **State:** `translateY(-3px)` on hover, `scale(0.985)` on active, `focus-visible` outline via global accent outline.

### Chips / Tags
- **Style:** Transparent background, 1px `line-dark` border, muted text.
- **Typography:** DM Mono uppercase, 0.61rem, 0.07em tracking.
- **Use case:** Technology and strength tags on timeline and projects.

### Navigation
- **Desktop:** Inline links in DM Mono, 0.74rem, uppercase-ish lowercase with 0.08em tracking. Underline scales in from left on hover. CTA button styled as primary button.
- **Mobile:** Full-screen overlay in ink. Links become large display-style items. CTA remains small and anchored at bottom.

### Cards / Project Items
- **Shape:** Rectangular media blocks (0px radius), aspect-ratio 1.65.
- **Media:** Image or video fills block; hover scales to 1.04 and restores saturation.
- **Launch badge:** Compact verdigris action label in the top-right with a short positional hover response.
- **Details:** Title and description left-aligned; number label in verdigris above the title.

### Availability Status
- **Shape:** Lightweight edge-aligned status without a container or shadow.
- **Signal dot:** Static pale patina with a soft matching ring, placed in the top rail of the character stage.

### M-01 Interactive Companion
- **Construction:** A custom Three.js field unit built from beveled mineral-metal geometry and verdigris face details.
- **Behavior:** Head and eyes track fine-pointer movement. Activation triggers an articulated wave and contextual copy.
- **Dialogue:** Contextual responses occupy a dedicated console below the stage and never cover the character.
- **Performance:** The scene loads as a separate lazy chunk, pauses outside the viewport, caps pixel density, and disposes GPU resources on unmount.
- **Fallback:** Reduced-motion users receive a static render. Browsers without WebGL receive a lightweight geometric face.

## 6. Do's and Don'ts

### Do:
- **Do** keep verdigris focused on identity and action, and pale patina exclusive to live status.
- **Do** use Manrope for everything except metadata, which uses DM Mono.
- **Do** maintain sharp corners on every component; radii are 0.
- **Do** cap body paragraphs at ~65ch.
- **Do** respect `prefers-reduced-motion` by disabling reveal animations, the liquid background, and hover video previews.
- **Do** use subtle warm tints on neutrals instead of pure black or white.

### Don't:
- **Don't** use gradient text or gradient buttons.
- **Don't** use side-stripe borders as accents on cards, lists, or callouts.
- **Don't** use the generic SaaS/template portfolio clichés from PRODUCT.md: Awwwards-style hero, big metric template, over-animated decoration.
- **Don't** use the cold corporate palette from PRODUCT.md: navy + white, stock visuals, impersonal language.
- **Don't** introduce a second saturated accent color.
- **Don't** round corners or add soft shadows to every surface.
- **Don't** use em dashes in copy.
