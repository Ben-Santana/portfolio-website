'use client';

import { useEffect, useRef, useState, useCallback } from 'react';

const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$%&*!?';

interface EncryptedTextProps {
  text: string;
  className?: string;
  as?: 'h1' | 'h3' | 'span';
  triggerOnView?: boolean;
  speed?: number;
}

export default function EncryptedText({
  text,
  className = '',
  as: Tag = 'span',
  triggerOnView = false,
  speed = 30,
}: EncryptedTextProps) {
  const [display, setDisplay] = useState(triggerOnView ? '' : text);
  const [hasTriggered, setHasTriggered] = useState(false);
  const ref = useRef<HTMLElement>(null);

  const animate = useCallback(() => {
    let frame = 0;
    const totalFrames = text.length + 10;

    const interval = setInterval(() => {
      setDisplay(
        text
          .split('')
          .map((char, i) => {
            if (char === ' ') return ' ';
            if (i < frame - 3) return char;
            return CHARS[Math.floor(Math.random() * CHARS.length)];
          })
          .join('')
      );

      frame++;
      if (frame > totalFrames) {
        clearInterval(interval);
        setDisplay(text);
      }
    }, speed);

    return () => clearInterval(interval);
  }, [text, speed]);

  useEffect(() => {
    if (!triggerOnView) {
      return animate();
    }

    const el = ref.current;
    if (!el || hasTriggered) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setHasTriggered(true);
          animate();
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [triggerOnView, hasTriggered, animate]);

  return (
    <Tag ref={ref as React.RefObject<never>} className={className}>
      {display || '\u00A0'}
    </Tag>
  );
}
