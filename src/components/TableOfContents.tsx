'use client';

import { useEffect, useState, useRef, useCallback } from 'react';

interface TocItem {
  id: string;
  text: string;
  level: number;
}

export default function TableOfContents() {
  const [headings, setHeadings] = useState<TocItem[]>([]);
  const [activeId, setActiveId] = useState('');
  const isClickScrolling = useRef(false);
  const clickTimeoutRef = useRef<NodeJS.Timeout>(undefined);

  useEffect(() => {
    const article = document.querySelector('article');
    if (!article) return;

    const elements = article.querySelectorAll('h2, h3');
    const items: TocItem[] = Array.from(elements).map((el) => {
      if (!el.id) {
        el.id = el.textContent
          ?.toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)/g, '') || '';
      }
      return {
        id: el.id,
        text: el.textContent || '',
        level: el.tagName === 'H2' ? 2 : 3,
      };
    });
    setHeadings(items);
  }, []);

  const updateActiveFromScroll = useCallback(() => {
    if (isClickScrolling.current || headings.length === 0) return;

    let current = headings[0].id;
    for (const h of headings) {
      const el = document.getElementById(h.id);
      if (el) {
        const top = el.getBoundingClientRect().top;
        if (top <= 100) {
          current = h.id;
        } else {
          break;
        }
      }
    }
    setActiveId(current);
  }, [headings]);

  useEffect(() => {
    if (headings.length === 0) return;

    updateActiveFromScroll();
    window.addEventListener('scroll', updateActiveFromScroll, { passive: true });
    return () => window.removeEventListener('scroll', updateActiveFromScroll);
  }, [headings, updateActiveFromScroll]);

  const handleClick = (id: string) => {
    isClickScrolling.current = true;
    setActiveId(id);

    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });

    clearTimeout(clickTimeoutRef.current);
    clickTimeoutRef.current = setTimeout(() => {
      isClickScrolling.current = false;
    }, 800);
  };

  if (headings.length === 0) return null;

  return (
    <nav className="hidden xl:block sticky top-24 max-h-[calc(100vh-8rem)] overflow-y-auto">
      <ul className="space-y-2 text-sm border-l border-neutral-200 dark:border-neutral-700">
        {headings.map((h) => (
          <li key={h.id}>
            <a
              href={`#${h.id}`}
              onClick={(e) => {
                e.preventDefault();
                handleClick(h.id);
              }}
              className={`block py-1 -ml-px border-l-2 transition-all duration-300 ${
                h.level === 3 ? 'pl-6' : 'pl-4'
              } ${
                activeId === h.id
                  ? 'border-neutral-900 dark:border-white text-neutral-900 dark:text-white'
                  : 'border-transparent text-neutral-400 dark:text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300'
              }`}
            >
              {h.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
