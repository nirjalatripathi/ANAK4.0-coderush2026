import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { publicService } from '../services/notificationService';
import RahatLogo from '../components/RahatLogo';
import SectionHeader from '../components/SectionHeader';
import FeatureCard from '../components/FeatureCard';

/* ── Icons (inline SVG for zero extra deps) ──────────────── */
function IconShield() {
  return <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6"><path fillRule="evenodd" d="M12 1.5a5.25 5.25 0 0 0-5.25 5.25v3a3 3 0 0 0-3 3v6.75a3 3 0 0 0 3 3h10.5a3 3 0 0 0 3-3v-6.75a3 3 0 0 0-3-3v-3c0-2.9-2.35-5.25-5.25-5.25Zm3.75 8.25v-3a3.75 3.75 0 1 0-7.5 0v3h7.5Z" clipRule="evenodd" /></svg>;
}
function IconHeart() {
  return <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6"><path d="m11.645 20.91-.007-.003-.022-.012a15.247 15.247 0 0 1-.383-.218 25.18 25.18 0 0 1-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0 1 12 5.052 5.5 5.5 0 0 1 16.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 0 1-4.244 3.17 15.247 15.247 0 0 1-.383.219l-.022.012-.007.004-.003.001a.752.752 0 0 1-.704 0l-.003-.001Z" /></svg>;
}
function IconTarget() {
  return <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6"><path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25Zm-.53 14.03a.75.75 0 0 0 1.06 0l3-3a.75.75 0 1 0-1.06-1.06l-1.72 1.72V8.25a.75.75 0 0 0-1.5 0v5.69l-1.72-1.72a.75.75 0 0 0-1.06 1.06l3 3Z" clipRule="evenodd" /></svg>;
}
function IconAlert() {
  return <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5"><path fillRule="evenodd" d="M9.401 3.003c1.155-2 4.043-2 5.197 0l7.355 12.748c1.154 2-.29 4.5-2.599 4.5H4.645c-2.309 0-3.752-2.5-2.598-4.5L9.4 3.003ZM12 8.25a.75.75 0 0 1 .75.75v3.75a.75.75 0 0 1-1.5 0V9a.75.75 0 0 1 .75-.75Zm0 8.25a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z" clipRule="evenodd" /></svg>;
}
function IconPeople() {
  return <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5"><path d="M4.5 6.375a4.125 4.125 0 1 1 8.25 0 4.125 4.125 0 0 1-8.25 0ZM14.25 8.625a3.375 3.375 0 1 1 6.75 0 3.375 3.375 0 0 1-6.75 0ZM1.5 19.125a7.125 7.125 0 0 1 14.25 0v.003l-.001.119a.75.75 0 0 1-.363.63 13.067 13.067 0 0 1-6.761 1.873c-2.472 0-4.786-.684-6.76-1.873a.75.75 0 0 1-.364-.63l-.001-.122ZM17.25 19.128l-.001.144a2.25 2.25 0 0 1-.233.96 10.088 10.088 0 0 0 5.06-1.01.75.75 0 0 0 .42-.643 4.875 4.875 0 0 0-6.957-4.611 8.586 8.586 0 0 1 1.71 5.157v.003Z" /></svg>;
}
function IconBox() {
  return <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5"><path d="M3.375 4.5C2.339 4.5 1.5 5.34 1.5 6.375V13.5h12V6.375c0-1.036-.84-1.875-1.875-1.875h-8.25ZM13.5 15h-12v2.625c0 1.035.84 1.875 1.875 1.875h.375a3 3 0 1 1 6 0h3a3 3 0 1 1 6 0h.375c1.035 0 1.875-.84 1.875-1.875V15h-9Z"/><path d="M8.25 19.5a1.5 1.5 0 1 0-3 0 1.5 1.5 0 0 0 3 0ZM17.25 19.5a1.5 1.5 0 1 0-3 0 1.5 1.5 0 0 0 3 0Z"/><path d="M17.25 4.5H18a2.25 2.25 0 0 1 2.25 2.25v10.5a2.25 2.25 0 0 1-2.25 2.25h-.024a3 3 0 0 0-5.953 0H12.75V6.75h4.5V4.5Z"/></svg>;
}
function IconCheck() {
  return <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5"><path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12Zm13.36-1.814a.75.75 0 1 0-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 0 0-1.06 1.06l2.25 2.25a.75.75 0 0 0 1.14-.094l3.75-5.25Z" clipRule="evenodd" /></svg>;
}

