/**
 * ProcessTimeline — renders a vertical or horizontal step-by-step process.
 *
 * Props:
 *   steps   — array of { icon: JSX, title: string, desc: string }
 *   variant — 'vertical'|'grid' (default 'vertical')
 */
export default function ProcessTimeline({ steps = [], variant = 'vertical' }) {
  if (variant === 'grid') {
    return (
      <ol className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {steps.map((step, i) => (
          <li key={step.title} className="card-gov p-5 flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-navy-900 text-white text-sm font-bold font-mono shrink-0">
                {String(i + 1).padStart(2, '0')}
              </span>
              {step.icon && (
                <span className="text-teal-700">{step.icon}</span>
              )}
            </div>
            <h3 className="serif text-lg text-navy-900 leading-snug">{step.title}</h3>
            {step.desc && <p className="text-sm text-ink-700 leading-6">{step.desc}</p>}
          </li>
        ))}
      </ol>
    );
  }

  /* Default: vertical connector layout */
  return (
    <ol className="flex flex-col gap-0">
      {steps.map((step, i) => (
        <li key={step.title} className="flex gap-5">
          {/* Left: number + connector line */}
          <div className="flex flex-col items-center">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-navy-900 text-white text-sm font-bold font-mono">
              {String(i + 1).padStart(2, '0')}
            </div>
            {i < steps.length - 1 && (
              <div className="process-connector w-0.5 flex-1 bg-gradient-to-b from-navy-200 to-line mt-1 mb-1" />
            )}
          </div>

          {/* Right: content */}
          <div className={`pb-8 ${i === steps.length - 1 ? 'pb-0' : ''}`}>
            <div className="flex items-center gap-2 mb-1">
              {step.icon && <span className="text-teal-700">{step.icon}</span>}
              <h3 className="serif text-xl text-navy-900">{step.title}</h3>
            </div>
            {step.desc && <p className="text-ink-700 leading-7 max-w-lg">{step.desc}</p>}
          </div>
        </li>
      ))}
    </ol>
  );
}
