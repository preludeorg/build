import { Test } from "@theprelude/sdk";
import create from "zustand";
import { commands } from "../components/terminal/commands";
import PrimaryPrompt from "../components/terminal/primary-prompt";
import styles from "../components/terminal/terminal.module.css";

function splitStringAtIndex(value: string, index: number) {
  if (!value) {
    return ["", ""];
  }
  return [value.substring(0, index), value.substring(index)];
}

interface TerminalStore {
  currentTest?: Test;
  focused: boolean;
  inputEnabled: boolean;
  input: string;
  caretPosition: number;
  commandsHistory: string[];
  historyPointer: number;
  bufferedContent: Array<string | JSX.Element>;
  setFocus: (focused: boolean) => void;
  clear: () => void;
  handleKey: (event: KeyboardEvent) => Promise<void>;
  processCommand: () => void;
  write: (content: string | JSX.Element) => void;
  switchTest: (test?: Test) => void;
  autoComplete: () => void;
}

const useTerminalStore = create<TerminalStore>((set, get) => ({
  inputEnabled: true,
  focused: false,
  input: "",
  caretPosition: 0,
  bufferedContent: [],
  commandsHistory: [],
  historyPointer: 0,
  setFocus: (focused: boolean) => {
    set(() => ({ focused }));
  },
  autoComplete: () => {
    const { input } = get();
    const options = Object.keys(commands).filter((o) => o.startsWith(input));
    if (options.length === 1) {
      set(() => ({
        input: options[0],
        caretPosition: options[0].length + 1,
      }));
    } else {
      set((state) => {
        const waiting = (
          <>
            <PrimaryPrompt ttp={state.currentTTP}>
              <span className={styles.preWhiteSpace}>{input}</span>
            </PrimaryPrompt>
            <div style={{ color: "var(--color-primary-10)" }}>
              {options.join(" ")}
            </div>
          </>
        );

        return {
          bufferedContent: [...state.bufferedContent, waiting],
        };
      });
    }
  },
  clear() {
    set(() => ({
      bufferedContent: [],
      input: "",
      caretPosition: 0,
    }));
  },
  switchTest(test?: Test) {
    set(() => ({ currentTest: test }));
  },
  async handleKey(event: KeyboardEvent) {
    const { focused, inputEnabled } = get();
    if (!focused || !inputEnabled) {
      return;
    }

    const eventKey = event.key;

    let { input, caretPosition, historyPointer, commandsHistory } = get();
    let nextInput: string | null = null;

    if (eventKey === "Backspace") {
      const [caretTextBefore, caretTextAfter] = splitStringAtIndex(
        input,
        caretPosition
      );
      nextInput = caretTextBefore.slice(0, -1) + caretTextAfter;
      if (input && input.length !== 0) {
        caretPosition = caretPosition - 1;
      }
    } else if (eventKey === "ArrowUp") {
      nextInput = getPreviousCommand(historyPointer, commandsHistory);
      if (historyPointer > 0) {
        historyPointer = historyPointer - 1;
      }
      if (nextInput) {
        caretPosition = nextInput.length;
      }
    } else if (eventKey === "ArrowDown") {
      nextInput = getNextCommand(historyPointer, commandsHistory);
      if (historyPointer + 1 <= commandsHistory.length) {
        historyPointer = historyPointer + 1;
      }
      if (nextInput) {
        caretPosition = nextInput.length;
      } else {
        caretPosition = 0;
      }
    } else if (eventKey === "ArrowLeft") {
      if (caretPosition > 0) {
        caretPosition = caretPosition - 1;
      }
      nextInput = input;
    } else if (eventKey === "ArrowRight") {
      if (caretPosition < input.length) {
        caretPosition = caretPosition + 1;
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
      caretPosition = caretPosition + pastedText.length;
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
        caretPosition = caretPosition + 1;
      } else {
        nextInput = input;
      }
    }
    set(() => ({
      input: nextInput ?? "",
      processInput: false,
      caretPosition,
      historyPointer,
    }));
  },
  async processCommand() {
    const { input, commandsHistory } = get();
    const [command, ...rest] = input.trim().split(" ");
    let output: string | JSX.Element = "";

    if (input !== "") {
      set(() => {
        const commands = [...commandsHistory, input];
        return {
          commandsHistory: commands,
          historyPointer: commands.length,
        };
      });
    }

    if (command === "clear") {
      set(() => ({
        bufferedContent: [],
        input: "",
        caretPosition: 0,
      }));
      return;
    }

    set((state) => {
      const waiting = (
        <PrimaryPrompt test={state.currentTest}>
          <span className={styles.preWhiteSpace}>{input}</span>
        </PrimaryPrompt>
      );

      return {
        bufferedContent: [...state.bufferedContent, waiting],
        input: "",
        caretPosition: 0,
        inputEnabled: false,
      };
    });

    if (input) {
      const commandArguments = rest.join(" ");

      if (command && commands[command]) {
        const executor = commands[command].exec;

        if (typeof executor === "function") {
          output = await executor(commandArguments);
        } else {
          output = executor;
        }
      } else {
        output = `command "${command}" is not recognized`;
      }
    }

    set((state) => {
      const nextBufferedContent = output ? <span>{output}</span> : <></>;

      return {
        bufferedContent: [...state.bufferedContent, nextBufferedContent],
        input: "",
        inputEnabled: true,
      };
    });
  },
  write(content) {
    set((state) => ({
      bufferedContent: [...state.bufferedContent, content],
    }));
  },
}));

const getPreviousCommand = (
  historyPointer: number,
  commandsHistory: string[]
) => {
  if (historyPointer === 0) {
    if (commandsHistory.length === 0) {
      return "";
    }

    return commandsHistory[0];
  }

  const command = commandsHistory[historyPointer - 1];

  return command;
};

const getNextCommand = (historyPointer: number, commandsHistory: string[]) => {
  if (historyPointer + 1 <= commandsHistory.length) {
    const command = commandsHistory[historyPointer + 1];

    return command;
  }

  return "";
};

export default useTerminalStore;

export const selectCaretText = (state: TerminalStore) => {
  const [beforeCaretText, afterCaretText] = splitStringAtIndex(
    state.input,
    state.caretPosition
  );

  return [beforeCaretText, afterCaretText];
};

export const terminalState = () => useTerminalStore.getState();
