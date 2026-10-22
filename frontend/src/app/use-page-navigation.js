import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export function usePageNavigation() {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    const main =
      document.getElementById('main') ?? document.getElementById('landing-main');
    main?.focus();
    if (!hash) {
      window.scrollTo?.({ top: 0, behavior: 'instant' });
      return;
    }
    let targetId;
    try {
      targetId = decodeURIComponent(hash.slice(1));
    } catch {
      return;
    }
    const navigate = () => {
      const target = document.getElementById(targetId);
      target?.scrollIntoView?.({ block: 'start' });
      return Boolean(target);
    };
    if (navigate()) return;
    const observer = new MutationObserver(() => {
      if (navigate()) observer.disconnect();
    });
    observer.observe(document.getElementById('root') ?? document.body, {
      childList: true,
      subtree: true,
    });
    return () => observer.disconnect();
  }, [pathname, hash]);
}
