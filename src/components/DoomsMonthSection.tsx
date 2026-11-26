import { ExternalLink, Trophy } from 'lucide-react';
import { DOOMS_MONTH } from '../data/partyData';
import { DoomPointsLeaderboard } from './DoomPointsLeaderboard';
import { ResilientImage } from './ResilientImage';

const THEME_GRADIENT =
  'linear-gradient(to right, rgb(0,119,200) 0%, rgb(14,165,233) 35%, rgb(6,182,212) 65%, rgb(139,92,246) 100%)';

function getDoomsMonthStatus(): string {
  const now = Date.now();
  const start = new Date(DOOMS_MONTH.startIso).getTime();
  const end = new Date(DOOMS_MONTH.endIso).getTime();
  const dayMs = 1000 * 60 * 60 * 24;

  if (now < start) {
    return 'Starts Nov 25 · 23 Days of Chaos';
  }
  if (now > end) {
    return 'Ended Dec 17 · Winner Crowned';
  }

  const daysRemaining = Math.max(1, Math.ceil((end - now) / dayMs));
  return `${daysRemaining} ${daysRemaining === 1 ? 'Day' : 'Days'} Left Until Dec 17`;
}

export function DoomsMonthSection() {
  const statusLabel = getDoomsMonthStatus();

  return (
    <section
      id="dooms-month"
      className="border-t border-white/10 bg-[#0B0F17] py-16 sm:py-24"
    >
      <div className="mx-auto max-w-6xl px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-stretch">
          {/* Left: Dooms Month Details & Rules */}
          <div className="lg:col-span-7 flex flex-col justify-between py-1">
            <div>
              <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs sm:text-sm font-mono text-[#94A3B8]">
                <span className="text-[#38BDF8] font-medium">{DOOMS_MONTH.dateRange}</span>
                <span aria-hidden="true">·</span>
                <span className="tabular-nums text-[#F1F5F9]">{statusLabel}</span>
              </div>

              <h2 className="mt-4 font-display text-4xl sm:text-5xl lg:text-6xl leading-[1.04] tracking-tight text-[#F1F5F9] text-balance">
                {DOOMS_MONTH.headline}
              </h2>

              <p className="mt-4 text-base text-[#94A3B8] leading-relaxed max-w-2xl">
                {DOOMS_MONTH.description}
              </p>
            </div>

            <dl className="mt-10 divide-y divide-white/10 border-t border-b border-white/10 text-sm">
              <div className="py-4 grid grid-cols-1 sm:grid-cols-12 gap-2 sm:gap-4">
                <dt className="sm:col-span-4 font-mono text-xs text-[#38BDF8]">
                  Duration
                </dt>
                <dd className="sm:col-span-8 text-[#F1F5F9] tabular-nums">
                  November 25, 2026 – December 17, 2026
                </dd>
              </div>

              <div className="py-4 grid grid-cols-1 sm:grid-cols-12 gap-2 sm:gap-4">
                <dt className="sm:col-span-4 font-mono text-xs text-[#38BDF8]">
                  Winning Rule
                </dt>
                <dd className="sm:col-span-8 text-[#F1F5F9]">
                  Whoever finishes with the most Doom Points on Dec 17 wins the gift.
                </dd>
              </div>

              <div className="py-4 grid grid-cols-1 sm:grid-cols-12 gap-2 sm:gap-4">
                <dt className="sm:col-span-4 font-mono text-xs text-[#38BDF8]">
                  Second Place
                </dt>
                <dd className="sm:col-span-8 text-[#94A3B8]">
                  Nothing. Doom does not reward runners-up.
                </dd>
              </div>
            </dl>
          </div>

          {/* Right: Amazon Prize Card */}
          <div className="lg:col-span-5">
            <div className="h-full rounded-xl border border-white/15 bg-[#121824] overflow-hidden flex flex-col justify-between shadow-[0_20px_60px_rgba(0,0,0,0.5)]">
              <div
                aria-hidden="true"
                className="h-1.5 w-full shrink-0"
                style={{ background: THEME_GRADIENT }}
              />

              <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between gap-5">
                <div className="relative overflow-hidden rounded-lg border border-white/10 bg-white/95 aspect-[4/5] max-h-[420px] flex items-center justify-center p-4">
                  <ResilientImage
                    src={DOOMS_MONTH.prizeImage}
                    alt="Official Dooms Month winner gift"
                    fallbackTitle={DOOMS_MONTH.prizeTitle}
                    className="h-full w-full object-contain"
                  />
                </div>

                <div className="flex flex-col gap-4 pt-2 border-t border-white/10">
                  <div>
                    <div className="flex items-center gap-2 text-xs font-mono text-[#38BDF8]">
                      <Trophy className="h-3.5 w-3.5" aria-hidden="true" />
                      <span>{DOOMS_MONTH.prizeSubtitle}</span>
                    </div>
                    <h3 className="mt-1.5 font-display text-2xl tracking-tight text-[#F1F5F9]">
                      {DOOMS_MONTH.prizeTitle}
                    </h3>
                  </div>

                  <a
                    href={DOOMS_MONTH.prizeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ background: THEME_GRADIENT }}
                    className="inline-flex items-center justify-center gap-2 px-5 py-3 text-sm font-semibold rounded-lg text-white hover:brightness-110 transition-all whitespace-nowrap shrink-0 min-h-[44px] shadow-[0_6px_20px_rgba(14,165,233,0.2)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#38BDF8]"
                  >
                    <span>View Gift on Amazon</span>
                    <ExternalLink className="h-4 w-4" aria-hidden="true" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        <DoomPointsLeaderboard />
      </div>
    </section>
  );
}
