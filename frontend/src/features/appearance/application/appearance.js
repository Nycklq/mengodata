import { resolveAppearance } from '../domain/theme.js';

export function loadAppearance(gateway) {
  return resolveAppearance(gateway.read(), gateway.systemDark());
}

export function changeAppearance(gateway, preference) {
  const appearance = resolveAppearance(preference, gateway.systemDark());
  gateway.write(appearance.preference);
  return appearance;
}
