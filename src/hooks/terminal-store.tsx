import { Test } from "@theprelude/sdk";
import create from "zustand";
import { CurrentLine } from "../components/terminal/terminal";
import { TerminalMessage } from "../components/terminal/terminal-message";
import { commands } from "../lib/commands";
import { commonBeginning } from "../lib/utils/common-beginning";

export function splitStringAtIndex(value: string, index: number) {
  if (!value) {
    return ["", ""];
  }
  return [value.substring(0, index), value.substring(index)];
}

export function getSuggestions(input: string) {
  return Object.keys(commands).filter((o) => o.startsWith(input));
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
  abortController?: AbortController;
  setFocus: (focused: boolean) => void;
  clear: () => void;
  reset: () => void;
  processCommand: (input: string) => void;
  write: (content: string | JSX.Element) => void;
  switchTest: (test?: Test) => void;
  autoComplete: (options: string[]) => void;
  takeControl: () => AbortController;
  abort: () => void;
  statusIndicator?: {
    message: string;
    loading: boolean;
  };
  showIndicator: (message: string) => void;
  hideIndicator: () => void;
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
  autoComplete: (options: string[]) => {
    set((state) => {
      return {
        bufferedContent: [
          ...state.bufferedContent,
          <div style={{ color: "var(--color-primary-10)" }}>
            {options.join(" ")}
          </div>,
          <CurrentLine input={commonBeginning(options)} />,
        ],
      };
    });
  },
  takeControl() {
    const { abortController } = get();
    /** abort previous requests */
    abortController?.abort();

    const controller = new AbortController();
    set(() => ({ abortController: controller }));
    return controller;
  },
  abort: () => {
    const { abortController } = get();
    abortController?.abort();

    set((state) => {
      return {
        bufferedContent: [
          ...state.bufferedContent,
          <CurrentLine key={Date.now()} currentTest={state.currentTest} />,
        ],
      };
    });
  },
  clear() {
    set(() => ({
      bufferedContent: [],
      input: "",
      caretPosition: 0,
    }));
  },
  reset() {
    set(() => ({
      currentTest: undefined,
      bufferedContent: [],
      input: "",
      caretPosition: 0,
    }));
  },
  switchTest(test?: Test) {
    set(() => ({ currentTest: test }));
  },

  async processCommand(input) {
    try {
      const { commandsHistory } = get();
      const [commandName, ...rest] = input.trim().split(" ");
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

      if (commandName === "clear") {
        set((state) => ({
          bufferedContent: [
            <CurrentLine key={Date.now()} currentTest={state.currentTest} />,
          ],
        }));
        return;
      }

      if (commandName === "") {
        set((state) => ({
          bufferedContent: [
            ...state.bufferedContent,
            <CurrentLine key={Date.now()} currentTest={state.currentTest} />,
          ],
        }));
        return;
      }

      const commandArguments = rest.join(" ");
      const commandKey = Object.keys(commands).find(
        (c) => commandName === c || commands[c].alias?.includes(commandName)
      );
      const command = commandKey ? commands[commandKey] : null;
      const isEnabled = command?.enabled?.() ?? true;

      if (command && isEnabled) {
        output = await command.exec(commandArguments);
      } else if (command && !isEnabled) {
        output = (
          <TerminalMessage
            message={`command "${commandName}" is unavailable.`}
            helpText={`type "help" to list avaliable commmands`}
          />
        );
      } else {
        output = `command not found: ${commandName}`;
      }

      set((state) => {
        const nextBufferedContent = <span>{output}</span>;
        return {
          bufferedContent: [
            ...state.bufferedContent,
            nextBufferedContent,
            <CurrentLine currentTest={state.currentTest} />,
          ],
        };
      });
    } catch (err) {}
  },
  write(content) {
    set((state) => ({
      bufferedContent: [...state.bufferedContent, content],
    }));
  },
  showIndicator(message) {
    set(() => {
      return {
        statusIndicator: { message: message, loading: true },
      };
    });
  },
  hideIndicator() {
    set(() => {
      return {
        statusIndicator: { message: "", loading: false },
      };
    });
  },
}));

export const getPreviousCommand = (
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

export const getNextCommand = (
  historyPointer: number,
  commandsHistory: string[]
) => {
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
