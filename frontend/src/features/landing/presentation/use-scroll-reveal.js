import { useEffect } from 'react';

export function useScrollReveal(root) {
  useEffect(() => {
    const elements = [...(root.current?.querySelectorAll('[data-reveal]') ?? [])];
    const motion = window.matchMedia?.('(prefers-reduced-motion: reduce)');
    const showAll = () => {
      for (const element of elements) element.dataset.reveal = 'shown';
    };
    if (motion?.matches || typeof window.IntersectionObserver !== 'function') return;
    let observer;
    try {
      observer = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (!entry.isIntersecting) continue;
            entry.target.dataset.reveal = 'shown';
            observer.unobserve(entry.target);
          }
        },
        { rootMargin: '0px 0px -32px 0px', threshold: 0.08 },
      );
      for (const element of elements) {
        if (element.getBoundingClientRect().top < window.innerHeight * 0.96) continue;
        observer.observe(element);
        element.dataset.reveal = 'pending';
      }
    } catch {
      observer?.disconnect();
      showAll();
      return;
    }
    const reduceMotion = (event) => {
      if (!event.matches) return;
      observer.disconnect();
      showAll();
    };
    motion?.addEventListener?.('change', reduceMotion);
    return () => {
      observer.disconnect();
      motion?.removeEventListener?.('change', reduceMotion);
      showAll();
    };
  }, [root]);
}
