import React from "react";
import shallow from "zustand/shallow";
import useTerminalStore from "../../hooks/terminal-store";
import styles from "./terminal.module.css";

function splitStringAtIndex(value: string, index: number) {
  if (!value) {
    return ["", ""];
  }
  return [value.substring(0, index), value.substring(index)];
}

const useScrollToBottom = (changesToWatch: any, wrapperRef: any) => {
  React.useEffect(() => {
    if (!wrapperRef.current) return;
    wrapperRef.current.scrollTop = wrapperRef.current.scrollHeight;
  }, [changesToWatch]);
};

interface Props {
  commands: Record<string, (args: string) => string | JSX.Element>;
}

function useTerminal({ commands }: Props) {
  const ref = React.useRef<HTMLDivElement>(null);
  const prompt = "$";

  const {
    focused,
    input,
    processInput,
    caretPosition,
    beforeCaretText,
    afterCaretText,
    bufferedContent,
  } = useTerminalStore((state) => state, shallow);
  const setProperty = useTerminalStore((state) => state.setProperty);
  const clear = useTerminalStore((state) => state.clear);
  const wait = useTerminalStore((state) => state.wait);

  const currentLine = (
    <>
      <span className={styles.prompt}>{prompt}</span>
      <div className={styles.lineText}>
        <span className={styles.preWhiteSpace}>{beforeCaretText}</span>
        {focused ? (
          <span className={styles.caret}>
            <span className={styles.caretAfter} />
          </span>
        ) : null}
        <span className={styles.preWhiteSpace}>{afterCaretText}</span>
      </div>
    </>
  );

  const handleKeyDownEvent = (event: KeyboardEvent) => {
    if (!focused) {
      return;
    }

    event.preventDefault();

    const eventKey = event.key;

    if (eventKey === "Enter") {
      setProperty("processInput", true);
      return;
    }

    let nextInput = null;

    if (eventKey === "Backspace") {
      const [caretTextBefore, caretTextAfter] = splitStringAtIndex(
        input,
        caretPosition
      );
      nextInput = caretTextBefore.slice(0, -1) + caretTextAfter;
      if (input && input.length !== 0)
        setProperty("caretPosition", caretPosition - 1);
    } else if (eventKey === "ArrowUp") {
      // nextInput = getPreviousCommand();
      // if (nextInput) setCaretPosition(nextInput.length);
    } else if (eventKey === "ArrowDown") {
      // nextInput = getNextCommand();
      // if (nextInput) setCaretPosition(nextInput.length);
      // else setCaretPosition(0);
    } else if (eventKey === "ArrowLeft") {
      if (caretPosition > 0) setProperty("caretPosition", caretPosition - 1);
      nextInput = input;
    } else if (eventKey === "ArrowRight") {
      if (caretPosition < input.length)
        setProperty("caretPosition", caretPosition + 1);
      nextInput = input;
    } else if (
      (event.metaKey || event.ctrlKey) &&
      eventKey.toLowerCase() === "v"
    ) {
      navigator.clipboard.readText().then((pastedText) => {
        const [caretTextBefore, caretTextAfter] = splitStringAtIndex(
          input || "",
          caretPosition
        );
        nextInput = caretTextBefore + pastedText + caretTextAfter;
        setProperty("caretPosition", caretPosition + pastedText.length);
        setProperty("input", nextInput);
      });
    } else if (
      (event.metaKey || event.ctrlKey) &&
      eventKey.toLowerCase() === "c"
    ) {
      const selectedText = window.getSelection()?.toString();
      if (!selectedText) return;
      navigator.clipboard.writeText(selectedText).then(() => {
        nextInput = input;
        setProperty("input", nextInput);
      });
    } else {
      if (eventKey && eventKey.length === 1) {
        const [caretTextBefore, caretTextAfter] = splitStringAtIndex(
          input,
          caretPosition
        );
        nextInput = caretTextBefore + eventKey + caretTextAfter;
        setProperty("caretPosition", caretPosition + 1);
      } else nextInput = input;
    }

    setProperty("input", nextInput ?? "");
    setProperty("processInput", false);
  };

  const handleFocus = () => {
    setProperty("focused", document.activeElement === ref.current);
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

  React.useEffect(() => {
    const [caretTextBefore, caretTextAfter] = splitStringAtIndex(
      input,
      caretPosition
    );
    setProperty("beforeCaretText", caretTextBefore);
    setProperty("afterCaretText", caretTextAfter);
  }, [input, caretPosition]);

  React.useEffect(() => {
    if (!processInput) {
      return;
    }

    const processCommand = async (text: string) => {
      const [command, ...rest] = text.trim().split(" ");
      let output: string | JSX.Element = "";

      if (command === "clear") {
        clear();
        return;
      }

      const waiting = (
        <>
          {bufferedContent}
          <span>{prompt}</span>
          <span className={`${styles.lineText} ${styles.preWhiteSpace}`}>
            {input}
          </span>
          <br />
        </>
      );

      wait(waiting);

      if (text) {
        const commandArguments = rest.join(" ");

        if (command && commands[command]) {
          const executor = commands[command];

          if (typeof executor === "function") {
            output = await executor(commandArguments);
          } else {
            output = executor;
          }
        } else {
          output = `command "${command}" is not recognized`;
        }
      }

      const nextBufferedContent = (
        <>
          {bufferedContent}
          <span>{prompt}</span>
          <span className={`${styles.lineText} ${styles.preWhiteSpace}`}>
            {input}
          </span>
          {output ? (
            <span>
              <br />
              {output}
            </span>
          ) : null}
          <br />
        </>
      );

      setProperty("bufferedContent", nextBufferedContent);
      setProperty("processInput", false);
    };

    processCommand(input);
  }, [processInput]);

  useScrollToBottom(bufferedContent, ref);

  return { currentLine, bufferedContent, ref };
}

const Terminal: React.FC<Props> = ({ commands }) => {
  const { currentLine, ref, bufferedContent } = useTerminal({
    commands,
  });
  return (
    <div tabIndex={0} ref={ref} className={styles.terminal}>
      <WelcomeMessage />
      {bufferedContent}
      {currentLine}
    </div>
  );
};

const WelcomeMessage = () => {
  return (
    <span>
      Welcome to Operator 2.0
      <br />
      <br />
      Connected to testserver.prelude.org
      <br />
      <br />
      Type “search” to search <br />
      Type “open” to open a file <br />
      Type “list-manifest” to list
      <br />
      <br />
    </span>
  );
};

export default Terminal;
