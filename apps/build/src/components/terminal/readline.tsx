import { select } from "@theprelude/core";
import classNames from "classnames";
import { useState } from "react";
import useTerminalStore from "../../hooks/terminal-store";
import { useKeyboard } from "../../hooks/use-keyboard";
import {
  combine,
  hasModifierKey,
  Macro,
  ModifierKeys,
  press,
  SpecialKeys,
} from "../../lib/keyboard";
import Focusable from "./focusable";
import styles from "./terminal.module.css";

export function splitStringAtIndex(value: string, index: number) {
  if (!value) {
    return ["", ""];
  }
  return [value.substring(0, index), value.substring(index)];
}

interface ReadlineState {
  input: string;
  setInput: (input: string) => void;
  caretPosition: number;
  setCaretPosition: (caretPosition: number) => void;
  terminate: () => void;
}

export const useReadline = ({
  defaultInput = "",
  extraMacros,
  onChange,
}: {
  defaultInput?: string;
  extraMacros?: (state: ReadlineState) => Macro[];
  onChange?: (input: string) => void;
}) => {
  const [input, _setInput] = useState(defaultInput);
  const [caretPosition, setCaretPosition] = useState(defaultInput.length);
  const [terminated, setTerminated] = useState(false);
  const { setFocusable } = useTerminalStore(select("setFocusable"));

  const setInput = (input: string) => {
    _setInput(input);
    onChange?.(input);
  };

  const terminate = () => {
    setTerminated(true);
    setFocusable(false);
  };

  const [beforeCaretText, afterCaretText] = splitStringAtIndex(
    input,
    caretPosition
  );

  const macros =
    extraMacros?.({
      input,
      setInput,
      caretPosition,
      setCaretPosition,
      terminate,
    }) ?? [];

  const keyboard = useKeyboard([
    press(SpecialKeys.BACKSPACE).do((event) => {
      event.preventDefault();
      const [caretTextBefore, caretTextAfter] = splitStringAtIndex(
        input,
        caretPosition
      );

      setInput(caretTextBefore.slice(0, -1) + caretTextAfter);

      if (input.length !== 0) {
        setCaretPosition(caretPosition - 1);
      }
    }),
    press(SpecialKeys.ARROW_LEFT).do(() => {
      if (caretPosition > 0) {
        setCaretPosition(caretPosition - 1);
      }
    }),
    press(SpecialKeys.ARROW_RIGHT).do(() => {
      if (caretPosition < input.length) {
        setCaretPosition(caretPosition + 1);
      }
    }),
    press(
      combine(ModifierKeys.COMMAND, "a"),
      combine(ModifierKeys.CTRL, "a")
    ).do((e) => {
      e.preventDefault();
    }),
    ...macros,
  ]);

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const pastedText = e.nativeEvent.clipboardData?.getData("text") ?? "";
    const [caretTextBefore, caretTextAfter] = splitStringAtIndex(
      input || "",
      caretPosition
    );
    setInput(caretTextBefore + pastedText + caretTextAfter);
    setCaretPosition(caretPosition + pastedText.length);
  };

  const handleKeyDown = async (
    event: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (keyboard.handleEvent(event)) {
      return;
    }

    if (event.key.length === 1 && !hasModifierKey(event)) {
      const [caretTextBefore, caretTextAfter] = splitStringAtIndex(
        input,
        caretPosition
      );

      setInput(caretTextBefore + event.key + caretTextAfter);
      setCaretPosition(caretPosition + 1);
      return;
    }
  };

  return {
    beforeCaretText,
    afterCaretText,
    handleKeyDown,
    terminated,
    input,
    handlePaste,
  };
};

const Readline: React.FC<{
  input: string;
  beforeCaretText: string;
  afterCaretText: string;
  terminated: boolean;
  handleKeyDown: (
    event: React.KeyboardEvent<HTMLInputElement>
  ) => Promise<void>;
  handlePaste: (e: React.ClipboardEvent<HTMLInputElement>) => void;
}> = ({
  input,
  terminated,
  beforeCaretText,
  afterCaretText,
  handleKeyDown,
  handlePaste,
}) => {
  if (terminated) {
    return (
      <div className={styles.lineText}>
        <span className={styles.preWhiteSpace}>{input}</span>{" "}
      </div>
    );
  }

  return (
    <div className={styles.lineText}>
      <Focusable
        onKeyDown={handleKeyDown}
        onPaste={handlePaste}
        render={({ focused }) => (
          <>
            <span className={styles.preWhiteSpace}>{beforeCaretText}</span>
            <span
              className={classNames(styles.caret, {
                [styles.focused]: focused,
              })}
            >
              <span className={styles.caretAfter} />
            </span>
            <span className={styles.preWhiteSpace}>{afterCaretText}</span>
          </>
        )}
      />
    </div>
  );
};

export default Readline;
