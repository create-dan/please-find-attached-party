import { useState } from 'react';
import { ImageOff } from 'lucide-react';

interface ResilientImageProps {
  src: string;
  alt: string;
  className?: string;
  fallbackTitle?: string;
}

export function ResilientImage({
  src,
  alt,
  className = '',
  fallbackTitle,
}: ResilientImageProps) {
  const [hasError, setHasError] = useState(false);

  if (hasError) {
    return (
      <div
        role="img"
        aria-label={alt}
        className={`flex flex-col items-center justify-center bg-gradient-to-br from-[#162032] via-[#0F1726] to-[#0B0F17] p-6 text-center border border-white/10 ${className}`}
      >
        <ImageOff className="h-7 w-7 text-[#38BDF8] mb-3" aria-hidden="true" />
        <p className="font-display text-lg uppercase tracking-wide text-[#F1F5F9]">
          {fallbackTitle || 'Q4 Doomsday Social'}
        </p>
        <p className="mt-1 text-xs text-[#94A3B8] max-w-xs">{alt}</p>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      referrerPolicy="no-referrer"
      onError={() => setHasError(true)}
      className={className}
    />
  );
}
