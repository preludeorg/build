import classNames from "classnames";
import React from "react";
import shallow from "zustand/shallow";
import useAuthStore from "../../hooks/auth-store";
import useTerminalStore, { selectCaretText } from "../../hooks/terminal-store";
import { isControlC } from "../../lib/keys";
import { select } from "../../lib/utils/select";
import focusTerminal from "../../utils/focus-terminal";
import PrimaryPrompt from "./primary-prompt";
import styles from "./terminal.module.css";
import WelcomeMessage from "./welcome-message";

const useScrollToBottom = (changesToWatch: any, wrapperRef: any) => {
  React.useEffect(() => {
    if (!wrapperRef.current) return;
    wrapperRef.current.scrollTop = wrapperRef.current.scrollHeight;
  }, [changesToWatch]);
};

function useTerminal() {
  const ref = React.useRef<HTMLDivElement>(null);

  const { bufferedContent, inputEnabled } = useTerminalStore(
    select("bufferedContent", "inputEnabled"),
    shallow
  );

  const {
    abort,
    setFocus,
    handleKey,
    processCommand,
    write,
    clear,
    autoComplete,
  } = useTerminalStore(
    select(
      "abort",
      "setFocus",
      "handleKey",
      "processCommand",
      "write",
      "clear",
      "autoComplete"
    ),
    shallow
  );

  const { host, credentials } = useAuthStore(
    select("host", "credentials"),
    shallow
  );

  const handleKeyDownEvent = (event: KeyboardEvent) => {
    if (isControlC(event)) {
      abort();
      return;
    }

    if (!inputEnabled) {
      return;
    }

    event.preventDefault();

    const eventKey = event.key;

    if (eventKey === "Enter") {
      processCommand();
      return;
    }

    if (eventKey === "Tab") {
      autoComplete();
      return;
    }

    void handleKey(event);
  };

  const handleFocus = () => {
    setFocus(document.activeElement === ref.current);
  };

  React.useEffect(() => {
    write(<WelcomeMessage host={host} credentials={credentials} />);
    return () => {
      clear();
    };
  }, []);

  React.useEffect(() => {
    // Bind the event listener
    ref.current?.addEventListener("keydown", handleKeyDownEvent);
    return () => {
      // Unbind the event listener on clean up
      ref.current?.removeEventListener("keydown", handleKeyDownEvent);
    };
  });

  React.useEffect(() => {
    // Bind the event listener
    document.addEventListener("focusin", handleFocus, true);
    document.addEventListener("blur", handleFocus, true);
    return () => {
      // Unbind the event listener on clean up
      document.removeEventListener("focusin", handleFocus, true);
      document.removeEventListener("blur", handleFocus, true);
    };
  });

  useScrollToBottom(bufferedContent, ref);
  useScrollToBottom(inputEnabled, ref);

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
      tabIndex={0}
      ref={ref}
      className={styles.terminal}
    >
      {bufferedContent.map((el, index) => {
        return <React.Fragment key={index}>{el}</React.Fragment>;
      })}
      <CurrentLine />
    </div>
  );
};

const CurrentLine = () => {
  const { focused, inputEnabled, currentTest } = useTerminalStore(
    select("focused", "inputEnabled", "currentTest"),
    shallow
  );

  const [beforeCaretText, afterCaretText] = useTerminalStore(
    selectCaretText,
    shallow
  );

  if (!inputEnabled) {
    return <></>;
  }

  return (
    <>
      <PrimaryPrompt test={currentTest}>
        <span className={styles.preWhiteSpace}>{beforeCaretText}</span>
        <span
          className={classNames(styles.caret, { [styles.focused]: focused })}
        >
          <span className={styles.caretAfter} />
        </span>
        <span className={styles.preWhiteSpace}>{afterCaretText}</span>
      </PrimaryPrompt>
    </>
  );
};

export default Terminal;
