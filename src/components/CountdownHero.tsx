import { useEffect, useState } from 'react';
import { Atom, Calendar, X } from 'lucide-react';
import { EVENT_INFO } from '../data/partyData';
import { DoomsdayClock } from './DoomsdayClock';
import { ResilientImage } from './ResilientImage';

interface TimeLeft {
  status: 'upcoming' | 'live' | 'ended';
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

type ModalType = 'excuse' | 'busy' | 'doom' | null;

const THEME_GRADIENT =
  'linear-gradient(to right, rgb(0,119,200) 0%, rgb(14,165,233) 35%, rgb(6,182,212) 65%, rgb(139,92,246) 100%)';

function calculateTimeLeft(): TimeLeft {
  const now = Date.now();
  const start = new Date(EVENT_INFO.targetIso).getTime();
  const end = new Date(EVENT_INFO.endIso).getTime();

  if (now >= start && now <= end) {
    return { status: 'live', days: 0, hours: 0, minutes: 0, seconds: 0 };
  }
  if (now > end) {
    return { status: 'ended', days: 0, hours: 0, minutes: 0, seconds: 0 };
  }

  const diff = start - now;
  return {
    status: 'upcoming',
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  };
}

const DODGE_POSITIONS = [
  { x: -72, y: -44 },
  { x: -120, y: 24 },
  { x: -48, y: -56 },
  { x: -96, y: -36 },
  { x: 0, y: -52 },
];

export function CountdownHero() {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>(() => calculateTimeLeft());
  const [showCalendarRoast, setShowCalendarRoast] = useState(false);
  const [activeModal, setActiveModal] = useState<ModalType>(null);
  const [dodgeIndex, setDodgeIndex] = useState<number | null>(null);
  const [doomClicks, setDoomClicks] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!activeModal) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setActiveModal(null);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [activeModal]);

  const handleDoomClick = () => {
    const next = doomClicks + 1;
    if (next >= 4) {
      setDoomClicks(0);
      setActiveModal('doom');
    } else {
      setDoomClicks(next);
    }
  };

  const handleBusyHover = () => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }
    setDodgeIndex((prev) =>
      prev === null ? 0 : (prev + 1) % DODGE_POSITIONS.length
    );
  };

  const handleBusyClick = () => {
    setDodgeIndex(null);
    setActiveModal('busy');
  };

  const dodgeOffset =
    dodgeIndex !== null ? DODGE_POSITIONS[dodgeIndex] : { x: 0, y: 0 };

  const modalTitle =
    activeModal === 'busy'
      ? EVENT_INFO.busyPopupTitle
      : EVENT_INFO.excusePopupTitle;

  const modalBody =
    activeModal === 'busy'
      ? EVENT_INFO.busyPopupBody
      : EVENT_INFO.excusePopupBody;

  const modalKicker =
    activeModal === 'busy' ? 'Decline Request Denied' : 'AI Excuse Finder';

  return (
    <section
      id="countdown"
      className="relative min-h-[calc(100svh-61px)] flex flex-col justify-end overflow-hidden"
    >
      {/* Full-bleed Doctor Doom backdrop with bottom-weighted contrast scrim */}
      <div aria-hidden="true" className="absolute inset-0">
        <ResilientImage
          src={EVENT_INFO.heroImage}
          alt="Doctor Doom background artwork"
          className="h-full w-full object-cover object-top opacity-95"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0B0F17] via-[#0B0F17]/45 to-transparent" />
      </div>

      {/* Hidden clickable hotspot over Doctor Doom's face/mask (4 clicks) */}
      <button
        type="button"
        onClick={handleDoomClick}
        aria-label="Doctor Doom mask"
        className="absolute left-1/2 -translate-x-1/2 top-2 sm:top-4 z-30 h-24 w-24 sm:h-32 sm:w-28 rounded-full cursor-pointer bg-transparent border-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#38BDF8]"
      />

      <div className="relative z-10 mx-auto w-full max-w-6xl px-6 pt-28 sm:pt-44 pb-8 sm:pb-10">
        {/* Quiet unboxed metadata line */}
        <div className="inline-flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs sm:text-sm font-mono text-[#E2E8F0] drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]">
          <span className="text-[#38BDF8] font-medium">{EVENT_INFO.dateLabel}</span>
          <span aria-hidden="true">·</span>
          <span className="tabular-nums text-[#F1F5F9]">{EVENT_INFO.timeLabel}</span>
        </div>

        {/* Mechanical Split-Flap Doomsday Countdown Centerpiece */}
        <div className="mt-6 sm:mt-8">
          {timeLeft.status === 'upcoming' && (
            <DoomsdayClock
              days={timeLeft.days}
              hours={timeLeft.hours}
              minutes={timeLeft.minutes}
              seconds={timeLeft.seconds}
            />
          )}

          {timeLeft.status === 'live' && (
            <div className="rounded-xl border border-[#0EA5E9]/45 bg-[#121824]/90 p-8 sm:p-12">
              <p className="text-sm font-mono text-[#38BDF8]">
                {EVENT_INFO.timeLabel}
              </p>
              <p className="mt-3 font-display text-5xl sm:text-7xl tracking-tight text-[#F1F5F9]">
                The Party Is Live Right Now.
              </p>
            </div>
          )}

          {timeLeft.status === 'ended' && (
            <div className="rounded-xl border border-white/15 bg-[#121824]/90 p-8 sm:p-12">
              <p className="text-sm font-mono text-[#94A3B8]">
                {EVENT_INFO.dateLabel}
              </p>
              <p className="mt-3 font-display text-5xl sm:text-7xl tracking-tight text-[#F1F5F9]">
                Somehow We Survived Q4 Too.
              </p>
            </div>
          )}
        </div>

        {/* Core Sentence + Actions */}
        <div className="mt-8 sm:mt-10 pt-8 border-t border-white/15 flex flex-col lg:flex-row lg:items-start lg:justify-between gap-8">
          <h1 className="font-display text-3xl sm:text-5xl lg:text-[3.25rem] leading-[1.06] tracking-tight text-[#F1F5F9] max-w-3xl text-balance">
            {EVENT_INFO.headline}
          </h1>

          <div className="flex flex-col items-start lg:items-end shrink-0">
            <div className="flex flex-wrap items-center gap-4">
              <button
                type="button"
                onClick={() => setShowCalendarRoast(true)}
                style={{ background: THEME_GRADIENT }}
                className="inline-flex items-center gap-2 px-5 py-3 text-sm font-semibold rounded-lg text-white hover:brightness-110 transition-all whitespace-nowrap shrink-0 min-h-[44px] shadow-[0_6px_20px_rgba(14,165,233,0.25)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#38BDF8]"
              >
                <Calendar className="h-4 w-4 drop-shadow-sm" aria-hidden="true" />
                <span className="drop-shadow-sm">Add to Calendar</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveModal('excuse')}
                aria-label="Find Excuse"
                title="Find Excuse"
                className="group inline-flex items-center gap-2.5 min-h-[44px] rounded-full pr-1 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#38BDF8]"
              >
                <span
                  style={{ background: THEME_GRADIENT }}
                  className="flex h-11 w-11 items-center justify-center rounded-full text-white shadow-[0_4px_16px_rgba(139,92,246,0.3)] group-hover:brightness-110 transition-all shrink-0"
                >
                  <Atom className="h-5 w-5" aria-hidden="true" />
                </span>
                <span className="text-xs font-medium text-[#94A3B8] group-hover:text-[#F1F5F9] transition-colors whitespace-nowrap shrink-0">
                  Find Excuse
                </span>
              </button>

              <button
                type="button"
                onMouseEnter={handleBusyHover}
                onClick={handleBusyClick}
                style={{
                  transform: `translate3d(${dodgeOffset.x}px, ${dodgeOffset.y}px, 0)`,
                }}
                className="px-3.5 py-2 text-xs font-medium rounded-lg border border-white/15 bg-[#121824]/85 text-[#94A3B8] hover:text-[#F1F5F9] hover:border-[#38BDF8]/50 transition-transform duration-150 ease-out whitespace-nowrap shrink-0 min-h-[40px] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#38BDF8]"
              >
                I&apos;m busy
              </button>
            </div>

            {showCalendarRoast && (
              <p
                role="status"
                className="mt-3 text-sm font-mono text-[#38BDF8] lg:text-right"
              >
                {EVENT_INFO.calendarRoast}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Hidden Doctor Doom Face Popup */}
      {activeModal === 'doom' && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-sm"
          onClick={() => setActiveModal(null)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="doom-modal-title"
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-2xl rounded-xl border border-white/20 bg-[#121824] overflow-hidden shadow-2xl"
          >
            <div
              aria-hidden="true"
              className="h-1 w-full"
              style={{ background: THEME_GRADIENT }}
            />

            <div className="relative aspect-video w-full bg-[#0B0F17]">
              <ResilientImage
                src={EVENT_INFO.doomSecretImage}
                alt="Avengers Doomsday artwork"
                fallbackTitle="DOOM DEMANDS YOUR PRESENCE."
                className="h-full w-full object-cover"
              />
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                aria-label="Close popup"
                className="absolute top-3 right-3 flex h-9 w-9 items-center justify-center rounded-full bg-black/65 text-[#F1F5F9] hover:bg-black/85 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#38BDF8]"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>

            <div className="p-6 sm:p-7 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h2
                  id="doom-modal-title"
                  className="font-display text-2xl sm:text-3xl tracking-wide text-[#F1F5F9]"
                >
                  {EVENT_INFO.doomPopupTitle}
                </h2>
                <p className="mt-1.5 text-sm font-mono text-[#38BDF8]">
                  {EVENT_INFO.doomPopupBody}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setActiveModal(null)}
                style={{ background: THEME_GRADIENT }}
                className="px-5 py-2.5 text-sm font-semibold rounded-lg text-white hover:brightness-110 transition-all whitespace-nowrap shrink-0 min-h-[40px] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#38BDF8]"
              >
                Understood
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Shared Sarcastic Popup Modal (Find Excuse / I'm busy) */}
      {(activeModal === 'excuse' || activeModal === 'busy') && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/75 backdrop-blur-sm"
          onClick={() => setActiveModal(null)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="sarcastic-modal-title"
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md rounded-lg border border-white/15 bg-[#121824] overflow-hidden shadow-2xl"
          >
            <div
              aria-hidden="true"
              className="h-1 w-full"
              style={{ background: THEME_GRADIENT }}
            />
            <div className="p-6 sm:p-8">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-2.5">
                  <span
                    style={{ background: THEME_GRADIENT }}
                    className="flex h-9 w-9 items-center justify-center rounded-full text-white shrink-0"
                  >
                    <Atom className="h-4 w-4" aria-hidden="true" />
                  </span>
                  <p className="text-xs font-mono text-[#38BDF8]">
                    {modalKicker}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  aria-label="Close popup"
                  className="flex h-9 w-9 items-center justify-center rounded-lg text-[#94A3B8] hover:text-[#F1F5F9] hover:bg-white/10 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#38BDF8]"
                >
                  <X className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>

              <h2
                id="sarcastic-modal-title"
                className="mt-5 font-display text-3xl sm:text-4xl tracking-tight text-[#F1F5F9]"
              >
                {modalTitle}
              </h2>
              <p className="mt-3 text-sm text-[#94A3B8] leading-relaxed">
                {modalBody}
              </p>

              <div className="mt-6 flex justify-end">
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  style={{ background: THEME_GRADIENT }}
                  className="px-5 py-2.5 text-sm font-semibold rounded-lg text-white hover:brightness-110 transition-all whitespace-nowrap shrink-0 min-h-[40px] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#38BDF8]"
                >
                  Okay, fine
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
