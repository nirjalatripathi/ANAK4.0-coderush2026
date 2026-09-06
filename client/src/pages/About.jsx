import SectionHeader from '../components/SectionHeader';

function IconCheck() {
  return <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5 text-teal-700 shrink-0 mt-0.5"><path fillRule="evenodd" d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z" clipRule="evenodd" /></svg>;
}

const capabilities = [
  'Identifies and records local disasters with type, level, and affected areas',
  'Represents disaster severity through defined levels (1–4)',
  'Supports safe-zone declaration by local authorities',
  'Helps communities identify and access relief camps',
  'Tracks camp population, capacity, and resource status',
  'Calculates actual inventory shortages from camp data',
  'Publishes verified, calculated relief needs for public view',
  'Connects donors with real, specific requirements',
  'Tracks donations from pledge through delivery',
  'Updates inventory after verified receipt confirmation',
  'Provides local-level disaster coordination transparency',
];

const problems = [
  'Unclear local needs — communities unsure what supplies are actually missing',
  'Uneven distribution — supplies concentrated at visible or popular camps',
  'No real-time camp inventory — officials working without data',
  'Donors not knowing where supplies are most needed',
  'Difficulty coordinating local safe zones during rapid events',
  'Limited visibility into whether donated resources reached the intended camp',
];

const workflowSteps = [
  { n: '01', title: 'Local Disaster',         desc: 'A disaster is recorded with type, location, and severity.' },
  { n: '02', title: 'Disaster Level',          desc: 'Level 1–4 is assigned based on scope and impact.' },
  { n: '03', title: 'Safe Zone Declaration',   desc: 'Authorities designate safe zones for affected communities.' },
  { n: '04', title: 'Community Check-In',      desc: 'Citizens move to safety and register at safe zones.' },
  { n: '05', title: 'Relief Camp',             desc: 'Relief camps receive displaced individuals and families.' },
  { n: '06', title: 'Camp Needs',              desc: 'Inventory is tracked and shortages are calculated.' },
  { n: '07', title: 'Targeted Donation',       desc: 'Donors respond to verified needs, not general appeals.' },
  { n: '08', title: 'Delivery',                desc: 'Supplies are dispatched and tracked to relief camps.' },
  { n: '09', title: 'Verified Receipt',        desc: 'Officials confirm what was received and log discrepancies.' },
  { n: '10', title: 'Inventory Update',        desc: 'Camp inventory is updated with verified received quantities.' },
  { n: '11', title: 'Shortage Reduction',      desc: 'The shortage is reduced. The cycle repeats as needed.' },
];

