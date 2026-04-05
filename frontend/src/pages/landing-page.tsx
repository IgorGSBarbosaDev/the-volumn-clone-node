import { BrandBadge } from '../components/brand-badge'

const tickerItems = [
  'Track Every Lift',
  'Beat Your PR',
  'Progressive Overload',
  'Log The Session',
  'Measure The Gain',
  'Train With Purpose',
  'Build The Base',
  'Stay The Course',
] as const

const statCards = [
  { label: 'Athletes', value: '58K+', sublabel: '90+ countries' },
  { label: 'Workouts', value: '3.2M+', sublabel: 'Logged to date' },
  { label: 'PRs Broken', value: '142K+', sublabel: 'This month' },
] as const

const featureCards = [
  {
    description: 'Log every set, rep, and weight in seconds. Custom templates built for your exact training style.',
    icon: 'log',
    title: 'Workout Logging',
  },
  {
    description: 'Week-by-week load tracking that shows exactly where your strength is going.',
    icon: 'progress',
    title: 'Load Progression',
  },
  {
    description: 'Plan push, pull, upper, and lower sessions with structure that survives real life.',
    icon: 'plan',
    title: 'Plan Structure',
  },
  {
    description: 'See total volume, completed sets, and session density without spreadsheet work.',
    icon: 'volume',
    title: 'Volume Tracking',
  },
  {
    description: 'Review your history fast and surface the lifts that are actually moving forward.',
    icon: 'history',
    title: 'History Review',
  },
  {
    description: 'Built for solo athletes who want proof, not vibes, from every workout logged.',
    icon: 'focus',
    title: 'Performance Focus',
  },
] as const

const processSteps = [
  {
    body: 'Start with the split you actually run, not a bloated template library.',
    number: '01',
    title: 'Choose your structure',
  },
  {
    body: 'Build workouts around the exercises, set types, and load targets you use.',
    number: '02',
    title: 'Log with intent',
  },
  {
    body: 'Capture the performed sets so your real training history stays accurate.',
    number: '03',
    title: 'Track the session',
  },
  {
    body: 'Use PRs, volume, and history to decide the next jump instead of guessing.',
    number: '04',
    title: 'Push progression',
  },
] as const

const sampleWorkout = [
  { completed: true, exercise: 'Bench Press', meta: '4 sets · 5 reps', weight: '100 kg' },
  { completed: true, exercise: 'Incline DB', meta: '3 sets · 10 reps', weight: '32 kg' },
  { completed: false, exercise: 'Cable Fly', meta: '3 sets · 15 reps', weight: '18 kg' },
] as const

function ArrowRightIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 16 16">
      <path
        d="M3.3 8h8.6m0 0-3-3m3 3-3 3"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
      />
    </svg>
  )
}

function FeatureIcon({ kind }: { kind: (typeof featureCards)[number]['icon'] }) {
  switch (kind) {
    case 'log':
      return (
        <svg aria-hidden="true" viewBox="0 0 20 20">
          <path d="M5 4.4h10M5 10h10M5 15.6h6" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="1.6" />
        </svg>
      )
    case 'progress':
      return (
        <svg aria-hidden="true" viewBox="0 0 20 20">
          <path d="M4 14.8 8 10l3 2.4 5-6.2" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.6" />
        </svg>
      )
    case 'plan':
      return (
        <svg aria-hidden="true" viewBox="0 0 20 20">
          <rect x="3.7" y="4.2" width="12.6" height="11.6" rx="2" fill="none" stroke="currentColor" strokeWidth="1.6" />
          <path d="M7 2.9v2.6m6-2.6v2.6m-7.4 4H14m-8.4 3.1h5.2" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="1.6" />
        </svg>
      )
    case 'volume':
      return (
        <svg aria-hidden="true" viewBox="0 0 20 20">
          <path d="M4.2 15.6V9.8m5.8 5.8V6.4m5.8 9.2V3.8" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" />
        </svg>
      )
    case 'history':
      return (
        <svg aria-hidden="true" viewBox="0 0 20 20">
          <path d="M4.1 10a5.9 5.9 0 1 0 1.7-4.2L4.1 7.4M4.1 4.7v2.7h2.7M10 6.4v3.8l2.5 1.5" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
        </svg>
      )
    case 'focus':
      return (
        <svg aria-hidden="true" viewBox="0 0 20 20">
          <path d="M10 3.5 12 7.6l4.5.7-3.2 3.1.8 4.4-4.1-2.1-4.1 2.1.8-4.4L3.5 8.3l4.5-.7L10 3.5Z" fill="none" stroke="currentColor" strokeLinejoin="round" strokeWidth="1.5" />
        </svg>
      )
  }
}

