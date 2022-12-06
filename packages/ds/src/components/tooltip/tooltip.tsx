import classNames from "classnames/bind";
import React, { useState } from "react";
import styles from "./tooltip.module.css";

const cx = classNames.bind(styles);

export const Tooltip: React.FC<{
  message: string;
  children: React.ReactNode;
  position?: "top" | "bottom";
  show?: boolean;
}> = ({ message, children, position = "top", show = true }) => {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      className={styles.container}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {hovered && show && (
        <div className={cx("tooltip", position)}>{message}</div>
      )}
      {children}
    </div>
  );
};
