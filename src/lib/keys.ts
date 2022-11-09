export function isControlC(
  e: React.KeyboardEvent<HTMLInputElement> | KeyboardEvent
) {
  return (e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "c";
}
