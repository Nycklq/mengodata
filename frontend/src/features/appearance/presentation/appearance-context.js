import { createContext, useContext } from 'react';

export const AppearanceContext = createContext({
  theme: 'light',
  preference: 'system',
  select: () => {},
});
export const useAppearance = () => useContext(AppearanceContext);
