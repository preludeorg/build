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
    // eslint-disable-next-line no-param-reassign
    wrapperRef.current.scrollTop = wrapperRef.current.scrollHeight;
  }, [changesToWatch]);
};

function useTerminal({ openTab }) {
  const prompt = "$";
  const consoleFocused = true;
  const [editorInput, setEditorInput] = React.useState("");
  const [processCurrentLine, setProcessCurrentLine] = React.useState(false);
  const [caretPosition, setCaretPosition] = React.useState(0);
  const [beforeCaretText, setBeforeCaretText] = React.useState("");
  const [afterCaretText, setAfterCaretText] = React.useState("");

  const welcomeMessage = (
    <span>
      Welcome to Operator 2.0
      <br />
      <br />
      Connected to testserver.prelude.org
      <br />
      <br />
      Type “search” to search <br />
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

  const handleKeyDownEvent = (event: any) => {
    if (!consoleFocused) {
      return;
    }

    event.preventDefault();

    const eventKey = event.key;

    if (eventKey === "Enter") {
      setProcessCurrentLine(true);
      if (editorInput === "open") {
        openTab();
        setEditorInput("");
        setCaretPosition(0);
      }
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

  React.useEffect(() => {
    // Bind the event listener
    document.addEventListener("keydown", handleKeyDownEvent);
    return () => {
      // Unbind the event listener on clean up
      document.removeEventListener("keydown", handleKeyDownEvent);
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

  return { currentLine, welcomeMessage };
}

const Terminal = ({ openTab }) => {
  const { currentLine, welcomeMessage } = useTerminal({ openTab });
  return (
    <div className={styles.terminal}>
      {welcomeMessage}
      {currentLine}
    </div>
  );
};

export default Terminal;
