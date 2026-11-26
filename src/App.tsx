import { CountdownHero } from './components/CountdownHero';
import { DoomRulesSection } from './components/DoomRulesSection';
import { DoomsMonthSection } from './components/DoomsMonthSection';
import { ErrorBoundary } from './components/ErrorBoundary';
import { VenueAndPlanSection } from './components/VenueAndPlanSection';
import { EVENT_INFO } from './data/partyData';

export default function App() {
  return (
    <ErrorBoundary>
      <div id="top" className="min-h-screen bg-[#0B0F17] text-[#F1F5F9] flex flex-col">
        <header className="sticky top-0 z-40 border-b border-white/10 bg-[#0B0F17]/95 backdrop-blur-sm">
          <div className="mx-auto max-w-6xl px-6 py-3.5 flex items-center justify-between gap-8">
            <a
              href="#top"
              className="font-display text-xl tracking-tight text-[#F1F5F9] whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#38BDF8]"
            >
              {EVENT_INFO.title}
            </a>

            <nav
              aria-label="Primary navigation"
              className="flex items-center gap-5 sm:gap-6 text-xs sm:text-sm font-medium text-[#94A3B8]"
            >
              <a
                href="#countdown"
                className="hover:text-[#F1F5F9] hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
              >
                Countdown
              </a>
              <a
                href="#venue"
                className="hover:text-[#F1F5F9] hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
              >
                Venue &amp; Plan
              </a>
              <a
                href="#dooms-month"
                className="hover:text-[#F1F5F9] hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
              >
                Dooms Month
              </a>
              <a
                href="#rules"
                className="hover:text-[#F1F5F9] hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
              >
                Rules
              </a>
            </nav>

            <p className="hidden md:block text-xs font-mono tabular-nums text-[#94A3B8] whitespace-nowrap shrink-0">
              Nov 30, 2026 · 4:00 PM – 10:00 PM
            </p>
          </div>
        </header>

        <main className="flex-1 flex flex-col">
          <CountdownHero />
          <VenueAndPlanSection />
          <DoomsMonthSection />
          <DoomRulesSection />
        </main>
      </div>
    </ErrorBoundary>
  );
}
