import { ExternalLink, MapPin } from 'lucide-react';
import { VENUE_AND_PLAN } from '../data/partyData';
import { ResilientImage } from './ResilientImage';

const THEME_GRADIENT =
  'linear-gradient(to right, rgb(0,119,200) 0%, rgb(14,165,233) 35%, rgb(6,182,212) 65%, rgb(139,92,246) 100%)';

export function VenueAndPlanSection() {
  return (
    <section
      id="venue"
      className="border-t border-white/10 bg-[#0B0F17] py-16 sm:py-24"
    >
      <div className="mx-auto max-w-6xl px-6 grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-stretch">
        {/* Left: Venue Card with Photo & Google Maps Link */}
        <div className="lg:col-span-5">
          <div className="h-full rounded-xl border border-white/15 bg-[#121824] overflow-hidden flex flex-col justify-between shadow-[0_20px_60px_rgba(0,0,0,0.45)]">
            <div
              aria-hidden="true"
              className="h-1.5 w-full shrink-0"
              style={{ background: THEME_GRADIENT }}
            />

            <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between gap-5">
              <div className="overflow-hidden rounded-lg border border-white/10 bg-[#0B0F17] aspect-[3/2]">
                <ResilientImage
                  src={VENUE_AND_PLAN.venueImage}
                  alt="The Game Palacio venue"
                  fallbackTitle={VENUE_AND_PLAN.venueName}
                  className="h-full w-full object-cover"
                />
              </div>

              <div className="flex flex-col gap-4 pt-2 border-t border-white/10">
                <div>
                  <div className="flex items-center gap-2 text-xs font-mono text-[#38BDF8]">
                    <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
                    <span>Party Location · Nov 30, 2026</span>
                  </div>
                  <h2 className="mt-1.5 font-display text-3xl tracking-tight text-[#F1F5F9]">
                    {VENUE_AND_PLAN.venueName}
                  </h2>
                  <p className="mt-1 text-sm text-[#94A3B8]">
                    {VENUE_AND_PLAN.venueArea}
                  </p>
                </div>

                <a
                  href={VENUE_AND_PLAN.mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ background: THEME_GRADIENT }}
                  className="inline-flex items-center justify-center gap-2 px-5 py-3 text-sm font-semibold rounded-lg text-white hover:brightness-110 transition-all whitespace-nowrap shrink-0 min-h-[44px] shadow-[0_6px_20px_rgba(14,165,233,0.2)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#38BDF8]"
                >
                  <span>Open in Google Maps</span>
                  <ExternalLink className="h-4 w-4" aria-hidden="true" />
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Evening Plan */}
        <div className="lg:col-span-7 flex flex-col justify-between py-1">
          <div>
            <p className="text-xs sm:text-sm font-mono text-[#38BDF8]">
              Nov 30 Itinerary · 3:45 PM Onwards
            </p>
            <h2 className="mt-3 font-display text-4xl sm:text-5xl leading-[1.04] tracking-tight text-[#F1F5F9] text-balance">
              The Evening Plan
            </h2>
            <p className="mt-3 text-base text-[#94A3B8] leading-relaxed max-w-xl">
              Leave office around 3:45 PM, bowl for an hour, and finish with sushi and
              dinner.
            </p>
          </div>

          <div className="mt-8 divide-y divide-white/10 border-t border-b border-white/10">
            {VENUE_AND_PLAN.steps.map((step) => (
              <article
                key={step.id}
                className="py-5 grid grid-cols-1 sm:grid-cols-12 gap-2 sm:gap-6 items-baseline"
              >
                <p className="sm:col-span-4 font-mono text-sm sm:text-base font-medium tabular-nums text-[#38BDF8] whitespace-nowrap">
                  {step.time}
                </p>
                <div className="sm:col-span-8">
                  <h3 className="text-base sm:text-lg font-semibold text-[#F1F5F9]">
                    {step.title}
                  </h3>
                  <p className="mt-1 text-sm text-[#94A3B8] leading-relaxed">
                    {step.detail}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
