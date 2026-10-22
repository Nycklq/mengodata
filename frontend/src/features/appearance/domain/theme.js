export const themePreferences = ['system', 'light', 'dark'];

export function resolveAppearance(preference, systemDark = false) {
  const selected = themePreferences.includes(preference) ? preference : 'system';
  return {
    preference: selected,
    theme: selected === 'system' ? (systemDark ? 'dark' : 'light') : selected,
  };
}
