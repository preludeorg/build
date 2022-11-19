export const Keys = {
  ENTER: "Enter",
  BACKSPACE: "Backspace",
  ESCAPE: "Escape",
  ARROW_UP: "ArrowUp",
  ARROW_DOWN: "ArrowDown",
  ARROW_LEFT: "ArrowLeft",
  ARROW_RIGHT: "ArrowRight",
  CTRL_C: "ControlC",
} as const;

export type Keys = typeof Keys[keyof typeof Keys];
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
// add additional non-letter characters to this union as desired
type Character = UpperCaseCharacter | Lowercase<UpperCaseCharacter>;

export function mapKey<F = Function>(map: Record<Keys | Character, F>) {}

export function isControlC(
  e: React.KeyboardEvent<HTMLInputElement> | KeyboardEvent
) {
  return e.ctrlKey && e.key.toLowerCase() === "c";
}
