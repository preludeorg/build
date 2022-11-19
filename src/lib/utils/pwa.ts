export const isPWA = () =>
  (window.navigator as any).standalone === true ||
  window.matchMedia("(display-mode: standalone)").matches;
