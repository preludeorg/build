export function isControlC(e: React.KeyboardEvent<HTMLInputElement>) {
  return (e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "c";
}
