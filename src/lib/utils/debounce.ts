export function debounce<T extends (...arg: unknown[]) => unknown>(
  cb: T,
  wait = 20
) {
  let h = 0;
  const callable = (...args: unknown[]) => {
    clearTimeout(h);
    h = setTimeout(() => cb(...args), wait);
  };
  return <T>(<unknown>callable);
}
