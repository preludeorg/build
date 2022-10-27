import React from "react";
import shallow from "zustand/shallow";
import useTerminalStore from "../../hooks/terminal-store";
import styles from "./terminal.module.css";
import cx from "classnames";
import { Commands } from "./commands";

const useScrollToBottom = (changesToWatch: any, wrapperRef: any) => {
  React.useEffect(() => {
    if (!wrapperRef.current) return;
    wrapperRef.current.scrollTop = wrapperRef.current.scrollHeight;
  }, [changesToWatch]);
};

function useTerminal() {
  const ref = React.useRef<HTMLDivElement>(null);

  const { bufferedContent } = useTerminalStore(
    (state) => ({
      bufferedContent: state.bufferedContent,
    }),
    shallow
  );

  const setFocus = useTerminalStore((state) => state.setFocus);
  const handleKey = useTerminalStore((state) => state.handleKey);
  const processCommand = useTerminalStore((state) => state.processCommand);

  const handleKeyDownEvent = (event: KeyboardEvent) => {
    event.preventDefault();

    const eventKey = event.key;
    if (eventKey === "Enter") {
      processCommand();
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

  return { bufferedContent, ref };
}

const Terminal: React.FC = () => {
  const { ref, bufferedContent } = useTerminal();
  return (
    <div tabIndex={0} ref={ref} className={styles.terminal}>
      <WelcomeMessage />
      {bufferedContent}
      <CurrentLine />
    </div>
  );
};

const WelcomeMessage = () => {
  return (
    <span>
      Welcome to Operator 2.0
      <br />
      <br />
    </span>
  );
};

const CurrentLine = () => {
  const prompt = "$";

  const { focused } = useTerminalStore(
    (state) => ({
      focused: state.focused,
    }),
    shallow
  );

  const [beforeCaretText, afterCaretText] = useTerminalStore(
    (state) => state.caretText(),
    shallow
  );

  return (
    <>
      <span className={styles.prompt}>{prompt}</span>
      <div className={styles.lineText}>
        <span className={styles.preWhiteSpace}>{beforeCaretText}</span>
        <span className={cx(styles.caret, { [styles.focused]: focused })}>
          <span className={styles.caretAfter} />
        </span>
        <span className={styles.preWhiteSpace}>{afterCaretText}</span>
      </div>
    </>
  );
};

export default Terminal;
