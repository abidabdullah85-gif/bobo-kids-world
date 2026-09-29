const store: Record<string, string> = {};
const mockLocalStorage: Storage = {
  getItem: (k: string) => store[k] ?? null,
  setItem: (k: string, v: string) => { store[k] = v; },
  removeItem: (k: string) => { delete store[k]; },
  clear: () => { Object.keys(store).forEach(k => delete store[k]); },
  length: 0,
  key: () => null,
};
export function setupLocalStorageMock() {
  Object.defineProperty(window, "localStorage", { value: mockLocalStorage, writable: true, configurable: true });
  return { store, mockLocalStorage };
}
