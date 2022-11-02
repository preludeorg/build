import React from "react";
import shallow from "zustand/shallow";
import useTerminalStore from "../../hooks/terminal-store";
import styles from "./terminal.module.css";
import cx from "classnames";
import PrimaryPrompt from "./primary-prompt";

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
  const autoComplete = useTerminalStore((state) => state.autoComplete);

  const handleKeyDownEvent = (event: KeyboardEvent) => {
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
    <div id="terminal" tabIndex={0} ref={ref} className={styles.terminal}>
      {bufferedContent.map((el, index) => {
        return <React.Fragment key={index}>{el}</React.Fragment>;
      })}
      <CurrentLine />
    </div>
  );
};

const CurrentLine = () => {
  const { focused, inputEnabled, currentTTP } = useTerminalStore(
    (state) => ({
      focused: state.focused,
      inputEnabled: state.inputEnabled,
      currentTTP: state.currentTTP,
    }),
    shallow
  );

  const [beforeCaretText, afterCaretText] = useTerminalStore(
    (state) => state.caretText(),
    shallow
  );

  if (!inputEnabled) {
    return <></>;
  }

  return (
    <PrimaryPrompt ttp={currentTTP}>
      <span className={styles.preWhiteSpace}>{beforeCaretText}</span>
      <span className={cx(styles.caret, { [styles.focused]: focused })}>
        <span className={styles.caretAfter} />
      </span>
      <span className={styles.preWhiteSpace}>{afterCaretText}</span>
    </PrimaryPrompt>
  );
};

export default Terminal;
