import { DOOM_RULES } from '../data/partyData';

const THEME_GRADIENT =
  'linear-gradient(to right, rgb(0,119,200) 0%, rgb(14,165,233) 35%, rgb(6,182,212) 65%, rgb(139,92,246) 100%)';

export function DoomRulesSection() {
  return (
    <section
      id="rules"
      className="border-t border-white/10 bg-[#0B0F17] py-16 sm:py-24"
    >
      <div className="mx-auto max-w-6xl px-6">
        {/* Section Header */}
        <div className="max-w-3xl">
          <p className="text-xs sm:text-sm font-mono text-[#38BDF8]">
            {DOOM_RULES.title} · Scoring Guide
          </p>
          <h2 className="mt-3 font-display text-4xl sm:text-5xl leading-[1.06] tracking-tight text-[#F1F5F9] text-balance">
            {DOOM_RULES.subtitle}
          </h2>
          <p className="mt-3 text-base text-[#94A3B8] leading-relaxed">
            {DOOM_RULES.rangeLine}
          </p>
        </div>

        {/* Golden Rule Callout */}
        <div className="mt-8 rounded-xl border border-[#0EA5E9]/35 bg-[#121824] p-5 sm:p-6">
          <p className="text-xs font-mono text-[#38BDF8]">Golden Rule</p>
          <p className="mt-1.5 text-base sm:text-lg font-medium text-[#F1F5F9]">
            {DOOM_RULES.goldenRule}
          </p>
        </div>

        {/* Scoring Tiers List */}
        <div className="mt-10 divide-y divide-white/10 border-t border-b border-white/10">
          {DOOM_RULES.tiers.map((tier) => {
            const pointColor =
              tier.tone === 'penalty'
                ? 'text-rose-400'
                : tier.tone === 'legendary'
                  ? 'text-[#A78BFA]'
                  : 'text-[#38BDF8]';

            return (
              <article
                key={tier.id}
                className="py-6 sm:py-7 grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-8 items-start"
              >
                {/* Points + Tier Name */}
                <div className="md:col-span-4 flex items-baseline gap-4">
                  <span
                    className={`font-mono text-2xl sm:text-3xl font-medium tabular-nums shrink-0 w-12 ${pointColor}`}
                  >
                    {tier.points}
                  </span>
                  <div>
                    <h3 className="font-display text-2xl tracking-tight text-[#F1F5F9]">
                      {tier.label}
                    </h3>
                    <p className="mt-1 text-sm text-[#94A3B8]">
                      {tier.summary}
                    </p>
                  </div>
                </div>

                {/* Qualifying Examples */}
                <div className="md:col-span-8">
                  <ul className="flex flex-wrap items-center gap-x-2.5 gap-y-2 text-sm text-[#CBD5E1] leading-relaxed">
                    {tier.examples.map((example, idx) => (
                      <li key={example} className="inline-flex items-center gap-2.5">
                        {idx > 0 && (
                          <span aria-hidden="true" className="text-[#475569]">
                            ·
                          </span>
                        )}
                        <span>{example}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </article>
            );
          })}
        </div>

        {/* One Last Rule Closing Note */}
        <div className="mt-10 rounded-xl border border-white/15 bg-[#121824] overflow-hidden">
          <div
            aria-hidden="true"
            className="h-1 w-full"
            style={{ background: THEME_GRADIENT }}
          />
          <div className="p-6 sm:p-8 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            <div className="lg:col-span-4">
              <p className="text-xs font-mono text-[#38BDF8]">
                Final Word
              </p>
              <h3 className="mt-1.5 font-display text-2xl sm:text-3xl tracking-tight text-[#F1F5F9]">
                {DOOM_RULES.closingTitle}
              </h3>
            </div>
            <div className="lg:col-span-8 space-y-3 text-sm sm:text-base leading-relaxed">
              <p className="text-[#F1F5F9] font-medium">
                {DOOM_RULES.closingBody}
              </p>
              <p className="text-[#94A3B8]">{DOOM_RULES.closingMission}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
