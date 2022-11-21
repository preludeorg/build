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
import { isControlC } from "../../lib/keys";
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

  // React.useEffect(() => {
  //   // Bind the event listener
  //   ref.current?.addEventListener("keydown", handleKeyDownEvent);
  //   return () => {
  //     // Unbind the event listener on clean up
  //     ref.current?.removeEventListener("keydown", handleKeyDownEvent);
  //   };
  // });

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

    const eventKey = event.key;

    if (isControlC(event)) {
      setTerminated(true);
      setFocusable(false);
      abort();
      return;
    }

    event.preventDefault();

    if (eventKey === "Enter") {
      setTerminated(true);
      setFocusable(false);
      processCommand(input);
      return;
    }

    if (eventKey === "Tab" && input !== "") {
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
      return;
    }

    let nextInput: string | null = null;
    let nextPosition = caretPosition;
    let nextHistoryPointer = historyPointer;

    if (eventKey === "Backspace") {
      const [caretTextBefore, caretTextAfter] = splitStringAtIndex(
        input,
        caretPosition
      );
      nextInput = caretTextBefore.slice(0, -1) + caretTextAfter;
      if (input && input.length !== 0) {
        nextPosition = caretPosition - 1;
      }
    } else if (eventKey === "ArrowUp") {
      nextInput = getPreviousCommand(historyPointer, commandsHistory);
      if (historyPointer > 0) {
        nextHistoryPointer = historyPointer - 1;
      }
      if (nextInput) {
        nextPosition = nextInput.length;
      }
    } else if (eventKey === "ArrowDown") {
      nextInput = getNextCommand(historyPointer, commandsHistory);
      if (historyPointer + 1 <= commandsHistory.length) {
        nextHistoryPointer = historyPointer + 1;
      }
      if (nextInput) {
        nextPosition = nextInput.length;
      } else {
        nextPosition = 0;
      }
    } else if (eventKey === "ArrowLeft") {
      if (caretPosition > 0) {
        nextPosition = caretPosition - 1;
      }
      nextInput = input;
    } else if (eventKey === "ArrowRight") {
      if (caretPosition < input.length) {
        nextPosition = caretPosition + 1;
      }
      nextInput = input;
    } else if (
      (event.metaKey || event.ctrlKey) &&
      eventKey.toLowerCase() === "v"
    ) {
      const pastedText = await navigator.clipboard.readText();
      const [caretTextBefore, caretTextAfter] = splitStringAtIndex(
        input || "",
        caretPosition
      );
      nextInput = caretTextBefore + pastedText + caretTextAfter;
      nextPosition = caretPosition + pastedText.length;
    } else if (
      (event.metaKey || event.ctrlKey) &&
      eventKey.toLowerCase() === "c"
    ) {
      const selectedText = window.getSelection()?.toString();
      if (!selectedText) return;
      await navigator.clipboard.writeText(selectedText);
      nextInput = input;
    } else {
      if (eventKey && eventKey.length === 1) {
        const [caretTextBefore, caretTextAfter] = splitStringAtIndex(
          input,
          caretPosition
        );
        nextInput = caretTextBefore + eventKey + caretTextAfter;
        nextPosition = caretPosition + 1;
      } else {
        nextInput = input;
      }
    }

    setHistoryPointer(nextHistoryPointer);
    setInput(nextInput ?? "");
    setCaretPosition(nextPosition);
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
