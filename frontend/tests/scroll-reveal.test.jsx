import { useRef } from 'react';
import { render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useScrollReveal } from '../src/features/landing/presentation/use-scroll-reveal.js';

function Scene() {
  const root = useRef(null);
  useScrollReveal(root);
  return (
    <section ref={root}>
      <h1 data-reveal="">Já visível</h1>
      <p data-reveal="" data-position="below">
        Próxima leitura
      </p>
      <a data-reveal="" data-position="below" href="/dashboard">
        Explorar
      </a>
    </section>
  );
}

describe('revelação progressiva da landing', () => {
  let observer;
  let intersect;
  let changeMotion;
  let media;
  let createObserver;
  beforeEach(() => {
    observer = { observe: vi.fn(), unobserve: vi.fn(), disconnect: vi.fn() };
    createObserver = vi.fn(function (callback) {
      intersect = callback;
      return observer;
    });
    media = {
      matches: false,
      addEventListener: vi.fn((event, callback) => {
        changeMotion = callback;
      }),
      removeEventListener: vi.fn(),
    };
    vi.stubGlobal('IntersectionObserver', createObserver);
    vi.stubGlobal(
      'matchMedia',
      vi.fn(() => media),
    );
    vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(
      function () {
        return { top: this.dataset.position === 'below' ? 1800 : 30 };
      },
    );
  });
  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it('revela ao entrar na viewport uma vez e mantém o conteúdo inicial visível', () => {
    const { unmount } = render(<Scene />);
    const heading = screen.getByRole('heading');
    const next = screen.getByText('Próxima leitura');
    expect(heading).toHaveAttribute('data-reveal', '');
    expect(next).toHaveAttribute('data-reveal', 'pending');
    expect(observer.observe).not.toHaveBeenCalledWith(heading);
    intersect([{ target: next, isIntersecting: false }]);
    expect(next).toHaveAttribute('data-reveal', 'pending');
    intersect([{ target: next, isIntersecting: true }]);
    expect(next).toHaveAttribute('data-reveal', 'shown');
    expect(observer.unobserve).toHaveBeenCalledWith(next);
    intersect([{ target: next, isIntersecting: false }]);
    expect(next).toHaveAttribute('data-reveal', 'shown');
    unmount();
    expect(observer.disconnect).toHaveBeenCalledOnce();
    expect(media.removeEventListener).toHaveBeenCalledWith('change', changeMotion);
  });

  it('mantém o conteúdo disponível sem IntersectionObserver', () => {
    vi.stubGlobal('IntersectionObserver', undefined);
    const { container } = render(<Scene />);
    expect(container.querySelector('[data-reveal="pending"]')).toBeNull();
    expect(screen.getByRole('link', { name: 'Explorar' })).toHaveAttribute(
      'href',
      '/dashboard',
    );
  });

  it('não inicia movimento quando a preferência é reduzir animações', () => {
    media.matches = true;
    const { container } = render(<Scene />);
    expect(createObserver).not.toHaveBeenCalled();
    expect(container.querySelector('[data-reveal="pending"]')).toBeNull();
  });

  it('mostra imediatamente os elementos pendentes ao reduzir movimento', () => {
    const { container } = render(<Scene />);
    expect(container.querySelectorAll('[data-reveal="pending"]')).toHaveLength(2);
    changeMotion({ matches: true });
    expect(container.querySelector('[data-reveal="pending"]')).toBeNull();
    expect(observer.disconnect).toHaveBeenCalledOnce();
  });

  it('recupera conteúdo visível se o observador falhar durante a configuração', () => {
    observer.observe
      .mockImplementationOnce(() => {})
      .mockImplementationOnce(() => {
        throw new Error('observer-failed');
      });
    const { container } = render(<Scene />);
    expect(container.querySelector('[data-reveal="pending"]')).toBeNull();
    expect(observer.disconnect).toHaveBeenCalledOnce();
  });
});
