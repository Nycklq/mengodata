export function createBrowserAppearance() {
  const key = 'mengodata-theme';
  let preference;
  return {
    read() {
      if (preference !== undefined) return preference;
      try {
        preference = localStorage.getItem(key) ?? 'system';
      } catch {
        preference = 'system';
      }
      return preference;
    },
    write(value) {
      preference = value;
      try {
        localStorage.setItem(key, value);
      } catch {
        return;
      }
    },
    systemDark: () =>
      window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false,
    apply(theme) {
      document.documentElement.dataset.theme = theme;
      document.documentElement.style.colorScheme = theme;
    },
    subscribe(listener) {
      const query = window.matchMedia?.('(prefers-color-scheme: dark)');
      const storage = (event) => {
        if (event.key === key || event.key === null) {
          preference = event.newValue ?? 'system';
          listener();
        }
      };
      query?.addEventListener('change', listener);
      window.addEventListener('storage', storage);
      return () => {
        query?.removeEventListener('change', listener);
        window.removeEventListener('storage', storage);
      };
    },
  };
}
