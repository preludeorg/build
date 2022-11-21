export function isControlC(
  e: React.KeyboardEvent<HTMLInputElement> | KeyboardEvent
) {
  return e.ctrlKey && e.key.toLowerCase() === "c";
}