export function LandingPage() {
  return (
    <main className="landing-shell">
      <section className="landing-hero">
        <div className="landing-hero__copy">
          <BrandBadge />
          <h1 aria-label="Track Every Lift. Dominate Every Gym.">
            <span>Track</span>
            <span>Every Lift.</span>
            <span>Dominate</span>
            <span>Every Gym.</span>
          </h1>
          <p>
            The Volumn gives solo lifters a clean system for logging workouts, tracking progression, and proving that the work is paying off.
          </p>

          <div className="landing-hero__actions">
            <button className="landing-primary-action" type="button">
              <span>Start Tracking Free</span>
              <ArrowRightIcon />
            </button>
            <button className="landing-secondary-action" type="button">
              Sign In
            </button>
          </div>

          <div className="landing-proof">
            <div className="landing-proof__avatars" aria-hidden="true">
              <span />
              <span />
              <span />
            </div>
            <p>58,000+ athletes already logging the work.</p>
          </div>
        </div>

        <div className="landing-device">
          <div className="landing-device__frame">
            <div className="landing-device__notch" />
            <div className="landing-device__screen">
              <div className="landing-device__status">
                <p>Thursday · Push Day</p>
                <span>Active</span>
              </div>

              <header className="landing-device__hero">
                <div>
                  <h2>Push Day A</h2>
                  <p>Track every work set without breaking flow.</p>
                </div>

                <div className="landing-device__metrics">
                  <article>
                    <span>Duration</span>
                    <strong>47:23</strong>
                  </article>
                  <article>
                    <span>Volume</span>
                    <strong>6240 kg</strong>
                  </article>
                  <article>
                    <span>Sets</span>
                    <strong>10 / 12</strong>
                  </article>
                </div>
              </header>

              <div className="landing-device__list">
                {sampleWorkout.map((item) => (
                  <article key={item.exercise} className={`landing-device__row${item.completed ? ' landing-device__row--done' : ''}`}>
                    <span className="landing-device__check" aria-hidden="true" />
                    <div>
                      <h3>{item.exercise}</h3>
                      <p>{item.meta}</p>
                    </div>
                    <strong>{item.weight}</strong>
                  </article>
                ))}
              </div>

              <button className="landing-device__cta" type="button">
                Log Next Set
              </button>
            </div>
          </div>
        </div>
      </section>

      <section aria-label="Performance ticker" className="landing-ticker">
        <div className="landing-ticker__track">
          {[...tickerItems, ...tickerItems].map((item, index) => (
            <span key={`${item}-${index}`}>
              {item}
              <strong>✦</strong>
            </span>
          ))}
        </div>
      </section>

      <section className="landing-stats" aria-label="Platform stats">
        {statCards.map((card) => (
          <article key={card.label} className="landing-stats__card">
            <strong>{card.value}</strong>
            <h2>{card.label}</h2>
            <p>{card.sublabel}</p>
          </article>
        ))}
      </section>

      <section className="landing-section">
        <div className="landing-section__intro">
          <span>Built for Performance</span>
          <h2>Every tool you need to train at your peak.</h2>
        </div>

        <div className="landing-feature-grid">
          {featureCards.map((card) => (
            <article key={card.title} className="landing-feature-card">
              <span className="landing-feature-card__icon">
                <FeatureIcon kind={card.icon} />
              </span>
              <h3>{card.title}</h3>
              <p>{card.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="landing-analytics">
        <div className="landing-analytics__copy">
          <span>Progress in motion</span>
          <h2>See your strength evolving.</h2>
          <p>
            Review session volume, completed work, and the lifts that are ready for the next jump without digging through notes.
          </p>
        </div>

        <div className="landing-analytics__panel">
          <div className="landing-analytics__chart">
            <p>Weekly volume</p>
            <div className="landing-analytics__bars" aria-hidden="true">
              <span style={{ height: '32%' }} />
              <span style={{ height: '54%' }} />
              <span style={{ height: '78%' }} />
              <span style={{ height: '100%' }} />
            </div>
          </div>

          <div className="landing-analytics__kpis">
            <article>
              <span>PR streak</span>
              <strong>+21.3%</strong>
            </article>
            <article>
              <span>Work sets</span>
              <strong>102</strong>
            </article>
            <article>
              <span>Avg load</span>
              <strong>380 kg</strong>
            </article>
          </div>
        </div>
      </section>

      <section className="landing-section">
        <div className="landing-section__intro">
          <span>Discipline is the platform</span>
          <h2>Train with a system that keeps momentum visible.</h2>
        </div>

        <div className="landing-process-grid">
          {processSteps.map((step) => (
            <article key={step.number} className="landing-process-card">
              <strong>{step.number}</strong>
              <h3>{step.title}</h3>
              <p>{step.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="landing-cta">
        <span>Free to start · No credit card</span>
        <h2>Your next PR starts here.</h2>
        <p>Join athletes already using The Volumn to train smarter, log harder, and build progress that does not lie.</p>

        <div className="landing-cta__actions">
          <button className="landing-primary-action" type="button">
            <span>Create Free Account</span>
            <ArrowRightIcon />
          </button>
          <button className="landing-secondary-action" type="button">
            Sign In
          </button>
        </div>

        <footer className="landing-footer">
          <BrandBadge />
          <small>Focused training for athletes who care about measurable progress.</small>
        </footer>
      </section>
    </main>
  )
}
