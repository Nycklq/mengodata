import { useEffect, useLayoutEffect, useState } from 'react';
import { changeAppearance, loadAppearance } from '../application/appearance.js';
import { AppearanceContext } from './appearance-context.js';

export function AppearanceProvider({ gateway, children }) {
  const [appearance, setAppearance] = useState(() => loadAppearance(gateway));
  useLayoutEffect(() => gateway.apply(appearance.theme), [gateway, appearance.theme]);
  useEffect(
    () => gateway.subscribe(() => setAppearance(loadAppearance(gateway))),
    [gateway],
  );
  const select = (preference) => setAppearance(changeAppearance(gateway, preference));
  return (
    <AppearanceContext.Provider value={{ ...appearance, select }}>
      {children}
    </AppearanceContext.Provider>
  );
}
