'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import Image from 'next/image';

const CanvasScrollSequence = dynamic(
  () => import('./canvas-scroll-sequence').then((mod) => mod.CanvasScrollSequence),
  {
    ssr: false,
    loading: () => <CanvasScrollFallback />,
  }
);

function CanvasScrollFallback() {
  return (
    <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-muted">
      <Image
        src="/images/hero-mono.png"
        alt="Toninho Caffè — Frame di anteprima"
        fill
        className="object-cover"
        priority
      />
    </div>
  );
}

type CanvasScrollSlotProps = {
  posterImage?: string;
  posterAlt?: string;
};

export function CanvasScrollSlot({
  posterImage = '/images/hero-mono.png',
  posterAlt = 'Toninho Caffè — Frame di anteprima',
}: CanvasScrollSlotProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return (
      <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-muted">
        <Image
          src={posterImage || '/placeholder.svg'}
          alt={posterAlt}
          fill
          className="object-cover"
          priority
        />
      </div>
    );
  }

  return <CanvasScrollSequence />;
}
