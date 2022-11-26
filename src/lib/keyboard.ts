export const SpecialKeys = {
  ENTER: "Enter",
  BACKSPACE: "Backspace",
  ESCAPE: "Escape",
  ARROW_UP: "ArrowUp",
  ARROW_DOWN: "ArrowDown",
  ARROW_LEFT: "ArrowLeft",
  ARROW_RIGHT: "ArrowRight",
  CTRL: "Control",
  COMMAND: "Command",
  TAB: "Tab",
} as const;

type UpperCaseCharacter =
  | "A"
  | "B"
  | "C"
  | "D"
  | "E"
  | "F"
  | "G"
  | "H"
  | "I"
  | "J"
  | "K"
  | "L"
  | "M"
  | "N"
  | "O"
  | "P"
  | "Q"
  | "R"
  | "S"
  | "T"
  | "U"
  | "V"
  | "W"
  | "X"
  | "Y"
  | "Z";

type Character = UpperCaseCharacter | Lowercase<UpperCaseCharacter>;
export type SpecialKey = typeof SpecialKeys[keyof typeof SpecialKeys];
export type Key = SpecialKey | Character;

interface SingleKey {
  type: "single";
  key: Key;
}

export function key(key: Key | Character): SingleKey {
  return {
    type: "single",
    key,
  };
}

interface CombinationKey {
  type: "combination";
  keys: Key[];
}

type KeyMatch = SingleKey | CombinationKey;

export function combine(...keys: Key[]): CombinationKey {
  return {
    type: "combination",
    keys,
  };
}

export interface Macro {
  when: KeyMatch | KeyMatch[];
  do: () => void | Promise<void>;
}

type MatchEvent = React.KeyboardEvent<HTMLInputElement> | KeyboardEvent;

export function matcher(marcos: Macro[]) {
  return (event: MatchEvent): boolean => {
    const marco = marcos.find((marco) => {
      const when = Array.isArray(marco.when) ? marco.when : [marco.when];
      return when.some((keyMatch) => {
        switch (keyMatch.type) {
          case "single":
            return matchKey(keyMatch.key, event);
          case "combination":
            return isCombinationMatch(keyMatch, event);
        }
      });
    });

    if (!marco) {
      return false;
    }

    void marco.do();
    return true;
  };
}

function matchKey(key: Key, event: MatchEvent): boolean {
  if (event.ctrlKey && key === SpecialKeys.CTRL) {
    true;
  }

  return event.key.toLowerCase() === key.toLowerCase();
}
function isCombinationMatch(match: CombinationKey, event: MatchEvent): boolean {
  return match.keys.every((key) => matchKey(key, event));
}

export function when(args: Key | Macro["when"]) {
  const when = typeof args === "string" ? key(args) : args;

  return {
    do: (func: Macro["do"]) => {
      return {
        when,
        do: func,
      };
    },
  };
}
