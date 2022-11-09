import React from "react";
import shallow from "zustand/shallow";
import useTerminalStore, { selectCaretText } from "../../hooks/terminal-store";
import styles from "./terminal.module.css";
import cx from "classnames";
import PrimaryPrompt from "./primary-prompt";
import useAuthStore from "../../hooks/auth-store";
import WelcomeMessage from "./welcome-message";
import focusTerminal from "../../utils/focus-terminal";
import { isControlC } from "../../lib/keys";

const useScrollToBottom = (changesToWatch: any, wrapperRef: any) => {
  React.useEffect(() => {
    if (!wrapperRef.current) return;
    wrapperRef.current.scrollTop = wrapperRef.current.scrollHeight;
  }, [changesToWatch]);
};

function useTerminal() {
  const ref = React.useRef<HTMLDivElement>(null);

  const { bufferedContent, inputEnabled } = useTerminalStore(
    (state) => ({
      bufferedContent: state.bufferedContent,
      inputEnabled: state.inputEnabled,
    }),
    shallow
  );

  const setFocus = useTerminalStore((state) => state.setFocus);
  const handleKey = useTerminalStore((state) => state.handleKey);
  const processCommand = useTerminalStore((state) => state.processCommand);
  const write = useTerminalStore((state) => state.write);
  const clear = useTerminalStore((state) => state.clear);
  const host = useAuthStore((state) => state.host);
  const credentials = useAuthStore((state) => state.credentials);
  const autoComplete = useTerminalStore((state) => state.autoComplete);
  const abort = useTerminalStore((state) => state.abort);

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

    handleKey(event);
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
    (state) => ({
      focused: state.focused,
      inputEnabled: state.inputEnabled,
      currentTest: state.currentTest,
    }),
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
    <PrimaryPrompt test={currentTest}>
      <span className={styles.preWhiteSpace}>{beforeCaretText}</span>
      <span className={cx(styles.caret, { [styles.focused]: focused })}>
        <span className={styles.caretAfter} />
      </span>
      <span className={styles.preWhiteSpace}>{afterCaretText}</span>
    </PrimaryPrompt>
  );
};

export default Terminal;
