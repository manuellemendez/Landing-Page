import { useCallback, useEffect, useRef, useState } from "react";

function CopyButton({ value, label }) {
  const [copied, setCopied] = useState(false);
  const timer = useRef(null);

  useEffect(() => () => clearTimeout(timer.current), []);

  const copy = useCallback(async () => {
    if (!navigator.clipboard?.writeText) return;
    try {
      await navigator.clipboard.writeText(value);
    } catch {
      return;
    }
    setCopied(true);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setCopied(false), 2000);
  }, [value]);

  return (
    <button
      className="copy-button"
      type="button"
      onClick={copy}
      aria-label={`Copy ${label}`}
      data-copied={copied || undefined}
    >
      <span aria-hidden="true">{copied ? "Copied" : "Copy"}</span>
      <span className="visually-hidden" role="status">{copied ? `${label} copied` : ""}</span>
    </button>
  );
}

export default function Resume() {
  return (
    <>
      <a className="skip-link" href="#resume-content">Skip to résumé</a>

      <div className="page-shell">
        <nav className="resume-nav" aria-label="Résumé actions">
          <a className="back-link" href="index.html"><span aria-hidden="true">←</span>Portfolio</a>
          <div className="resume-actions">
            <button className="action-link" type="button" onClick={() => window.print()}>Print / save PDF</button>
            <a className="download-link" href="/Resume/My%20Resume.docx" download="Manuel-Mendez-Resume.docx">Download .docx <span aria-hidden="true">↓</span></a>
          </div>
        </nav>

        <header className="resume-hero">
          <div>
            <p className="kicker">Front-end engineer · Calgary, Alberta</p>
            <h1>Manuel<br />Mendez</h1>
          </div>
          <div className="hero-summary">
            <p className="role">React · TypeScript · UI systems</p>
            <p>I build production software that makes complex operations easier to understand and use.</p>
            <span className="availability"><i aria-hidden="true" />Open to the right opportunity</span>
          </div>
        </header>

        <main className="resume-layout" id="resume-content">
          <aside className="resume-sidebar" aria-label="Profile and skills">
            <section className="sidebar-section" aria-labelledby="profile-title">
              <h2 id="profile-title" className="section-title">Profile</h2>
              <p>Front-end engineer with 5+ years of experience building and scaling a production React and TypeScript platform for construction operations. I create clear, resilient user experiences across frontend architecture, design systems, performance, accessibility, and customer-facing delivery.</p>
              <p>I contributed 460+ merged pull requests in a high-velocity product team. Bilingual in English and Spanish.</p>
            </section>

            <section className="sidebar-section" aria-labelledby="contact-title">
              <h2 id="contact-title" className="section-title">Contact</h2>
              <ul className="link-list">
                <li><span>Email</span><a href="mailto:manuellemendez@gmail.com">manuellemendez@gmail.com</a><CopyButton value="manuellemendez@gmail.com" label="email address" /></li>
                <li><span>Phone</span><a href="tel:+15878899306">587 889 9306</a><CopyButton value="587 889 9306" label="phone number" /></li>
                <li><span>LinkedIn</span><a href="https://www.linkedin.com/in/manuel-mendez-379025190/" target="_blank" rel="noreferrer">manuel-mendez ↗</a></li>
                <li><span>GitHub</span><a href="https://github.com/manuellemendez" target="_blank" rel="noreferrer">manuellemendez ↗</a></li>
              </ul>
            </section>

            <section className="sidebar-section" aria-labelledby="skills-title">
              <h2 id="skills-title" className="section-title">Technical strengths</h2>
              <div className="skill-group"><h3>Frontend</h3><p>React, TypeScript, JavaScript, HTML, CSS, React Router, shadcn/ui, Ant Design, responsive UI, internationalization</p></div>
              <div className="skill-group"><h3>Product platform</h3><p>API integrations, server-side search and pagination, OpenTelemetry, signed URLs, third-party integrations, maps, reporting</p></div>
              <div className="skill-group"><h3>Delivery</h3><p>Architecture migrations, design systems, production debugging, Git and GitHub workflows, agile collaboration</p></div>
            </section>
          </aside>

          <div className="resume-main">
            <section className="main-section" aria-labelledby="experience-title">
              <h2 id="experience-title" className="section-title">Experience</h2>
              <article className="entry">
                <div className="entry-heading">
                  <div><h3>Vizzn Inc</h3><p className="entry-role">Front-end Engineer · Permanent full-time</p></div>
                  <div className="entry-meta"><span>Jan 2021 — Aug 2026</span><span>Calgary, Alberta</span></div>
                </div>
                <ul className="achievement-list">
                  <li>Owned production front-end features end-to-end, from architecture and API integration through customer-facing fixes, contributing 460+ merged pull requests across the Vizzn construction-operations platform.</li>
                  <li>Led a major architecture migration by designing a router abstraction layer and moving the application shell away from React Router without disrupting the live product.</li>
                  <li>Built and owned a real-time communications module with rich text, a custom markdown dialect, @mentions, #tags, threads, drafts, mute controls, channel filters, and server-side search.</li>
                  <li>Improved performance across equipment, trailers, jobsites, and the Dispatch Board by replacing heavyweight client-side data fetching with server-side search and pagination.</li>
                  <li>Delivered full-stack capabilities across maps, reporting, and integrations, including a Samsara/Public API subscription surface, signed-URL upload security, and OpenTelemetry instrumentation.</li>
                  <li>Led the migration from Ant Design to shadcn/ui and delivered English, Spanish, and French internationalization across reports, list views, and a standalone micro-application.</li>
                </ul>
              </article>

              <article className="entry entry-compact">
                <div className="entry-heading"><div><h3>TD Canada Trust</h3><p className="entry-role">Personal Banking Associate</p></div><div className="entry-meta"><span>Apr 2019 — Dec 2020</span><span>Calgary, Alberta</span></div></div>
                <p className="entry-description">Helped clients evaluate financial goals and investment options, translating complex products into clear, practical recommendations.</p>
              </article>

              <article className="entry entry-compact">
                <div className="entry-heading"><div><h3>TD Canada Trust</h3><p className="entry-role">Customer Service Representative</p></div><div className="entry-meta"><span>Nov 2016 — Apr 2019</span><span>Calgary, Alberta</span></div></div>
                <p className="entry-description">Resolved customer concerns, processed financial transactions accurately, and communicated banking solutions and processes clearly.</p>
              </article>
            </section>

            <section className="main-section" aria-labelledby="project-title">
              <h2 id="project-title" className="section-title">Selected project</h2>
              <article className="entry project-entry">
                <div className="entry-heading"><div><h3>Happy Times</h3><p className="entry-role">Full-stack team application</p></div><a className="project-link" href="https://loving-lumiere-9af642.netlify.app/" target="_blank" rel="noreferrer">Visit project ↗</a></div>
                <p className="entry-description">Location-based discovery application built with React, Node.js, Express, and map-based geolocation.</p>
              </article>
            </section>

            <section className="main-section" aria-labelledby="education-title">
              <h2 id="education-title" className="section-title">Education + certification</h2>
              <article className="education-entry"><div><h3>Full-Stack Development Program</h3><p>EvolveU</p></div><span>Sep 2020 — Feb 2021</span></article>
              <article className="education-entry"><div><h3>Investment Funds in Canada (IFIC)</h3><p>Canadian Securities Institute</p></div><span>Jan 2019</span></article>
            </section>
          </div>
        </main>

        <footer className="resume-footer"><span>Manuel Mendez / Résumé</span><a href="index.html">Back to portfolio ↑</a></footer>
      </div>
    </>
  );
}
