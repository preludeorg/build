export function debounce<T extends (...arg: any) => any>(cb: T, wait = 20) {
  let h: any = 0;
  const callable = (...args: any) => {
    clearTimeout(h);
    h = setTimeout(() => cb(...args), wait);
  };
  return <T>(<any>callable);
}
