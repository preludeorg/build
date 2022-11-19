export function select<T, K extends keyof T>(
  ...keys: K[]
): (state: T) => Pick<T, K> {
  return (state) => {
    const ret: any = {};
    for (const key of keys) {
      ret[key] = state[key];
    }
    return ret as Pick<T, K>;
  };
}
