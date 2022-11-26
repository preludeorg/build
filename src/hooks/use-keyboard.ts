import { Macro, matcher } from "../lib/keyboard";

export const useKeyboard = (create: () => Macro[]) => {
  const handleKey = matcher(create());

  return { handleKey };
};
