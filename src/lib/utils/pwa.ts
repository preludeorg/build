export const isPWA = () =>
  //@ts-ignore
  window.navigator.standalone === true ||
  window.matchMedia("(display-mode: standalone)").matches;
