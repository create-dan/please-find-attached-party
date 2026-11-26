import { useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';

interface DoomsdayClockProps {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

interface FlipUnitProps {
  value: number;
  label: string;
  altLabel: string;
  isSeconds?: boolean;
}

const THEME_GRADIENT =
  'linear-gradient(to right, rgb(0,119,200) 0%, rgb(14,165,233) 35%, rgb(6,182,212) 65%, rgb(139,92,246) 100%)';

function FlipDigit({
  digit,
  isSeconds = false,
}: {
  digit: string;
  isSeconds?: boolean;
}) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <div
      className={`relative h-18 w-11 sm:h-24 sm:w-14 md:h-28 md:w-16 lg:h-30 lg:w-20 overflow-hidden rounded-md border ${
        isSeconds
          ? 'border-[#0EA5E9]/55 bg-[#0B0F17]/75'
          : 'border-white/20 bg-[#0B0F17]/70'
      } shadow-[inset_0_2px_12px_rgba(0,0,0,0.8)] select-none`}
    >
      {/* Top half subtle matte sheen */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/[0.07] to-transparent"
      />

      {/* Bottom half darker shadow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-b from-black/35 to-transparent"
      />

      {/* Animated Digit */}
      <div
        className="relative z-10 flex h-full w-full items-center justify-center"
        style={{ perspective: '420px' }}
      >
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.span
            key={digit}
            initial={
              shouldReduceMotion
                ? { opacity: 1 }
                : { rotateX: -72, opacity: 0.25, y: -4 }
            }
            animate={{ rotateX: 0, opacity: 1, y: 0 }}
            exit={
              shouldReduceMotion
                ? { opacity: 0 }
                : { rotateX: 72, opacity: 0, y: 4 }
            }
            transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
            className={`font-mono text-4xl sm:text-5xl md:text-6xl lg:text-[4.5rem] font-medium leading-none tabular-nums ${
              isSeconds ? 'text-[#38BDF8]' : 'text-[#F1F5F9]'
            }`}
          >
            {digit}
          </motion.span>
        </AnimatePresence>
      </div>

      {/* Mechanical horizontal split-flap hinge line */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-1/2 z-20 h-[2px] -translate-y-1/2 bg-black/85 shadow-[0_1px_0_rgba(255,255,255,0.08)]"
      />
      {/* Left & Right hinge pins */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-0 top-1/2 z-30 h-2 w-1 -translate-y-1/2 rounded-r-sm bg-[#253047]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute right-0 top-1/2 z-30 h-2 w-1 -translate-y-1/2 rounded-l-sm bg-[#253047]"
      />
    </div>
  );
}

function FlipUnit({ value, label, altLabel, isSeconds = false }: FlipUnitProps) {
  const [hovered, setHovered] = useState(false);
  const padded = String(value).padStart(2, '0');
  const tens = padded[0];
  const ones = padded[1];

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="flex flex-col items-center"
    >
      <div className="flex items-center gap-1.5 sm:gap-2">
        <FlipDigit digit={tens} isSeconds={isSeconds} />
        <FlipDigit digit={ones} isSeconds={isSeconds} />
      </div>
      <span
        className={`mt-2.5 text-[11px] sm:text-xs font-mono tracking-wide transition-colors duration-150 whitespace-nowrap ${
          hovered || isSeconds ? 'text-[#38BDF8]' : 'text-[#CBD5E1]'
        }`}
      >
        {hovered ? altLabel : label}
      </span>
    </div>
  );
}

export function DoomsdayClock({
  days,
  hours,
  minutes,
  seconds,
}: DoomsdayClockProps) {
  return (
    <div className="relative rounded-xl border border-white/20 bg-[#0B0F17]/55 backdrop-blur-md shadow-[0_24px_80px_rgba(0,0,0,0.65)] overflow-hidden">
      {/* Subtle blue-cyan & violet reactor glows */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-16 -top-16 h-64 w-64 rounded-full bg-[#0077C8]/15 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-12 -bottom-12 h-72 w-72 rounded-full bg-[#8B5CF6]/15 blur-3xl"
      />

      {/* Top Gradient Accent Bar */}
      <div
        aria-hidden="true"
        className="h-1.5 w-full"
        style={{ background: THEME_GRADIENT }}
      />

      <div className="relative z-10 px-5 py-6 sm:px-8 sm:py-8">
        {/* Mechanical Split-Flap Digits Row */}
        <div className="flex flex-wrap items-center justify-center lg:justify-between gap-x-4 gap-y-6 sm:gap-x-5">
          <FlipUnit value={days} label="Days" altLabel="To Survive" />

          <span
            aria-hidden="true"
            className="hidden sm:inline-block pb-7 font-mono text-4xl lg:text-5xl text-white/25 select-none"
          >
            :
          </span>

          <FlipUnit value={hours} label="Hours" altLabel="Of Fake Focus" />

          <span
            aria-hidden="true"
            className="hidden sm:inline-block pb-7 font-mono text-4xl lg:text-5xl text-white/25 select-none"
          >
            :
          </span>

          <FlipUnit value={minutes} label="Minutes" altLabel="Till Drinks" />

          <span
            aria-hidden="true"
            className="hidden sm:inline-block pb-7 font-mono text-4xl lg:text-5xl text-[#38BDF8]/60 select-none"
          >
            :
          </span>

          <FlipUnit
            value={seconds}
            label="Seconds"
            altLabel="Closer to Freedom"
            isSeconds
          />
        </div>
      </div>
    </div>
  );
}
