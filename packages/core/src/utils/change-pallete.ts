export function changePallete(app: "build" | "detect" | "welcome") {
  const root = document.querySelector<HTMLElement>(':root');
  if (app === "welcome") {
    root?.style.setProperty("--color-border", "var(--color-detail-light)")
  }
  if (app === "build") {
    root?.style.setProperty("--color-border", "var(--gray-30)")
  }
}