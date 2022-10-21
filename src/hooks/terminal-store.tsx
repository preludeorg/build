import create from "zustand";

interface TerminalStore {
  focused: boolean;
  input: string;
  processInput: boolean;
  caretPosition: number;
  beforeCaretText: string;
  afterCaretText: string;
  bufferedContent: string | JSX.Element;
  setProperty<T extends TerminalStore, K extends keyof T, V extends T[K]>(
    key: K,
    value: V
  ): void;
  clear: () => void;
  wait: (content: JSX.Element) => void;
}

const useTerminalStore = create<TerminalStore>((set) => ({
  focused: false,
  input: "",
  processInput: false,
  caretPosition: 0,
  beforeCaretText: "",
  afterCaretText: "",
  bufferedContent: "",
  setProperty(key, value) {
    set(() => ({ [key]: value }));
  },
  clear() {
    set(() => ({
      bufferedContent: "",
      input: "",
      processInput: false,
      caretPosition: 0,
      beforeCaretText: "",
      afterCaretText: "",
    }));
  },
  wait(content) {
    set(() => ({
      bufferedContent: content,
      input: "",
      caretPosition: 0,
      beforeCaretText: "",
      afterCaretText: "",
    }));
  },
}));

export default useTerminalStore;
