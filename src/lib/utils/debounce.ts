export function debounce<T extends (...arg: any) => unknown>(cb: T, wait = 20) {
  let h = 0;
  const callable = (...args: any) => {
    clearTimeout(h);
    h = setTimeout(() => cb(...args), wait);
  };
  return <T>(<unknown>callable);
}