/* ── Workflow steps ──────────────────────────────── */
const workflowSteps = [
  { num: '01', icon: <IconAlert />, title: 'Disaster Identified',    desc: 'A local disaster is recorded with type, severity, and affected areas.' },
  { num: '02', icon: <IconAlert />, title: 'Level Assessed',          desc: 'Disaster level 1–4 is determined based on scope and severity.' },
  { num: '03', icon: <IconShield />, title: 'Safe Zone Declared',     desc: 'Local authorities designate and activate safe zones for communities.' },
  { num: '04', icon: <IconPeople />, title: 'Citizens Check In',      desc: 'People move to safe zones and relief camps and register their presence.' },
  { num: '05', icon: <IconPeople />, title: 'Relief Camp Active',     desc: 'Relief camps receive displaced individuals and families.' },
  { num: '06', icon: <IconBox />,  title: 'Needs Identified',         desc: 'Camp inventory is tracked; shortages are calculated automatically.' },
  { num: '07', icon: <IconHeart />, title: 'Targeted Donations',      desc: 'Donors see verified shortages and pledge to specific, real needs.' },
  { num: '08', icon: <IconBox />,  title: 'Delivery',                 desc: 'Donations are dispatched and tracked from donor to relief camp.' },
  { num: '09', icon: <IconCheck />, title: 'Verified Receipt',        desc: 'Camp officials verify receipt, including any quantity discrepancies.' },
];

/* ── Sample relief needs preview (clearly demo data) ── */
const sampleNeeds = [
  { camp: 'Camp A — Sindhupalchok', item: 'Blankets',   required: 500,  available: 100, shortage: 400, priority: 'HIGH' },
  { camp: 'Camp B — Rasuwa',        item: 'Water',      required: 1000, available: 900, shortage: 100, priority: 'MEDIUM' },
  { camp: 'Camp C — Dolakha',       item: 'Medicine',   required: 200,  available: 20,  shortage: 180, priority: 'HIGH' },
  { camp: 'Camp D — Kavrepalanchok',item: 'Food Packs', required: 800,  available: 350, shortage: 450, priority: 'HIGH' },
];

const priorityStyle = {
  HIGH:   'bg-red-50 text-red-800 border-red-200',
  MEDIUM: 'bg-amber-50 text-amber-800 border-amber-200',
  LOW:    'bg-slate-50 text-slate-700 border-slate-200',
};

/* ── Donation flow steps ── */
const donationFlow = [
  { icon: <IconTarget />, label: 'Choose Verified Need' },
  { icon: <IconHeart />,  label: 'Pledge Donation' },
  { icon: <IconBox />,    label: 'Delivery in Transit' },
  { icon: <IconCheck />,  label: 'Camp Receives' },
  { icon: <IconCheck />,  label: 'Receipt Verified' },
  { icon: <IconShield />, label: 'Inventory Updated' },
];

/* ── Stat cards ─────────────────────────────────── */
const statConfig = [
  { key: 'activeDisasters',      label: 'Active Disasters',      tone: 'border-l-red-700',     icon: <IconAlert /> },
  { key: 'activeSafeZones',      label: 'Active Safe Zones',     tone: 'border-l-teal-700',    icon: <IconShield /> },
  { key: 'activeReliefCamps',    label: 'Active Relief Camps',   tone: 'border-l-navy-700',    icon: <IconPeople /> },
  { key: 'peopleInReliefCamps',  label: 'People in Camps',       tone: 'border-l-navy-600',    icon: <IconPeople /> },
  { key: 'criticalReliefNeeds',  label: 'Critical Needs',        tone: 'border-l-orange-600',  icon: <IconBox /> },
  { key: 'donationsInTransit',   label: 'Donations in Transit',  tone: 'border-l-amber-500',   icon: <IconBox /> },
];

