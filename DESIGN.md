---
name: Manuel Mendez Portfolio
description: A confident minimal portfolio for a product-minded front-end engineer.
colors:
  ink: "#151412"
  ink-soft: "#1d1b18"
  paper: "#eee9df"
  paper-deep: "#d4cfc5"
  accent: "#c9825a"
  muted: "#999087"
  line-dark: "rgba(238, 233, 223, 0.16)"
  line-light: "rgba(21, 20, 18, 0.18)"
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

This portfolio reads like a clean workshop bench: every element has a reason to be there, and the warm accent is the tool that gets picked up most. The design rejects decoration without function. It is dark, grounded, and precise—built for hiring managers who scan fast and want to see real craft without theatrical flair.

The system is deliberately restrained. Typography does the hierarchy work. Color stays muted until the warm sandstone accent marks what matters: the CTA, the active state, the section index, the portrait edge. Motion is minimal and stateful—subtle reveals on scroll, a hover lift on buttons, a video preview on project cards—never an entrance parade.

**Key characteristics:**
- **Dark-first, warm-on-dark.** Ink backgrounds (#151412) with paper text (#eee9df) and a single warm sandstone accent (#c9825a).
- **Angular, not rounded.** Sharp clip-paths and 0px radii throughout. The only organic shapes are the contact orbit and the fluid sim background.
- **Monospace labels, sans-serif everything else.** DM Mono handles metadata and small labels; Manrope carries headlines and body.
- **Section numbers as wayfinding.** 01–04 labels run vertically on desktop, anchoring the scroll rhythm.
- **Restrained motion.** Reveal-on-scroll for content, hover micro-interactions for interactive elements, full reduced-motion support.

## 2. Colors

The palette is built on warm neutrals and a single accent that behaves like a reading light against a dark wall.

### Primary
- **Warm Sandstone** (#c9825a): The single accent. Used for primary buttons, active nav states, section numbers, project launch badges, timeline company names, and the contact section background.

### Neutral
- **Ink** (#151412): Primary background. Almost black with subtle warm tint.
- **Ink Soft** (#1d1b18): Scrolled header background.
- **Surface** (#28231f): Portrait frame and media backplates. Slightly lighter than ink-soft for subtle depth.
- **Surface Raised** (#25211d): Project media backplates and other raised dark surfaces.
- **Paper** (#eee9df): Primary text and borders on dark surfaces.
- **Paper Deep** (#d4cfc5): Secondary text, nav links at rest.
- **Muted** (#999087): Tertiary metadata, captions, subtle separators.
- **Line Dark** (`rgba(238, 233, 223, 0.16)`): Divider lines and chip borders on dark surfaces.
- **Line Light** (`rgba(21, 20, 18, 0.18)`): Divider lines on the light (accent) contact surface.

### Named Rules
**The One Accent Rule.** Warm sandstone is the only saturated color. It must be the rarest voice on any screen. Use it for the primary action, the current location, and one deliberate emphasis per section.

**The No Pure Black Rule.** Backgrounds are tinted warm (#151412, not #000). Text is tinted cream (#eee9df, not #fff).

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

This system is flat by default. Depth is created through tonal layering (ink → ink-soft → paper-deep), not through shadow. A single soft shadow appears under the availability card (`0 1.5rem 5rem rgba(0, 0, 0, 0.25)`) because it floats above the portrait edge. Glassmorphism is used sparingly: only the scrolled header and availability card use `backdrop-filter: blur()`.

### Named Rules
**The Flat-By-Default Rule.** Surfaces sit flat. Use tonal contrast or a thin line (`--line-dark`) to separate them, not drop shadows.

**The Glass Is Rare Rule.** Backdrop blur appears only when an element must float above content that still needs to be partially visible. Otherwise use solid ink-soft.

## 5. Components

### Buttons
- **Shape:** Sharp corners (0px border-radius). Inline-flex with min-height 3.4rem.
- **Primary:** Warm sandstone background (#c9825a), ink text, 1px transparent border, uppercase DM Mono label, 0.06em tracking.
- **Primary hover:** Transparent background, sandstone text, sandstone border.
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
- **Launch badge:** 3.1rem square sandstone badge in top-right; rotates 45deg on hover.
- **Details:** Title + description left-aligned; number label in sandstone above title.

### Availability Card
- **Shape:** Small rectangular card, 1px line-dark border, ink-soft background, backdrop blur.
- **Accent dot:** Warm sandstone with pulsing ring animation.

## 6. Do's and Don'ts

### Do:
- **Do** keep the warm sandstone accent rare and intentional.
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
