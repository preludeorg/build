import { Test } from "@theprelude/sdk";
import classNames from "classnames";
import React, { useEffect, useRef, useState } from "react";
import shallow from "zustand/shallow";
import useAuthStore from "../../hooks/auth-store";
import useTerminalStore, {
  getNextCommand,
  getPreviousCommand,
  getSuggestions,
  splitStringAtIndex,
} from "../../hooks/terminal-store";
import { useKeyboard } from "../../hooks/use-keyboard";
import { combine, SpecialKeys, when } from "../../lib/keyboard";
import { select } from "../../lib/utils/select";
import focusTerminal from "../../utils/focus-terminal";
import PrimaryPrompt from "./primary-prompt";
import styles from "./terminal.module.css";
import WelcomeMessage from "./welcome-message";

const useScrollToBottom = (
  changesToWatch: unknown,
  wrapperRef: React.RefObject<{ scrollTop: number; scrollHeight: number }>
) => {
  React.useEffect(() => {
    if (!wrapperRef.current) return;
    wrapperRef.current.scrollTop = wrapperRef.current.scrollHeight;
  }, [changesToWatch]);
};

function useTerminal() {
  const ref = React.useRef<HTMLDivElement>(null);

  const { bufferedContent } = useTerminalStore(
    select("bufferedContent"),
    shallow
  );

  const { write, clear } = useTerminalStore(select("write", "clear"), shallow);

  const { host, credentials } = useAuthStore(
    select("host", "credentials"),
    shallow
  );

  React.useEffect(() => {
    write(<WelcomeMessage host={host} credentials={credentials} />);
    write(<CurrentLine />);
    return () => {
      clear();
    };
  }, []);

  useScrollToBottom(bufferedContent, ref);

  return { bufferedContent, ref };
}

const Terminal: React.FC = () => {
  const { ref, bufferedContent } = useTerminal();
  return (
    <div
      onFocus={(e) => {
        e.preventDefault();
        focusTerminal();
      }}
      id="terminal"
      ref={ref}
      className={styles.terminal}
      tabIndex={0}
    >
      {bufferedContent.map((item) => {
        return <React.Fragment key={item.key}>{item.content}</React.Fragment>;
      })}
    </div>
  );
};

export const CurrentLine: React.FC<{ currentTest?: Test; input?: string }> = ({
  currentTest,
  input,
}) => {
  return (
    <>
      <PrimaryPrompt test={currentTest}>
        <Readline defaultInput={input} />
      </PrimaryPrompt>
    </>
  );
};

