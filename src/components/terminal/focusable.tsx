import { InputHTMLAttributes, useEffect, useRef, useState } from "react";
import useTerminalStore from "../../hooks/terminal-store";
import { select } from "../../lib/utils/select";
import styles from "./terminal.module.css";

type Props = InputHTMLAttributes<HTMLInputElement> & {
  render: (props: { focused: boolean }) => JSX.Element;
};

const Focusable: React.FC<Props> = ({ render, ...props }) => {
  const ref = useRef<HTMLInputElement>(null);
  const [focused, setFocused] = useState(false);

  const handleFocus = () => {
    setFocused(true);
  };

  const handleBlur = () => {
    setFocused(false);
  };

  const { setFocusable } = useTerminalStore(
    select(
      "abort",
      "processCommand",
      "commandsHistory",
      "autoComplete",
      "setFocusable",
      "hasFocusable"
    )
  );

  useEffect(() => {
    setFocusable(true);
    ref.current?.focus({ preventScroll: true });

    () => {
      setFocusable(false);
    };
  }, [ref]);

  return (
    <div className={styles.focusable}>
      <input
        className="focusable"
        type="text"
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="off"
        spellCheck="false"
        {...props}
        ref={ref}
        onBlur={handleBlur}
        onFocus={handleFocus}
        style={{
          position: "absolute",
          bottom: "-16px",
          left: "-2000px",
        }}
      />
      {render({ focused })}
    </div>
  );
};

export default Focusable;
