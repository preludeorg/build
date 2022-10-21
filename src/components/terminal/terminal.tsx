import React from "react";
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
  const [consoleFocused, setConsoleFocused] = React.useState(false);
  const [editorInput, setEditorInput] = React.useState("");
  const [processCurrentLine, setProcessCurrentLine] = React.useState(false);
  const [caretPosition, setCaretPosition] = React.useState(0);
  const [beforeCaretText, setBeforeCaretText] = React.useState("");
  const [afterCaretText, setAfterCaretText] = React.useState("");
  const [bufferedContent, setBufferedContent] = React.useState<
    JSX.Element | string
  >("");

  const welcomeMessage = (
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

  const currentLine = (
    <>
      <span className={styles.prompt}>{prompt}</span>
      <div className={styles.lineText}>
        <span className={styles.preWhiteSpace}>{beforeCaretText}</span>
        {consoleFocused ? (
          <span className={styles.caret}>
            <span className={styles.caretAfter} />
          </span>
        ) : null}
        <span className={styles.preWhiteSpace}>{afterCaretText}</span>
      </div>
    </>
  );

  const handleKeyDownEvent = (event: KeyboardEvent) => {
    if (!consoleFocused) {
      return;
    }

    event.preventDefault();

    const eventKey = event.key;

    if (eventKey === "Enter") {
      setProcessCurrentLine(true);
      return;
    }

    let nextInput = null;

    if (eventKey === "Backspace") {
      const [caretTextBefore, caretTextAfter] = splitStringAtIndex(
        editorInput,
        caretPosition
      );
      nextInput = caretTextBefore.slice(0, -1) + caretTextAfter;
      if (editorInput && editorInput.length !== 0)
        setCaretPosition(caretPosition - 1);
    } else if (eventKey === "ArrowUp") {
      // nextInput = getPreviousCommand();
      // if (nextInput) setCaretPosition(nextInput.length);
    } else if (eventKey === "ArrowDown") {
      // nextInput = getNextCommand();
      // if (nextInput) setCaretPosition(nextInput.length);
      // else setCaretPosition(0);
    } else if (eventKey === "ArrowLeft") {
      if (caretPosition > 0) setCaretPosition(caretPosition - 1);
      nextInput = editorInput;
    } else if (eventKey === "ArrowRight") {
      if (caretPosition < editorInput.length)
        setCaretPosition(caretPosition + 1);
      nextInput = editorInput;
    } else if (
      (event.metaKey || event.ctrlKey) &&
      eventKey.toLowerCase() === "v"
    ) {
      navigator.clipboard.readText().then((pastedText) => {
        const [caretTextBefore, caretTextAfter] = splitStringAtIndex(
          editorInput || "",
          caretPosition
        );
        nextInput = caretTextBefore + pastedText + caretTextAfter;
        setCaretPosition(caretPosition + pastedText.length);
        setEditorInput(nextInput);
      });
    } else if (
      (event.metaKey || event.ctrlKey) &&
      eventKey.toLowerCase() === "c"
    ) {
      const selectedText = window.getSelection()?.toString();
      if (!selectedText) return;
      navigator.clipboard.writeText(selectedText).then(() => {
        nextInput = editorInput;
        setEditorInput(nextInput);
      });
    } else {
      if (eventKey && eventKey.length === 1) {
        const [caretTextBefore, caretTextAfter] = splitStringAtIndex(
          editorInput,
          caretPosition
        );
        nextInput = caretTextBefore + eventKey + caretTextAfter;
        setCaretPosition(caretPosition + 1);
      } else nextInput = editorInput;
    }

    setEditorInput(nextInput ?? "");
    setProcessCurrentLine(false);
  };

  const handleFocus = () => {
    setConsoleFocused(document.activeElement === ref.current);
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
      editorInput,
      caretPosition
    );
    setBeforeCaretText(caretTextBefore);
    setAfterCaretText(caretTextAfter);
  }, [editorInput, caretPosition]);

  React.useEffect(() => {
    if (!processCurrentLine) {
      return;
    }

    const processCommand = async (text: string) => {
      const [command, ...rest] = text.trim().split(" ");
      let output: string | JSX.Element = "";

      if (command === "clear") {
        setBufferedContent("");
        setEditorInput("");
        setProcessCurrentLine(false);
        setCaretPosition(0);
        setBeforeCaretText("");
        setAfterCaretText("");
        return;
      }

      const waiting = (
        <>
          {bufferedContent}
          <span>{prompt}</span>
          <span className={`${styles.lineText} ${styles.preWhiteSpace}`}>
            {editorInput}
          </span>
          <br />
        </>
      );

      setBufferedContent(waiting);
      setEditorInput("");
      setCaretPosition(0);
      setBeforeCaretText("");
      setAfterCaretText("");

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
            {editorInput}
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

      setBufferedContent(nextBufferedContent);
      setProcessCurrentLine(false);
    };

    processCommand(editorInput);
  }, [processCurrentLine]);

  useScrollToBottom(bufferedContent, ref);

  return { currentLine, welcomeMessage, bufferedContent, ref };
}

const Terminal: React.FC<Props> = ({ commands }) => {
  const { currentLine, welcomeMessage, ref, bufferedContent } = useTerminal({
    commands,
  });
  return (
    <div tabIndex={0} ref={ref} className={styles.terminal}>
      {welcomeMessage}
      {bufferedContent}
      {currentLine}
    </div>
  );
};

export default Terminal;
