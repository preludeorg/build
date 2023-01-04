import styles from "./banner.module.css";
import React from "react";

const Banner = React.forwardRef<HTMLDivElement>(({}, ref) => {
  return (
    <div ref={ref} className={styles.banner}>
      <span className={styles.message}>
        Register an account using the account drop-down on the right to save
        your work.
      </span>
    </div>
  );
});

export default Banner;