export default function Home() {
  const [stats, setStats] = useState({
    activeDisasters: 0, activeSafeZones: 0, activeReliefCamps: 0,
    peopleInReliefCamps: 0, criticalReliefNeeds: 0, donationsInTransit: 0,
  });

  useEffect(() => {
    publicService.stats()
      .then(({ data }) => setStats((prev) => ({ ...prev, ...(data.stats || {}) })))
      .catch(() => {});
  }, []);

  return (
    <div>
      {/* ════ 1. HERO ════════════════════════════════════════════ */}
      <section className="hero-panel" aria-label="RAHAT — Coordinating relief where it is needed most">
        <div className="mx-auto grid max-w-7xl gap-12 px-6 py-24 md:py-32 lg:grid-cols-2 lg:items-center relative z-10">
          {/* Left: text */}
          <div>
            <div className="flex items-center gap-3 mb-6">
              <RahatLogo size={52} light />
            </div>
            <p className="eyebrow text-gold-400 mb-4">Local Disaster Relief Coordination</p>
            <h1 className="serif text-5xl leading-tight text-white md:text-6xl">
              Coordinating Relief<br />
              <span className="text-gold-400">Where It Is Needed Most.</span>
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-8 text-white/75">
              RAHAT connects local disaster response with safe zones, relief camps, verified shortage calculations,
              and targeted donations — ensuring resources reach the communities that need them most.
            </p>
            <div className="mt-10 flex flex-wrap gap-4">
              <Link to="/login"    className="btn-gold btn-hero">Sign In</Link>
              <Link to="/register" className="btn-hero border-white/30 bg-transparent text-white hover:bg-white/10" style={{ borderWidth: '1.5px' }}>Create Account</Link>
              <Link to="/relief-needs" className="btn-hero text-white/75 hover:text-white underline underline-offset-4 text-sm flex items-center min-h-[54px]">
                Explore Relief Needs →
              </Link>
            </div>
          </div>

          {/* Right: hero image */}
          <div className="hidden lg:block">
            <div className="rounded-2xl overflow-hidden shadow-2xl border border-white/10">
              <img
                src="/rahat-hero.jpg"
                alt="Disaster relief coordination — volunteers and officials organizing supplies"
                className="w-full h-full object-cover"
                style={{ maxHeight: 420 }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* ════ 2. LIVE STATS STRIP ════════════════════════════════ */}
      <section className="bg-navy-900 py-8 border-b border-white/10" aria-label="Live operation statistics">
        <div className="mx-auto max-w-7xl px-6">
          <p className="eyebrow text-gold-400 mb-5 text-center">Live Operations</p>
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-6">
            {statConfig.map(({ key, label, tone, icon }) => (
              <div key={key} className={`stat-card ${tone} bg-white/5 border-white/10 !bg-transparent text-white`}>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-white/50">{icon}</span>
                  <p className="text-xs font-semibold uppercase tracking-widest text-white/50">{label}</p>
                </div>
                <p className="font-mono text-3xl font-medium text-white">{stats[key] ?? 0}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════ 3. HOW RAHAT WORKS — WORKFLOW ════════════════════ */}
      <section className="section-gov bg-white" aria-labelledby="workflow-heading">
        <div className="section-inner">
          <SectionHeader
            eyebrow="The RAHAT Process"
            title="From Disaster to Verified Relief"
            body="One connected chain: identify the disaster, move people to safety, calculate actual needs, match donations to verified shortages, and confirm delivery."
            as="h2"
            id="workflow-heading"
          />
          <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {workflowSteps.map((step) => (
              <div key={step.num} className="card-gov p-5 flex gap-4 items-start hover:shadow-md transition-shadow">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-navy-900 text-white font-bold font-mono text-sm">
                  {step.num}
                </div>
                <div>
                  <div className="flex items-center gap-1.5 mb-1 text-teal-700">{step.icon}<h3 className="font-semibold text-navy-900 text-base leading-snug">{step.title}</h3></div>
                  <p className="text-sm text-ink-700 leading-6">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════ 4. THREE CORE FEATURES ══════════════════════════ */}
      <section className="section-gov bg-navy-50 border-t border-b border-line" aria-labelledby="features-heading">
        <div className="section-inner">
          <SectionHeader
            eyebrow="What RAHAT Provides"
            title="Three Pillars of Local Relief Coordination"
            centered
            as="h2"
            id="features-heading"
          />
          <div className="mt-12 grid gap-8 md:grid-cols-3">
            <FeatureCard
              accent="teal"
              to="/safe-zones"
              icon={<IconShield />}
              title="Safe Zones"
              body="Local authorities declare safe zones based on disaster severity. Citizens can find the nearest open zone with available capacity and get directions."
            >
              <Link to="/safe-zones" className="mt-2 text-sm font-semibold text-teal-700 no-underline hover:underline">
                View Safe Zones →
              </Link>
            </FeatureCard>
            <FeatureCard
              accent="navy"
              to="/relief-needs"
              icon={<IconBox />}
              title="Relief Needs"
              body="Relief requirements are calculated from real camp inventory — projected shortages, not estimates. Donors respond to verified, specific needs."
            >
              <Link to="/relief-needs" className="mt-2 text-sm font-semibold text-navy-700 no-underline hover:underline">
                See Relief Needs →
              </Link>
            </FeatureCard>
            <FeatureCard
              accent="gold"
              to="/donations"
              icon={<IconHeart />}
              title="Targeted Donations"
              body="Donors contribute to specific, verified needs instead of generic funds. Every donation is tracked from pledge through delivery to verified receipt."
            >
              <Link to="/donations" className="mt-2 text-sm font-semibold text-gold-600 no-underline hover:underline">
                Donate Now →
              </Link>
            </FeatureCard>
          </div>
        </div>
      </section>

      {/* ════ 5. RELIEF NEEDS PREVIEW ══════════════════════════ */}
      <section className="section-gov bg-white" aria-labelledby="needs-preview-heading">
        <div className="section-inner">
          <div className="lg:grid lg:grid-cols-3 lg:gap-16 lg:items-start">
            <div className="lg:col-span-1 mb-10 lg:mb-0">
              <SectionHeader
                eyebrow="Relief Where It Is Needed"
                title="Verified Camp Shortages"
                body="RAHAT connects real camp inventory with verified shortages so relief can be directed toward the supplies communities actually need."
                as="h2"
                id="needs-preview-heading"
              />
              <div className="mt-8 flex flex-col gap-3">
                <Link to="/relief-needs" className="btn-primary">View All Relief Needs</Link>
                <Link to="/donations"    className="btn-outline">Support a Need</Link>
              </div>
            </div>
            <div className="lg:col-span-2">
              <div className="rounded-xl border border-line overflow-hidden shadow-sm">
                {/* Note about demo data */}
                <div className="bg-amber-50 border-b border-amber-100 px-4 py-2.5 flex items-center gap-2 text-xs text-amber-800">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4 shrink-0"><path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495ZM10 5a.75.75 0 0 1 .75.75v3.5a.75.75 0 0 1-1.5 0v-3.5A.75.75 0 0 1 10 5Zm0 9a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z" clipRule="evenodd" /></svg>
                  <span><strong>Sample data for illustration.</strong> Live verified needs are shown on the Relief Needs page.</span>
                </div>
                <div className="table-wrap overflow-x-auto">
                  <table className="table-gov">
                    <thead>
                      <tr>
                        <th>Camp</th>
                        <th>Item</th>
                        <th className="text-right">Required</th>
                        <th className="text-right">Available</th>
                        <th className="text-right">Shortage</th>
                        <th>Priority</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sampleNeeds.map((n) => (
                        <tr key={`${n.camp}-${n.item}`}>
                          <td className="font-medium text-navy-900 max-w-[180px]">{n.camp}</td>
                          <td className="text-ink-700">{n.item}</td>
                          <td className="text-right font-mono">{n.required.toLocaleString()}</td>
                          <td className="text-right font-mono text-ink-500">{n.available.toLocaleString()}</td>
                          <td className="text-right font-mono font-semibold text-red-700">{n.shortage.toLocaleString()}</td>
                          <td>
                            <span className={`inline-flex items-center border px-2 py-0.5 text-xs font-semibold tracking-wide rounded-full ${priorityStyle[n.priority] || ''}`}>
                              {n.priority}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ════ 6. DONATION SECTION ══════════════════════════════ */}
      <section className="section-gov bg-navy-950 text-white relative overflow-hidden" aria-labelledby="donation-heading">
        <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse at 30% 50%, rgba(15,118,110,0.15) 0%, transparent 60%)' }} />
        <div className="section-inner relative z-10">
          <div className="lg:grid lg:grid-cols-2 lg:gap-16 lg:items-center">
            {/* Left: text */}
            <div>
              <p className="eyebrow text-gold-400 mb-4">Make Every Donation Count</p>
              <h2 className="serif text-4xl text-white leading-snug" id="donation-heading">
                See what is needed.<br />
                <span className="text-gold-400">Give what matters.</span>
              </h2>
              <p className="mt-5 text-lg text-white/70 leading-8 max-w-lg">
                See verified relief needs and help deliver essential supplies to communities where shortages are highest.
                Every donation in RAHAT is matched to a specific, calculated need.
              </p>
              <div className="mt-8 flex flex-wrap gap-4">
                <Link to="/relief-needs" className="btn-gold btn-hero">View Current Needs</Link>
                <Link to="/donations"    className="btn-hero bg-white/10 text-white border-white/20 hover:bg-white/20" style={{ borderWidth: '1.5px' }}>How Donations Work</Link>
              </div>
            </div>

            {/* Right: donation flow */}
            <div className="mt-12 lg:mt-0">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-8">
                <h3 className="serif text-xl text-white mb-6">How a Donation Works</h3>
                <ol className="space-y-0">
                  {donationFlow.map((step, i) => (
                    <li key={step.label} className="flex items-stretch gap-4">
                      <div className="flex flex-col items-center">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-teal-700 text-white">
                          {step.icon}
                        </div>
                        {i < donationFlow.length - 1 && (
                          <div className="w-0.5 flex-1 bg-white/15 mt-1 mb-1 min-h-[1.5rem]" />
                        )}
                      </div>
                      <p className={`font-medium pb-4 ${i < donationFlow.length - 1 ? 'text-white/80' : 'text-gold-400'} flex items-center`}>
                        {step.label}
                      </p>
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