export default function About() {
  return (
    <div>
      {/* ── Page header ───────────────────────────── */}
      <section className="hero-panel py-20">
        <div className="section-inner px-6 relative z-10">
          <p className="eyebrow text-gold-400 mb-4">About RAHAT</p>
          <h1 className="serif text-5xl text-white leading-tight max-w-3xl">
            A Connected, Transparent Local Disaster Relief System
          </h1>
          <p className="mt-5 text-lg text-white/75 max-w-2xl leading-8">
            RAHAT is designed to improve how communities coordinate disaster relief at the local level —
            from the first disaster declaration to verified delivery of essential supplies.
          </p>
        </div>
      </section>

      {/* ── 1. Our Motive ─────────────────────────── */}
      <section className="section-gov bg-white border-b border-line" aria-labelledby="motive-heading">
        <div className="section-inner px-6">
          <div className="grid gap-16 lg:grid-cols-2 lg:items-center">
            <div>
              <SectionHeader
                eyebrow="Our Motive"
                title="Relief Should Follow Real Need"
                body="When a disaster occurs, communities need more than information. They need an organized process that connects every step — from the moment a disaster is declared to the moment verified relief reaches the right hands."
                as="h2"
                id="motive-heading"
              />
              <div className="mt-8 rounded-xl bg-navy-50 border border-line p-6">
                <p className="text-sm font-semibold text-navy-900 mb-3 uppercase tracking-wide">The RAHAT Chain</p>
                <div className="flex flex-wrap gap-2 text-sm">
                  {['Disaster', 'Safe Zone', 'Relief Camp', 'Verified Needs', 'Donations', 'Delivery', 'Recovery'].map((step, i, arr) => (
                    <span key={step} className="flex items-center gap-2">
                      <span className="font-medium text-navy-800">{step}</span>
                      {i < arr.length - 1 && <span className="text-teal-600">→</span>}
                    </span>
                  ))}
                </div>
              </div>
            </div>
            <div className="rounded-2xl overflow-hidden shadow-lg border border-line">
              <img
                src="/rahat-motive.jpg"
                alt="Community members receiving organized relief supplies from volunteers"
                className="w-full object-cover"
                style={{ height: 380 }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* ── 2. What RAHAT Does ───────────────────── */}
      <section className="section-gov bg-navy-50 border-b border-line" aria-labelledby="what-heading">
        <div className="section-inner px-6">
          <SectionHeader
            eyebrow="What RAHAT Does"
            title="Capabilities at Every Stage"
            centered
            as="h2"
            id="what-heading"
          />
          <ul className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {capabilities.map((item) => (
              <li key={item} className="card-gov p-4 flex items-start gap-3">
                <IconCheck />
                <span className="text-ink-700 text-sm leading-6">{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ── 3. Why RAHAT ─────────────────────────── */}
      <section className="section-gov bg-white border-b border-line" aria-labelledby="why-heading">
        <div className="section-inner px-6">
          <div className="grid gap-16 lg:grid-cols-2 lg:items-center">
            <div className="order-2 lg:order-1 rounded-2xl overflow-hidden shadow-lg border border-line">
              <img
                src="/rahat-why.jpg"
                alt="Local government officials coordinating disaster response at a planning table"
                className="w-full object-cover"
                style={{ height: 380 }}
              />
            </div>
            <div className="order-1 lg:order-2">
              <SectionHeader
                eyebrow="Why RAHAT?"
                title="The Problems Traditional Relief Coordination Faces"
                as="h2"
                id="why-heading"
              />
              <ul className="mt-8 space-y-4">
                {problems.map((p) => (
                  <li key={p} className="flex items-start gap-3">
                    <span className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-red-100 text-red-700">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-3.5 w-3.5"><path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495ZM10 5a.75.75 0 0 1 .75.75v3.5a.75.75 0 0 1-1.5 0v-3.5A.75.75 0 0 1 10 5Zm0 9a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z" clipRule="evenodd" /></svg>
                    </span>
                    <span className="text-ink-700 leading-6">{p}</span>
                  </li>
                ))}
              </ul>
              <p className="mt-6 text-teal-700 font-medium">
                RAHAT addresses each of these through a connected digital workflow from local disaster response to verified relief delivery.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── 4. Our Vision ────────────────────────── */}
      <section className="section-gov bg-navy-950 text-white border-b border-white/10" aria-labelledby="vision-heading">
        <div className="section-inner px-6">
          <div className="grid gap-16 lg:grid-cols-2 lg:items-center">
            <div>
              <p className="eyebrow text-gold-400 mb-4">Our Vision</p>
              <h2 className="serif text-4xl text-white leading-snug" id="vision-heading">
                A Connected, Transparent<br />Local Disaster-Response Ecosystem
              </h2>
              <blockquote className="mt-8 border-l-4 border-gold-500 pl-6 py-2">
                <p className="text-xl text-white/85 leading-8 font-light italic">
                  "To build a connected and transparent local disaster-response ecosystem where every community
                  can identify danger, move toward safety, access essential relief, and ensure that resources
                  reach the people who need them most."
                </p>
              </blockquote>
              <div className="mt-8 grid grid-cols-2 gap-4">
                {['Local', 'Organized', 'Transparent', 'Data-Driven', 'Community-Centered', 'Need-Based'].map((v) => (
                  <div key={v} className="flex items-center gap-2 text-white/80 text-sm">
                    <span className="h-1.5 w-1.5 rounded-full bg-teal-400 shrink-0" />
                    {v}
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-2xl overflow-hidden shadow-2xl border border-white/10">
              <img
                src="/rahat-vision.jpg"
                alt="Community resilience and recovery — volunteers working together"
                className="w-full object-cover"
                style={{ height: 400 }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* ── 5. How RAHAT Works ───────────────────── */}
      <section className="section-gov bg-navy-50 border-b border-line" aria-labelledby="howitworks-heading">
        <div className="section-inner px-6">
          <SectionHeader
            eyebrow="How RAHAT Works"
            title="The Full 11-Step Relief Journey"
            body="Every feature in RAHAT maps to one step in this journey — from the first disaster report to the final inventory update."
            centered
            as="h2"
            id="howitworks-heading"
          />
          <ol className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {workflowSteps.map((step) => (
              <li key={step.n} className="card-hover p-5 flex gap-4">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-navy-900 text-white font-bold font-mono text-sm">
                  {step.n}
                </span>
                <div>
                  <h3 className="font-semibold text-navy-900 leading-snug mb-1">{step.title}</h3>
                  <p className="text-sm text-ink-700 leading-6">{step.desc}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>
    </div>
  );
}
