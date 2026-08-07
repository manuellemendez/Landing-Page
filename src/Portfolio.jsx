import { useCallback, useEffect, useRef, useState } from "react";
import { createLiquid } from "../components/canvasui/LiquidVanilla.js";

const focusableSelector = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled])",
  "textarea:not([disabled])",
  "select:not([disabled])",
  '[tabindex]:not([tabindex="-1"])',
].join(", ");

export default function Portfolio() {
  const [isNavigationOpen, setIsNavigationOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [copyLabel, setCopyLabel] = useState("Copy email");
  const navRef = useRef(null);
  const liquidRootRef = useRef(null);
  const liquidSourceRef = useRef(null);
  const liquidContentRef = useRef(null);
  const liquidOutputRef = useRef(null);
  const heroRef = useRef(null);
  const heroGlowRef = useRef(null);
  const lastFocusedElementRef = useRef(null);
  const copyResetTimeoutRef = useRef(null);

  const getFocusableNavItems = useCallback(
    () => Array.from(navRef.current?.querySelectorAll(focusableSelector) ?? []),
    [],
  );

  const closeNavigation = useCallback(() => {
    setIsNavigationOpen(false);
    document.body.style.overflow = "";

    if (lastFocusedElementRef.current?.focus) {
      lastFocusedElementRef.current.focus();
    }
    lastFocusedElementRef.current = null;
  }, []);

  const openNavigation = useCallback(() => {
    lastFocusedElementRef.current = document.activeElement;
    setIsNavigationOpen(true);
    document.body.style.overflow = "hidden";

    window.setTimeout(() => {
      getFocusableNavItems()[0]?.focus();
    }, 10);
  }, [getFocusableNavItems]);

  useEffect(() => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const liquidRoot = liquidRootRef.current;
    const liquidSource = liquidSourceRef.current;
    const liquidContent = liquidContentRef.current;
    const liquidOutput = liquidOutputRef.current;
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
    const splatTimeout =
      liquid && !reduceMotion.matches
        ? window.setTimeout(() => liquid.splat(0.76, 0.43, -34, 26), 500)
        : null;

    return () => {
      if (splatTimeout) window.clearTimeout(splatTimeout);
      liquid?.destroy();
    };
  }, []);

  useEffect(() => {
    const handleKeydown = (event) => {
      if (!isNavigationOpen) return;

      if (event.key === "Escape") {
        closeNavigation();
        return;
      }

      if (event.key !== "Tab") return;
      const focusable = getFocusableNavItems();
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
      if (window.innerWidth > 760 && isNavigationOpen) closeNavigation();
    };

    window.addEventListener("keydown", handleKeydown);
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("keydown", handleKeydown);
      window.removeEventListener("resize", handleResize);
    };
  }, [closeNavigation, getFocusableNavItems, isNavigationOpen]);

  useEffect(() => {
    const setHeaderState = () => setIsScrolled(window.scrollY > 24);
    setHeaderState();
    window.addEventListener("scroll", setHeaderState, { passive: true });
    return () => window.removeEventListener("scroll", setHeaderState);
  }, []);

  useEffect(() => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const revealItems = document.querySelectorAll(".reveal");
    if (!("IntersectionObserver" in window) || reduceMotion.matches) {
      revealItems.forEach((item) => item.classList.add("is-visible"));
      return undefined;
    }

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
    return () => revealObserver.disconnect();
  }, []);

  useEffect(() => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const hero = heroRef.current;
    const heroGlow = heroGlowRef.current;
    if (!hero || !heroGlow || reduceMotion.matches) return undefined;

    const handlePointerMove = (event) => {
      const bounds = hero.getBoundingClientRect();
      const x = ((event.clientX - bounds.left) / bounds.width) * 100;
      const y = ((event.clientY - bounds.top) / bounds.height) * 100;
      heroGlow.style.setProperty("--glow-x", `${x}%`);
      heroGlow.style.setProperty("--glow-y", `${y}%`);
    };
    hero.addEventListener("pointermove", handlePointerMove);
    return () => hero.removeEventListener("pointermove", handlePointerMove);
  }, []);

  useEffect(() => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const projects = document.querySelectorAll(".project-video-wrap");
    if (reduceMotion.matches) return undefined;

    const cleanups = Array.from(projects).map((project) => {
      const video = project.querySelector("video");
      if (!video) return () => {};
      const play = () => video.play().catch(() => {});
      const pause = () => video.pause();
      project.addEventListener("mouseenter", play);
      project.addEventListener("mouseleave", pause);
      project.addEventListener("focusin", play);
      project.addEventListener("focusout", pause);
      return () => {
        project.removeEventListener("mouseenter", play);
        project.removeEventListener("mouseleave", pause);
        project.removeEventListener("focusin", play);
        project.removeEventListener("focusout", pause);
      };
    });
    return () => cleanups.forEach((cleanup) => cleanup());
  }, []);

  useEffect(
    () => () => {
      if (copyResetTimeoutRef.current) window.clearTimeout(copyResetTimeoutRef.current);
      document.body.style.overflow = "";
    },
    [],
  );

  const copyEmail = async () => {
    const email = "manuellemendez@gmail.com";
    try {
      await navigator.clipboard.writeText(email);
      setCopyLabel("Email copied");
      if (copyResetTimeoutRef.current) window.clearTimeout(copyResetTimeoutRef.current);
      copyResetTimeoutRef.current = window.setTimeout(() => setCopyLabel("Copy email"), 1800);
    } catch {
      window.location.href = `mailto:${email}`;
    }
  };

  return (
    <>
      <a className="skip-link" href="#main-content">Skip to content</a>

      <header className={`site-header${isScrolled ? " is-scrolled" : ""}`}>
        <a className="wordmark" href="#top" aria-label="Manuel Mendez, home">
          <span className="wordmark-mark">MM</span>
          <span className="wordmark-name">Manuel Mendez</span>
        </a>

        <button
          className="nav-toggle"
          type="button"
          aria-expanded={isNavigationOpen}
          aria-controls="site-nav"
          onClick={() => (isNavigationOpen ? closeNavigation() : openNavigation())}
        >
          <span>Menu</span>
          <span className="nav-toggle-icon" aria-hidden="true" />
        </button>

        <nav
          className={`site-nav${isNavigationOpen ? " is-open" : ""}`}
          id="site-nav"
          aria-label="Main navigation"
          aria-modal={isNavigationOpen || undefined}
          ref={navRef}
        >
          <a href="#about" onClick={closeNavigation}>About</a>
          <a href="#experience" onClick={closeNavigation}>Experience</a>
          <a href="#work" onClick={closeNavigation}>Work</a>
          <a href="resume.html" onClick={closeNavigation}>Résumé ↗</a>
          <a className="nav-cta" href="#contact" onClick={closeNavigation}>Let’s talk <span aria-hidden="true">↗</span></a>
        </nav>
      </header>

      <main id="main-content">
        <section className="hero" id="top" aria-labelledby="hero-title" ref={(element) => { liquidRootRef.current = element; heroRef.current = element; }}>
          <canvas className="liquid-source" aria-hidden="true" ref={liquidSourceRef} />
          <canvas className="liquid-output" aria-hidden="true" ref={liquidOutputRef} />
          <div className="hero-glow" aria-hidden="true" ref={heroGlowRef} />
          <div className="hero-grid" ref={liquidContentRef}>
            <div className="hero-copy">
              <p className="eyebrow reveal">Front-end engineer · Calgary, Canada</p>
              <h1 id="hero-title" className="hero-title reveal">
                I make complex work
                <span className="hero-title-accent">feel clear.</span>
              </h1>
              <p className="hero-intro reveal">
                I’m Manuel—a product-minded developer who turns real operational problems into focused, human software.
              </p>
              <div className="hero-actions reveal">
                <a className="button button-primary" href="#work">See selected work <span aria-hidden="true">↓</span></a>
                <div className="hero-secondary-actions">
                  <a className="text-link" href="https://www.linkedin.com/in/manuel-mendez-379025190/" target="_blank" rel="noreferrer">LinkedIn <span aria-hidden="true">↗</span></a>
                  <a className="text-link" href="resume.html">Résumé <span aria-hidden="true">↗</span></a>
                </div>
              </div>
            </div>

            <div className="hero-portrait-wrap reveal">
              <div className="portrait-frame">
                <img className="hero-portrait" src="/Images/Me.jpg" alt="Portrait of Manuel Mendez" width="709" height="938" fetchPriority="high" decoding="async" />
                <div className="portrait-scanline" aria-hidden="true" />
              </div>
              <p className="portrait-note portrait-note-top">51.0447° N / curious by default</p>
              <div className="availability-card"><span className="availability-dot" aria-hidden="true" /><span>Available for the right team</span></div>
              <p className="portrait-note portrait-note-bottom">English / Español</p>
            </div>
          </div>

          <div className="hero-index" aria-hidden="true">
            <span>Portfolio / 2026</span><span className="hero-index-line" /><span>Scroll to explore</span>
          </div>
        </section>

        <div className="capability-ticker" aria-label="Core strengths">
          <div className="ticker-track">
            <span>React</span><i>✳</i><span>TypeScript</span><i>✳</i><span>UI systems</span><i>✳</i><span>Internationalization</span><i>✳</i><span>Product thinking</span><i>✳</i><span>English + Spanish</span><i>✳</i>
            <span aria-hidden="true">React</span><i aria-hidden="true">✳</i><span aria-hidden="true">TypeScript</span><i aria-hidden="true">✳</i><span aria-hidden="true">UI systems</span><i aria-hidden="true">✳</i><span aria-hidden="true">Internationalization</span><i aria-hidden="true">✳</i><span aria-hidden="true">Product thinking</span><i aria-hidden="true">✳</i><span aria-hidden="true">English + Spanish</span><i aria-hidden="true">✳</i>
          </div>
        </div>

        <section className="about section" id="about" aria-labelledby="about-title">
          <div className="section-label reveal"><span>01</span><p>What I bring</p></div>
          <div className="about-content">
            <h2 id="about-title" className="statement reveal">Code is only useful when it solves the <em>right</em> problem.</h2>
            <div className="about-grid">
              <p className="about-lead reveal">My path runs through both banking and software. That means I can understand the technical system, listen for the human problem, and communicate clearly between the two.</p>
              <div className="principles">
                <article className="principle reveal"><span className="principle-number">A</span><div><h3>Product before polish</h3><p>I start with the user, the constraint, and the outcome—not the trend.</p></div></article>
                <article className="principle reveal"><span className="principle-number">B</span><div><h3>Clarity at every layer</h3><p>From interface decisions to team communication, I make the work easier to follow.</p></div></article>
                <article className="principle reveal"><span className="principle-number">C</span><div><h3>Built for real use</h3><p>I care about responsive behavior, edge cases, and the details people feel.</p></div></article>
              </div>
            </div>
          </div>
        </section>

        <section className="experience section" id="experience" aria-labelledby="experience-title">
          <div className="section-label reveal"><span>02</span><p>Experience</p></div>
          <div className="experience-content">
            <div className="experience-heading reveal"><p className="eyebrow">A career built around people + systems</p><h2 id="experience-title">From client conversations to production software.</h2></div>
            <div className="timeline">
              <article className="timeline-item reveal"><div className="timeline-meta"><span>Most recent</span><span>Calgary, AB</span></div><div className="timeline-main"><h3>Front-end Engineer</h3><p className="timeline-company">Vizzn Inc</p><p>Build and evolve production React and TypeScript interfaces for construction operations, from routing and design-system migrations to fast, localized workflows for equipment, dispatch, reporting, and real-time communication.</p><ul className="tag-list" aria-label="Relevant strengths"><li>React + TypeScript</li><li>shadcn/ui + Ant Design</li><li>i18n + accessible UI</li></ul></div></article>
              <article className="timeline-item reveal"><div className="timeline-meta"><span>Earlier chapter</span><span>Calgary, AB</span></div><div className="timeline-main"><h3>Personal Banking Associate</h3><p className="timeline-company">TD Canada Trust</p><p>Helped clients navigate financial decisions, translated complex information into clear next steps, and built trust in conversations where accuracy mattered.</p><ul className="tag-list" aria-label="Relevant strengths"><li>Client empathy</li><li>Problem solving</li><li>Clear communication</li></ul></div></article>
              <article className="timeline-item reveal"><div className="timeline-meta"><span>2020—2021</span><span>EvolveU</span></div><div className="timeline-main"><h3>Full-stack development</h3><p className="timeline-company">Immersive program</p><p>Built responsive, project-based applications across the stack, learning through agile collaboration, testing, and frequent delivery.</p><ul className="tag-list" aria-label="Technology foundations"><li>React</li><li>Node + Express</li><li>API integration</li></ul></div></article>
            </div>
          </div>
        </section>

        <section className="work section" id="work" aria-labelledby="work-title">
          <div className="section-label reveal"><span>03</span><p>Selected work</p></div>
          <div className="work-heading reveal"><h2 id="work-title">Work with a reason to exist.</h2><p>A small selection of practical builds—from a family business going online to a collaborative full-stack product.</p></div>
          <div className="project-list">
            <article className="project project-featured reveal">
              <a className="project-media" href="https://www.mipequenosanfranciscodeasis.com/" target="_blank" rel="noreferrer" aria-label="Visit Mi Pequeño San Francisco de Asís website">
                <img src="/Images/photo-project1 (2).jpg" alt="Homepage of the Mi Pequeño San Francisco de Asís kindergarten website" width="1896" height="928" loading="lazy" decoding="async" />
                <span className="project-launch" aria-hidden="true">↗</span>
              </a>
              <div className="project-details"><div className="project-number">01 / Live website</div><h3>Mi Pequeño San Francisco de Asís</h3><p>A responsive online home for a family-run kindergarten—built to make its programs, values, and contact path easy for parents to understand.</p><ul className="project-stack" aria-label="Project technology"><li>Responsive web</li><li>JavaScript</li><li>Content design</li></ul></div>
            </article>
            <article className="project project-secondary reveal">
              <a className="project-media project-video-wrap" href="https://loving-lumiere-9af642.netlify.app/" target="_blank" rel="noreferrer" aria-label="Open Happy Times application">
                <video className="project-video" src="/Images/Happy Times.mp4" muted loop playsInline preload="metadata" aria-label="Preview of the Happy Times application" />
                <span className="video-prompt">Hover to preview</span><span className="project-launch" aria-hidden="true">↗</span>
              </a>
              <div className="project-details"><div className="project-number">02 / Team build</div><h3>Happy Times</h3><p>A location-based full-stack application that helped people find happy-hour options around Calgary, created with a collaborative product team.</p><ul className="project-stack" aria-label="Project technology"><li>React</li><li>Node + Express</li><li>Map-based geolocation</li></ul></div>
            </article>
            <article className="project project-featured reveal">
              <a className="project-media" href="https://github.com/manuellemendez/Kindi" target="_blank" rel="noreferrer" aria-label="View Kindi repository on GitHub">
                <img src="/Images/kindi-dashboard.png" alt="Brotes dashboard showing collection trend, monthly overview, and families by amount owed" width="3198" height="1524" loading="lazy" decoding="async" />
                <span className="project-launch" aria-hidden="true">↗</span>
                <ul className="project-tech-reveal" aria-hidden="true"><li>React 19</li><li>TypeScript</li><li>Vite</li><li>Firebase</li><li>Tailwind v4</li></ul>
              </a>
              <div className="project-details"><div className="project-number">03 / Private build</div><h3>Kindi</h3><p>A family-finance app built for a kindergarten's front office—tracking dues, budgets, and payments, with Firestore rules that keep every record append-only.</p><ul className="project-stack" aria-label="Project technology"><li>React + TypeScript</li><li>Firebase</li><li>Vite</li></ul></div>
            </article>
            <article className="project project-secondary reveal">
              <a className="project-media project-media-code" href="https://github.com/manuellemendez/zoombies" target="_blank" rel="noreferrer" aria-label="View Zombie Survival repository on GitHub">
                <span className="project-media-mark" aria-hidden="true">Zoombies</span>
                <span className="project-launch" aria-hidden="true">↗</span>
                <ul className="project-tech-reveal" aria-hidden="true"><li>Godot 4.6</li><li>GDScript</li><li>Python</li><li>Procedural audio</li></ul>
              </a>
              <div className="project-details"><div className="project-number">04 / Personal project</div><h3>Zombie Survival</h3><p>A top-down 2.5D zombie shooter across six procedurally dressed city districts, with a full day/night cycle, dynamic weather, and a boss guarding every district.</p><ul className="project-stack" aria-label="Project technology"><li>Godot + GDScript</li><li>Python</li><li>Procedural audio</li></ul></div>
            </article>
          </div>
          <a className="github-link reveal" href="https://github.com/manuellemendez" target="_blank" rel="noreferrer"><span>More experiments and code on GitHub</span><span aria-hidden="true">View profile ↗</span></a>
        </section>

        <section className="toolkit section" aria-labelledby="toolkit-title">
          <div className="section-label reveal"><span>04</span><p>Toolkit</p></div>
          <div className="toolkit-content">
            <h2 id="toolkit-title" className="reveal">Tools change. The way I think travels.</h2>
            <div className="toolkit-grid">
              <div className="tool-group reveal"><p>Front-end foundations</p><ul><li>React</li><li>TypeScript</li><li>JavaScript</li><li>HTML + CSS</li></ul></div>
              <div className="tool-group reveal"><p>UI systems</p><ul><li>shadcn/ui</li><li>Ant Design</li><li>React Router</li><li>Internationalization</li></ul></div>
              <div className="tool-group reveal"><p>Production delivery</p><ul><li>Server-side search + pagination</li><li>API + third-party integrations</li><li>OpenTelemetry</li><li>Git + GitHub workflows</li></ul></div>
            </div>
          </div>
        </section>

        <section className="contact section" id="contact" aria-labelledby="contact-title">
          <div className="contact-orbit" aria-hidden="true"><span>OPEN TO WORK · OPEN TO IDEAS · </span></div>
          <p className="eyebrow reveal">Have a product problem worth solving?</p>
          <h2 id="contact-title" className="reveal">Let’s build what’s next.</h2>
          <p className="contact-copy reveal">I’m exploring front-end opportunities with teams that care about useful products, thoughtful craft, and good collaboration.</p>
          <div className="contact-actions reveal">
            <a className="button button-light" href="mailto:manuellemendez@gmail.com">Start a conversation <span aria-hidden="true">↗</span></a>
            <button className="copy-email" type="button" onClick={copyEmail}><span>{copyLabel}</span></button>
          </div>
        </section>
      </main>

      <footer className="site-footer">
        <p>Manuel Mendez <span aria-hidden="true">©</span> <span>{new Date().getFullYear()}</span></p>
        <div className="footer-links">
          <a href="https://www.linkedin.com/in/manuel-mendez-379025190/" target="_blank" rel="noreferrer">LinkedIn ↗</a>
          <a href="https://github.com/manuellemendez" target="_blank" rel="noreferrer">GitHub ↗</a>
          <a href="resume.html">Résumé ↗</a>
          <a href="#top">Back to top ↑</a>
        </div>
      </footer>
    </>
  );
}
