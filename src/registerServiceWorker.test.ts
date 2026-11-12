import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { registerServiceWorker } from './registerServiceWorker.ts';

describe('registerServiceWorker', () => {
  const originalNavigator = globalThis.navigator;

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    Object.defineProperty(globalThis, 'navigator', {
      value: originalNavigator,
      configurable: true,
      writable: true,
    });
  });

  it('no lanza error en entorno donde navigator o serviceWorker no está disponible', () => {
    expect(() => registerServiceWorker()).not.toThrow();
  });

  it('no registra el service worker si no está en producción', () => {
    const registerMock = vi.fn();
    Object.defineProperty(globalThis, 'navigator', {
      value: {
        ...originalNavigator,
        serviceWorker: {
          register: registerMock,
        },
      },
      configurable: true,
      writable: true,
    });

    registerServiceWorker();
    expect(registerMock).not.toHaveBeenCalled();
  });
});
