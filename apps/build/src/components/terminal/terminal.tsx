import { emitter, select, useAuthStore } from "@theprelude/core";
import { Test } from "@theprelude/sdk";
import React, { useState } from "react";
import shallow from "zustand/shallow";
import { editorState } from "../../hooks/editor-store";
import { navigatorState } from "../../hooks/navigation-store";
import useTerminalStore, {
  getNextCommand,
  getPreviousCommand,
  getSuggestions,
  terminalState,
} from "../../hooks/terminal-store";
import { combine, ModifierKeys, press, SpecialKeys } from "../../lib/keyboard";
import focusTerminal from "../../utils/focus-terminal";
import PrimaryPrompt from "./primary-prompt";
import Readline, { useReadline } from "./readline";
import { TerminalMessage } from "./terminal-message";
import styles from "./terminal.module.css";
import WelcomeMessage from "./welcome-message";

emitter.on("import", () => {
  const { switchTest, clear, write } = terminalState();
  const { reset } = editorState();
  const { navigate } = navigatorState();

  switchTest();
  clear();
  reset();
  navigate("welcome");
  write(
    <TerminalMessage
      message={`credentials imported successfully.`}
      helpText={`type "list-tests" to show all your tests`}
    />
  );
});

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
    clear();
    write(<WelcomeMessage host={host} credentials={credentials} />);
  }, []);

  useScrollToBottom(bufferedContent, ref);

  return { bufferedContent, ref };
}

const Terminal: React.FC = () => {
  const { ref, bufferedContent } = useTerminal();
  return (
    <div
      onMouseUp={(e) => {
        e.preventDefault();
        focusTerminal();
      }}
      id="terminal"
      ref={ref}
      className={styles.terminal}
    >
      {bufferedContent.map((item) => {
        return <React.Fragment key={item.key}>{item.content}</React.Fragment>;
      })}
    </div>
  );
};

export const CurrentLine: React.FC<{
  currentTest?: Test;
  defaultInput?: string;
}> = ({ currentTest, defaultInput }) => {
  const { abort, processCommand, commandsHistory, autoComplete } =
    useTerminalStore(
      select("abort", "processCommand", "commandsHistory", "autoComplete")
    );
  const [historyPointer, setHistoryPointer] = useState(commandsHistory.length);

  const readline = useReadline({
    defaultInput,
    extraMacros: ({ terminate, input, setInput, setCaretPosition }) => [
      press(combine(ModifierKeys.CTRL, "c")).do(() => {
        terminate();
        abort();
      }),
      press(SpecialKeys.ENTER).do(() => {
        terminate();
        processCommand(input);
      }),
      press(SpecialKeys.TAB).do((event) => {
        event.preventDefault();

        if (input === "") return;
        const options = getSuggestions(input);
        if (options.length === 0) return;
        if (options.length === 1) {
          setInput(options[0]);
          setCaretPosition(options[0].length);
        } else {
          terminate();
          autoComplete(options);
        }
      }),
      press(SpecialKeys.ARROW_UP).do(() => {
        const command = getPreviousCommand(historyPointer, commandsHistory);
        setInput(command);
        if (command) {
          setCaretPosition(command.length);
        }

        if (historyPointer > 0) {
          setHistoryPointer(historyPointer - 1);
        }
      }),
      press(SpecialKeys.ARROW_DOWN).do(() => {
        const command = getNextCommand(historyPointer, commandsHistory);
        setInput(command);
        setCaretPosition(command ? command.length : 0);

        if (historyPointer + 1 <= commandsHistory.length) {
          setHistoryPointer(historyPointer + 1);
        }
      }),
    ],
  });

  return (
    <>
      <PrimaryPrompt test={currentTest}>
        <Readline {...readline} />
      </PrimaryPrompt>
    </>
  );
};

export default Terminal;
