import React from "react";
import shallow from "zustand/shallow";
import useTerminalStore, { selectCaretText } from "../../hooks/terminal-store";
import styles from "./terminal.module.css";
import classNames from "classnames";
import PrimaryPrompt from "./primary-prompt";
import useAuthStore from "../../hooks/auth-store";
import WelcomeMessage from "./welcome-message";
import focusTerminal from "../../utils/focus-terminal";
import { isControlC } from "../../lib/keys";
import { select } from "../../lib/utils/select";
import VariantResults from "./variant-results";

const useScrollToBottom = (changesToWatch: any, wrapperRef: any) => {
  React.useEffect(() => {
    if (!wrapperRef.current) return;
    wrapperRef.current.scrollTop = wrapperRef.current.scrollHeight;
  }, [changesToWatch]);
};

function useTerminal() {
  const ref = React.useRef<HTMLDivElement>(null);

  const { bufferedContent, inputEnabled } = useTerminalStore(
    select("bufferedContent", "inputEnabled"),
    shallow
  );

  const {
    abort,
    setFocus,
    handleKey,
    processCommand,
    write,
    clear,
    autoComplete,
  } = useTerminalStore(
    select(
      "abort",
      "setFocus",
      "handleKey",
      "processCommand",
      "write",
      "clear",
      "autoComplete"
    ),
    shallow
  );

  const { host, credentials } = useAuthStore(
    select("host", "credentials"),
    shallow
  );

  const handleKeyDownEvent = (event: KeyboardEvent) => {
    if (isControlC(event)) {
      abort();
      return;
    }

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
    write(<WelcomeMessage host={host} credentials={credentials} />);
    return () => {
      clear();
    };
  }, []);

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
    <div
      onFocus={(e) => {
        e.preventDefault();
        focusTerminal();
      }}
      id="terminal"
      tabIndex={0}
      ref={ref}
      className={styles.terminal}
    >
      {bufferedContent.map((el, index) => {
        return <React.Fragment key={index}>{el}</React.Fragment>;
      })}
      <CurrentLine />
    </div>
  );
};

const CurrentLine = () => {
  const { focused, inputEnabled, currentTest } = useTerminalStore(
    select("focused", "inputEnabled", "currentTest"),
    shallow
  );

  const [beforeCaretText, afterCaretText] = useTerminalStore(
    selectCaretText,
    shallow
  );

  if (!inputEnabled) {
    return <></>;
  }

  return (
    <>
    <PrimaryPrompt test={currentTest}>
      <span className={styles.preWhiteSpace}>{beforeCaretText}</span>
      <span className={classNames(styles.caret, { [styles.focused]: focused })}>
        <span className={styles.caretAfter} />
      </span>
      <span className={styles.preWhiteSpace}>{afterCaretText}</span>
    </PrimaryPrompt>
    <VariantResults results={results}/>
    </>
  );
};

const results = [
  {
    name: "2613fbc3-8e41-45de-afac-fcc5b0b7332b_linux_linux-x86_64",
    steps: [
      {
        step: "COMPILE",
        status: 0,
        output: "",
        duration: "3.732",
      },
      {
        step: "SCAN",
        status: 0,
        output: ["Duis mollis, est non commodo luctus, nisi erat porttitor ligula, eget lacinia odio sem nec el Duis mollis, est non commodo luctus, nisi erat porttitor ligula, eget lacinia odio sem nec el","Duis mollis, est non commodo luctus, nisi erat porttitor ligula, eget lacinia odio sem nec el Duis mollis, est non commodo luctus, nisi erat porttitor ligula, eget lacinia odio sem nec el"],
        duration: "0.235",
      },
      {
        step: "PUBLISH",
        status: 0,
        output: "",
        duration: "0.224",
      },
    ],
  },
  {
    name: "2613fbc3-8e41-45de-afac-fcc5b0b7332b_linux_linux-arm64",
    steps: [
      {
        step: "COMPILE",
        status: 0,
        output: "Hello this is a test",
        duration: "3.823",
      },
      {
        step: "SCAN",
        status: 1,
        output: ["Duis mollis, est non commodo luctus, nisi erat porttitor ligula, eget lacinia odio sem nec el Duis mollis, est non commodo luctus, nisi erat porttitor ligula, eget lacinia odio sem nec el","Duis mollis, est non commodo luctus, nisi erat porttitor ligula, eget lacinia odio sem nec el Duis mollis, est non commodo luctus, nisi erat porttitor ligula, eget lacinia odio sem nec el"],
        duration: "0.117",
      },
      {
        step: "PUBLISH",
        status: 1,
        output: "Duis mollis, est non commodo luctus, nisi erat porttitor ligula, eget lacinia odio sem nec el Duis mollis, est non commodo luctus, nisi erat porttitor ligula, eget lacinia odio sem nec el",
        duration: "0.198",
      },
    ],
  },
];

export default Terminal;
