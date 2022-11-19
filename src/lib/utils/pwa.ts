export const isPWA = () =>
  (window.navigator as unknown as { standalone?: boolean }).standalone ===
    true || window.matchMedia("(display-mode: standalone)").matches;
