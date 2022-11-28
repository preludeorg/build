export const SpecialKeys = {
  ENTER: "Enter",
  BACKSPACE: "Backspace",
  ESCAPE: "Escape",
  ARROW_UP: "ArrowUp",
  ARROW_DOWN: "ArrowDown",
  ARROW_LEFT: "ArrowLeft",
  ARROW_RIGHT: "ArrowRight",
  TAB: "Tab",
} as const;

export const ModifierKeys = {
  CTRL: "Control",
  COMMAND: "Command",
  SHIFT: "Shift",
  ALT: "Alt",
} as const;

export type SpecialKey = typeof SpecialKeys[keyof typeof SpecialKeys];
export type Key = string;
export type ModifierKey = typeof ModifierKeys[keyof typeof ModifierKeys];

interface KeyMatch {
  key: Key;
  modifier?: ModifierKey;
}

export function key(key: Key): KeyMatch {
  return {
    key,
  };
}

export function combine(mod: ModifierKey, key: Key): KeyMatch {
  return {
    key,
    modifier: mod,
  };
}

type MatchEvent = React.KeyboardEvent<HTMLInputElement> | KeyboardEvent;
export interface Macro {
  press: KeyMatch | KeyMatch[];
  do: (event: MatchEvent) => void | Promise<void>;
}

export function matcher(marcos: Macro[]) {
  return (event: MatchEvent): boolean => {
    const marco = marcos.find((marco) => {
      const press = Array.isArray(marco.press) ? marco.press : [marco.press];
      return press.some((keyMatch) => {
        if (keyMatch.modifier) {
          return matchCombinationKey(keyMatch, event);
        }

        return matchKey(keyMatch.key, event);
      });
    });

    if (!marco) {
      return false;
    }

    void marco.do(event);
    return true;
  };
}

function matchKey(key: Key, event: MatchEvent): boolean {
  return event.key.toLowerCase() === key.toLowerCase();
}

function matchCombinationKey(match: KeyMatch, event: MatchEvent): boolean {
  const modMatch =
    (event.ctrlKey && match.modifier === ModifierKeys.CTRL) ||
    (event.metaKey && match.modifier === ModifierKeys.COMMAND) ||
    (event.shiftKey && match.modifier === ModifierKeys.SHIFT) ||
    (event.altKey && match.modifier === ModifierKeys.ALT);

  return modMatch && matchKey(match.key, event);
}

export function press(...args: (Key | KeyMatch)[]) {
  const press = args.map((arg) => (typeof arg === "string" ? key(arg) : arg));

  return {
    do: (func: Macro["do"]) => {
      return {
        press,
        do: func,
      };
    },
  };
}

export function hasModifierKey(event: MatchEvent) {
  return event.ctrlKey || event.metaKey;
}
