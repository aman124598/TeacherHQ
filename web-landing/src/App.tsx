import './App.css'

function App() {
  const features = [
    {
      title: 'Geo-verified Attendance',
      copy: 'Prevent proxy marking with high-precision location checks, spoof detection, and audit-safe logs.',
    },
    {
      title: 'Live Operations Dashboard',
      copy: 'Track attendance trends, leaves, punctuality, and department-wise gaps from one command center.',
    },
    {
      title: 'Task + Calendar Workflow',
      copy: 'Unify daily tasks, schedule blocks, and key academic events so teams stop working in silos.',
    },
    {
      title: 'Role-based Controls',
      copy: 'Give admins, HODs, and faculty tailored access with strong boundaries and clean data ownership.',
    },
    {
      title: 'Mobile-first Experience',
      copy: 'Designed for quick check-ins on campus with a frictionless interface that faculty can trust.',
    },
    {
      title: 'Ready for Scale',
      copy: 'Start with one institution and expand to multiple branches while preserving speed and clarity.',
    },
  ]

  const plans = [
    {
      name: 'Starter',
      price: '₹499',
      period: '/month',
      target: 'Small institutes',
      points: ['Up to 50 staff', 'Attendance + Leave tracking', 'Email support'],
      tone: 'muted',
      link: 'https://checkout.dodopayments.com/buy/pdt_0Nbssx6RBsjWdjN6pCt20?quantity=1',
    },
    {
      name: 'Growth',
      price: '₹1,999',
      period: '/month',
      target: 'Growing campuses',
      points: ['Up to 500 staff', 'Advanced analytics', 'Priority support'],
      tone: 'highlight',
      link: 'https://checkout.dodopayments.com/buy/pdt_0Nbst8gsTLhHEJS9Q4LiT?quantity=1',
    },
    {
      name: 'Enterprise',
      price: 'Custom',
      period: '',
      target: 'Multi-campus systems',
      points: ['Unlimited staff', 'SSO + custom workflows', 'Dedicated success manager'],
      tone: 'muted',
      link: 'mailto:amanraj89969@gmail.com',
    },
  ]

  return (
    <div className="landing-root">
      <header className="topbar reveal">
        <a href="https://teacherhq.vercel.app" className="brand">
          <span className="brand-dot" />
          <span>TeacherHQ</span>
        </a>
        <nav className="nav-links">
          <a href="#features">Features</a>
          <a href="#pricing">Pricing</a>
          <a href="#faq">FAQ</a>
          <a href="mailto:amanraj89969@gmail.com?subject=TeacherHQ%20Demo%20Request&body=Hi%20Aman,%20I'm%20interested%20in%20a%20demo%20of%20TeacherHQ%20for%20my%20institution.%20Please%20let%20me%20know%20your%20availability." className="btn btn-small">Book Demo</a>
        </nav>
      </header>

      <section className="hero-section reveal">
        <p className="eyebrow">Built for modern institutions</p>
        <h1>
          Turn Attendance Into
          <span> Real-Time Advantage</span>
        </h1>
        <p className="hero-copy">
          TeacherHQ transforms manual registers into a live operational intelligence layer for schools, colleges,
          and training centers.
        </p>
        <div className="hero-cta">
          <a href="https://teacherhq.vercel.app" className="btn btn-primary">Start Free Trial</a>
          <a href="https://teacherhq.vercel.app" className="btn btn-ghost">View Product Tour</a>
        </div>

        <div className="hero-panel">
          <div className="signal" />
          <div className="hero-metrics">
            <a href="https://teacherhq.vercel.app">
              <h3>98.4%</h3>
              <p>Attendance capture accuracy</p>
            </a>
            <a href="https://teacherhq.vercel.app">
              <h3>63%</h3>
              <p>Faster admin reconciliation</p>
            </a>
            <a href="https://teacherhq.vercel.app">
              <h3>24/7</h3>
              <p>Live visibility across departments</p>
            </a>
          </div>
        </div>
      </section>

      <section className="marquee reveal">
        <a href="https://teacherhq.vercel.app">
          TRUSTED BY ACADEMIC TEAMS • COMPLIANCE-FIRST • ZERO REGISTER CHAOS • REAL-TIME VISIBILITY •
        </a>
      </section>

      <section id="features" className="features reveal">
        <h2>Everything your operations team needs</h2>
        <div className="feature-grid">
          {features.map((feature) => (
            <a href="https://teacherhq.vercel.app" key={feature.title} className="feature-card">
              <h3>{feature.title}</h3>
              <p>{feature.copy}</p>
            </a>
          ))}
        </div>
      </section>

      <section id="pricing" className="pricing reveal">
        <h2>Simple pricing. Serious impact.</h2>
        <div className="pricing-grid">
          {plans.map((plan) => (
            <a href={plan.link} key={plan.name} className={`price-card ${plan.tone}`}>
              <h3>{plan.name}</h3>
              <p className="target">{plan.target}</p>
              <p className="price">
                {plan.price}
                <span>{plan.period}</span>
              </p>
              <ul>
                {plan.points.map((point) => (
                  <li key={point}>{point}</li>
                ))}
              </ul>
              <div className="btn btn-full">Choose {plan.name}</div>
            </a>
          ))}
        </div>
      </section>

      <section className="testimonials reveal">
        <h2>What institutions say</h2>
        <div className="testimonial-grid">
          <a href="https://teacherhq.vercel.app">
            <p>
              "We replaced three disconnected tools. Attendance, tasks, and leaves now run from one clear workflow."
            </p>
            <span>Director, SV Institute of Technology</span>
          </a>
          <a href="https://teacherhq.vercel.app">
            <p>
              "Faculty adoption was instant. The app is fast, clear, and practical for on-campus realities."
            </p>
            <span>Academic Admin, Modern Public School</span>
          </a>
        </div>
      </section>

      <section id="faq" className="faq reveal">
        <h2>Frequently asked questions</h2>
        <div className="faq-list">
          <details open>
            <summary>Can we migrate from manual attendance registers?</summary>
            <p>Yes. We provide guided onboarding and phased data migration support.</p>
          </details>
          <details>
            <summary>Does this work for multi-campus institutions?</summary>
            <p>Yes. You can segment by branch, department, and role while retaining central visibility.</p>
          </details>
          <details>
            <summary>How soon can we go live?</summary>
            <p>Most institutions launch core attendance workflows in under one week.</p>
          </details>
        </div>
      </section>

      <section className="final-cta reveal">
        <h2>Ready to modernize attendance operations?</h2>
        <p>Launch TeacherHQ and give your institution a faster, cleaner, data-first operating system.</p>
        <a href="https://teacherhq.vercel.app" className="btn btn-primary">Get Started Now</a>
      </section>

      <footer className="footer reveal">
        <p>© {new Date().getFullYear()} TeacherHQ. Built for ambitious academic teams.</p>
      </footer>
    </div>
  )
}

export default App