const useReadline = (defaultInput = "") => {
  const ref = useRef<HTMLDivElement | HTMLInputElement>(null);
  const [focused, setFocused] = useState(false);
  const [input, setInput] = useState(defaultInput);
  const [caretPosition, setCaretPosition] = useState(defaultInput.length);
  const [terminated, setTerminated] = useState(false);
  const processCommand = useTerminalStore((state) => state.processCommand);
  const commandsHistory = useTerminalStore((state) => state.commandsHistory);
  const [historyPointer, setHistoryPointer] = useState(commandsHistory.length);
  const abort = useTerminalStore((state) => state.abort);
  const autoComplete = useTerminalStore((state) => state.autoComplete);
  const setFocusable = useTerminalStore((state) => state.setFocusable);

  console.log(caretPosition);

  const arrowLeft = () => {
    if (caretPosition > 0) {
      setCaretPosition(caretPosition - 1);
    }
  };

  const arrowRight = () => {
    if (caretPosition > 0) {
      setCaretPosition(caretPosition + 1);
    }
  };

  const keyboard = useKeyboard(() => [
    when(combine(SpecialKeys.CTRL, "c")).do(() => {
      setTerminated(true);
      setFocusable(false);
      abort();
    }),
    when(SpecialKeys.ENTER).do(() => {
      setTerminated(true);
      setFocusable(false);
      processCommand(input);
    }),
    when(SpecialKeys.TAB).do(() => {
      if (input !== "") return;
      const options = getSuggestions(input);
      if (options.length === 0) return;
      if (options.length === 1) {
        setInput(options[0]);
        setCaretPosition(options[0].length);
      } else {
        autoComplete(options);
        setFocusable(false);
        setTerminated(true);
      }
    }),
    when(SpecialKeys.BACKSPACE).do(() => {
      const [caretTextBefore, caretTextAfter] = splitStringAtIndex(
        input,
        caretPosition
      );

      setInput(caretTextBefore.slice(0, -1) + caretTextAfter);

      if (input.length !== 0) {
        setCaretPosition(caretPosition - 1);
      }
    }),
    when(SpecialKeys.ARROW_UP).do(() => {
      const input = getPreviousCommand(historyPointer, commandsHistory);
      if (input) {
        setCaretPosition(input.length);
      }

      if (historyPointer > 0) {
        setHistoryPointer(historyPointer - 1);
      }
    }),
    when(SpecialKeys.ARROW_DOWN).do(() => {
      const input = getNextCommand(historyPointer, commandsHistory);
      setCaretPosition(input ? input.length : 0);

      if (historyPointer + 1 <= commandsHistory.length) {
        setHistoryPointer(historyPointer + 1);
      }
    }),
    when(SpecialKeys.ARROW_LEFT).do(arrowLeft),
    when(SpecialKeys.ARROW_RIGHT).do(arrowRight),
    when([
      combine(SpecialKeys.COMMAND, "c"),
      combine(SpecialKeys.CTRL, "c"),
    ]).do(async () => {
      const selectedText = window.getSelection()?.toString();
      if (!selectedText) return;
      await navigator.clipboard.writeText(selectedText);
    }),
    when([
      combine(SpecialKeys.COMMAND, "v"),
      combine(SpecialKeys.CTRL, "v"),
    ]).do(async () => {
      const pastedText = await navigator.clipboard.readText();
      const [caretTextBefore, caretTextAfter] = splitStringAtIndex(
        input || "",
        caretPosition
      );
      setInput(caretTextBefore + pastedText + caretTextAfter);
      setCaretPosition(caretPosition + pastedText.length);
    }),
  ]);

  const handleFocus = () => {
    setFocused(true);
  };

  const handleBlur = () => {
    setFocused(false);
  };

  const [beforeCaretText, afterCaretText] = splitStringAtIndex(
    input,
    caretPosition
  );

  const handleKey = async (event: globalThis.KeyboardEvent) => {
    if (!focused) {
      return;
    }

    event.preventDefault();

    const handled = keyboard.handleKey(event);

    if (handled) {
      return;
    }

    if (!event.key || event.key.length > 1) {
      return;
    }

    const [caretTextBefore, caretTextAfter] = splitStringAtIndex(
      input,
      caretPosition
    );

    setInput(caretTextBefore + event.key + caretTextAfter);
    setCaretPosition(caretPosition + 1);
  };

  useEffect(() => {
    setFocusable(true);
    ref.current?.focus();
  }, [ref]);

  return {
    focused,
    handleFocus,
    handleBlur,
    beforeCaretText,
    afterCaretText,
    handleKey,
    terminated,
    input,
    ref,
  };
};

const Readline: React.FC<{ defaultInput?: string }> = ({ defaultInput }) => {
  const {
    focused,
    handleBlur,
    handleFocus,
    afterCaretText,
    beforeCaretText,
    handleKey,
    terminated,
    input,
    ref,
  } = useReadline(defaultInput);

  if (terminated) {
    return <span className={styles.preWhiteSpace}>{input}</span>;
  }

  return (
    <div
      ref={ref}
      className={classNames(styles.readline, "focusable")}
      onFocus={handleFocus}
      onBlur={handleBlur}
      onKeyDown={(e) => {
        void handleKey(e.nativeEvent);
      }}
      tabIndex={0}
    >
      <span className={styles.preWhiteSpace}>{beforeCaretText}</span>
      <span className={classNames(styles.caret, { [styles.focused]: focused })}>
        <span className={styles.caretAfter} />
      </span>
      <span className={styles.preWhiteSpace}>{afterCaretText}</span>
    </div>
  );
};

export default Terminal;
