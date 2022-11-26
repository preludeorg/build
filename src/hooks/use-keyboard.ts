import { Macro, matcher } from "../lib/keyboard";

export const useKeyboard = (macros: Macro[]) => {
  const handleEvent = matcher(macros);

  return { handleEvent };
};
