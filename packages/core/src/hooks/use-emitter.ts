import { useCallback, useEffect } from "react";
import { emitter } from "../lib/emitter";

export function useEmitter(
  event: string,
  handler: (...args: any[]) => void,
  deps: any[] = []
) {
  const fn = useCallback(handler, deps);

  useEffect(() => {
    emitter.on(event, fn);
    return () => {
      emitter.off(event, fn);
    };
  }, [event, fn]);
}
