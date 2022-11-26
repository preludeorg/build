import { Test } from "@theprelude/sdk";
import React, { useState } from "react";
import shallow from "zustand/shallow";
import useAuthStore from "../../hooks/auth-store";
import useTerminalStore, {
  getNextCommand,
  getPreviousCommand,
  getSuggestions,
} from "../../hooks/terminal-store";
import { combine, ModifierKeys, SpecialKeys, when } from "../../lib/keyboard";
import { select } from "../../lib/utils/select";
import focusTerminal from "../../utils/focus-terminal";
import PrimaryPrompt from "./primary-prompt";
import Readline, { useReadline } from "./readline";
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

  const readline = useReadline(
    defaultInput,
    ({ terminate, input, setInput, setCaretPosition }) => [
      when(combine(ModifierKeys.CTRL, "c")).do(() => {
        terminate();
        abort();
      }),
      when(SpecialKeys.ENTER).do(() => {
        terminate();
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
          terminate();
        }
      }),
      when(SpecialKeys.ARROW_UP).do(() => {
        const command = getPreviousCommand(historyPointer, commandsHistory);
        setInput(command);
        if (command) {
          setCaretPosition(command.length);
        }

        if (historyPointer > 0) {
          setHistoryPointer(historyPointer - 1);
        }
      }),
      when(SpecialKeys.ARROW_DOWN).do(() => {
        const command = getNextCommand(historyPointer, commandsHistory);
        setInput(command);
        setCaretPosition(command ? command.length : 0);

        if (historyPointer + 1 <= commandsHistory.length) {
          setHistoryPointer(historyPointer + 1);
        }
      }),
    ]
  );

  return (
    <>
      <PrimaryPrompt test={currentTest}>
        <Readline {...readline} />
      </PrimaryPrompt>
    </>
  );
};

export default Terminal;
