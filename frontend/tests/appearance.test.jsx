import { fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { resolveAppearance } from '../src/features/appearance/domain/theme.js';
import {
  changeAppearance,
  loadAppearance,
} from '../src/features/appearance/application/appearance.js';
import { createBrowserAppearance } from '../src/features/appearance/infrastructure/browser-appearance.js';
import { AppearanceProvider } from '../src/features/appearance/presentation/AppearanceProvider.jsx';
import { ThemeToggle } from '../src/features/appearance/presentation/ThemeToggle.jsx';

afterEach(() => {
  localStorage.clear();
  vi.unstubAllGlobals();
  document.documentElement.removeAttribute('data-theme');
});

describe('aparência MengoData', () => {
  it.each([
    ['system', true, 'dark'],
    ['system', false, 'light'],
    ['dark', false, 'dark'],
    ['light', true, 'light'],
    ['invalid', true, 'dark'],
  ])(
    'resolve preferência %s com sistema %s para %s',
    (preference, systemDark, theme) => {
      expect(resolveAppearance(preference, systemDark).theme).toBe(theme);
    },
  );
  it('carrega o sistema e persiste uma escolha explícita pela porta', () => {
    const gateway = { read: () => null, systemDark: () => true, write: vi.fn() };
    expect(loadAppearance(gateway)).toEqual({ preference: 'system', theme: 'dark' });
    expect(changeAppearance(gateway, 'light')).toEqual({
      preference: 'light',
      theme: 'light',
    });
    expect(gateway.write).toHaveBeenCalledWith('light');
  });
  it('alterna, aplica e restaura o tema persistido numa nova montagem', () => {
    const first = render(
      <AppearanceProvider gateway={createBrowserAppearance()}>
        <ThemeToggle />
      </AppearanceProvider>,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Ativar modo escuro' }));
    expect(document.documentElement.dataset.theme).toBe('dark');
    expect(localStorage.getItem('mengodata-theme')).toBe('dark');
    first.unmount();
    render(
      <AppearanceProvider gateway={createBrowserAppearance()}>
        <ThemeToggle />
      </AppearanceProvider>,
    );
    expect(screen.getByRole('button', { name: 'Ativar modo claro' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    expect(document.documentElement.style.colorScheme).toBe('dark');
  });
  it('acompanha o sistema e mudanças de preferência em outra aba', () => {
    const media = new EventTarget();
    media.matches = true;
    vi.stubGlobal('matchMedia', () => media);
    render(
      <AppearanceProvider gateway={createBrowserAppearance()}>
        <ThemeToggle />
      </AppearanceProvider>,
    );
    expect(document.documentElement.dataset.theme).toBe('dark');
    fireEvent(
      window,
      new StorageEvent('storage', { key: 'mengodata-theme', newValue: 'light' }),
    );
    expect(document.documentElement.dataset.theme).toBe('light');
    fireEvent(
      window,
      new StorageEvent('storage', { key: 'mengodata-theme', newValue: null }),
    );
    media.matches = false;
    fireEvent(media, new Event('change'));
    expect(document.documentElement.dataset.theme).toBe('light');
  });
  it('mantém a escolha em memória quando o armazenamento é bloqueado', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('blocked');
    });
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('blocked');
    });
    const gateway = createBrowserAppearance();
    expect(loadAppearance(gateway).preference).toBe('system');
    changeAppearance(gateway, 'dark');
    expect(loadAppearance(gateway).theme).toBe('dark');
  });
});
