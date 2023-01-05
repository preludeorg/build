import { select, useAuthStore } from "@theprelude/core";
import { CloseIcon, IconButton } from "@theprelude/ds";
import React from "react";
import styles from "./banner.module.css";

const Banner: React.FC = () => {
  const [hide, setHide] = React.useState(false);
  const { isAnonymous } = useAuthStore(select("isAnonymous"));

  if (!isAnonymous || hide) return null;

  return (
    <div className={styles.banner}>
      <div className={styles.message}>
        <span>
          Register an account using the account drop-down on the right to save
          your work.
        </span>
        <a href="https://docs.prelude.org/docs/prelude-account" target="_blank">
          Click here to learn more.
        </a>
      </div>

      <IconButton icon={<CloseIcon />} onClick={() => setHide(true)} />
    </div>
  );
};

export default Banner;
