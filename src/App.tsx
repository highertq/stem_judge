import { useEffect, useState } from 'react'

type Health = {
  ok: boolean
  runtime: string
  db: string
  storage: string
  ts: string
}

type Rubric = {
  id: string
  name: string
  criteria: number
  description: string
}

export default function App() {
  const [health, setHealth] = useState<Health | null>(null)
  const [offline, setOffline] = useState(false)
  const [rubrics, setRubrics] = useState<Rubric[]>([])

  useEffect(() => {
    fetch('/api/health')
      .then((r) => r.json())
      .then(setHealth)
      .catch(() => setOffline(true))

    fetch('/api/rubrics')
      .then((r) => r.json())
      .then((d) => setRubrics(d.rubrics ?? []))
      .catch(() => {})
  }, [])

  return (
    <div className="page">
      <header className="nav">
        <div className="brand">
          <span className="mark" />
          Rubricly
        </div>
        <nav className="nav-links">
          <a href="#rubrics">Rubrics</a>
          <a href="#how">How it works</a>
          <a href="#pricing">Pricing</a>
        </nav>
        <div className="nav-cta">
          <button className="btn-text">Sign in</button>
          <button className="btn-primary">Get early access</button>
        </div>
      </header>

      <main>
        <section className="hero">
          <div className="eyebrow">For project-based STEM classrooms</div>
          <h1>
            Grade what students
            <br />
            actually make.
          </h1>
          <p className="lede">
            Your students submit a video, four build photos and a design log. Two hours later you
            still haven't opened them. Rubricly watches the work, cites the evidence, and hands you
            a draft you can sign off on.
          </p>
          <div className="hero-actions">
            <button className="btn-primary lg">Get early access</button>
            <button className="btn-ghost lg">See a sample report</button>
          </div>

          <div className={`status ${offline ? 'bad' : health ? 'good' : ''}`}>
            {offline ? (
              <span>API unreachable — run the worker locally</span>
            ) : health ? (
              <>
                <span className="led" />
                <span>
                  Live on {health.runtime} · D1 {health.db} · R2 {health.storage}
                </span>
              </>
            ) : (
              <span>Checking deployment…</span>
            )}
          </div>
        </section>

        <section className="evidence-card">
          <div className="ev-head">
            <span className="tag">Evidence, not vibes</span>
            <span className="ev-score">3 / 4</span>
          </div>
          <div className="ev-quote">
            <span className="ts">02:14</span>
            Student explains the current path from the battery through the resistor into the LED,
            and points to the jumper on the breadboard as the ground return.
          </div>
          <div className="ev-foot">
            Every rating points at a timestamp, a frame, or a line in the design log. That is the
            difference between a draft you can sign and a draft you have to rewrite.
          </div>
        </section>

        <section id="how" className="steps">
          <h2>From submission to signed report</h2>
          <ol>
            <li>
              <span className="n">01</span>
              <div>
                <h3>Students submit with a link</h3>
                <p>
                  No accounts, no passwords, nothing to install. They upload video, photos, code or
                  a PDF and close the tab.
                </p>
              </div>
            </li>
            <li>
              <span className="n">02</span>
              <div>
                <h3>Rubricly watches the work</h3>
                <p>
                  Video gets transcribed and sampled for key frames. Each rubric criterion is
                  matched against the evidence it is supposed to find.
                </p>
              </div>
            </li>
            <li>
              <span className="n">03</span>
              <div>
                <h3>You confirm, then export</h3>
                <p>
                  Change a level, rewrite a line, accept the rest. Export a parent-ready narrative
                  report or the whole class as CSV.
                </p>
              </div>
            </li>
          </ol>
        </section>

        <section id="rubrics" className="rubrics">
          <div className="section-head">
            <h2>Built-in rubrics</h2>
            <p>Start from a scale that already matches how project work is assessed.</p>
          </div>
          <div className="rubric-grid">
            {rubrics.length === 0 && <div className="loading">Loading rubrics…</div>}
            {rubrics.map((r) => (
              <article key={r.id} className="rubric-card">
                <div className="rc-top">
                  <h3>{r.name}</h3>
                  <span className="rc-count">{r.criteria} criteria</span>
                </div>
                <p>{r.description}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="missing">
          <h2>What it will tell you that a chatbot won't</h2>
          <div className="missing-grid">
            <div>
              <div className="mini-tag warn">Missing evidence</div>
              <p>
                "No load-vs-deflection table. Unclear whether this is <b>not done</b> or{' '}
                <b>not shown</b>."
              </p>
            </div>
            <div>
              <div className="mini-tag">Parent language</div>
              <p>
                "Two documented iterations, each with a stated reason. The gap this term is testing
                discipline."
              </p>
            </div>
            <div>
              <div className="mini-tag">Consistency</div>
              <p>
                Same rubric, same wording across a department — so two teachers stop grading the
                same project one level apart.
              </p>
            </div>
          </div>
        </section>

        <section id="pricing" className="pricing">
          <div className="section-head">
            <h2>Pricing</h2>
            <p>Priced for a teacher's own card, not a district purchase order.</p>
          </div>
          <div className="price-grid">
            <div className="price">
              <div className="p-name">Free</div>
              <div className="p-amount">$0</div>
              <ul>
                <li>1 class</li>
                <li>20 assessments / month</li>
                <li>Watermarked exports</li>
              </ul>
              <button className="btn-ghost full">Start free</button>
            </div>
            <div className="price featured">
              <div className="p-name">
                Teacher <span className="badge">Most teachers</span>
              </div>
              <div className="p-amount">
                $12<span>/mo</span>
              </div>
              <ul>
                <li>Unlimited classes</li>
                <li>200 assessments / month</li>
                <li>Clean exports + student portfolios</li>
              </ul>
              <button className="btn-primary full">Start 14-day trial</button>
            </div>
            <div className="price">
              <div className="p-name">Department</div>
              <div className="p-amount">
                $49<span>/mo</span>
              </div>
              <ul>
                <li>5 teachers</li>
                <li>Shared rubric library</li>
                <li>Cross-class consistency report</li>
              </ul>
              <button className="btn-ghost full">Talk to us</button>
            </div>
          </div>
        </section>
      </main>

      <footer className="foot">
        <div className="brand small">
          <span className="mark" />
          Rubricly
        </div>
        <p>Assess projects, not just papers.</p>
        <p className="fine">
          Built on Cloudflare Workers · D1 · R2. Student records hold a display name and a code
          only — no email addresses, no photographs of faces.
        </p>
      </footer>
    </div>
  )
}
