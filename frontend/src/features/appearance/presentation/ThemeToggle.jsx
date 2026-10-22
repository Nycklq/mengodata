import { Moon, Sun } from 'lucide-react';
import { useAppearance } from './appearance-context.js';

export function ThemeToggle() {
  const { theme, select } = useAppearance();
  const dark = theme === 'dark';
  const Icon = dark ? Sun : Moon;
  return (
    <button
      type="button"
      className="theme-toggle"
      aria-label={`Ativar modo ${dark ? 'claro' : 'escuro'}`}
      title={`Ativar modo ${dark ? 'claro' : 'escuro'}`}
      aria-pressed={dark}
      onClick={() => select(dark ? 'light' : 'dark')}
    >
      <Icon size={18} aria-hidden="true" />
    </button>
  );
}
