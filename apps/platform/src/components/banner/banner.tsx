import { select, useAuthStore } from "@theprelude/core";
import React from "react";
import styles from "./banner.module.css";

const Banner: React.FC = () => {
  const { isAnonymous } = useAuthStore(select("isAnonymous"));

  if (!isAnonymous) return null;

  return (
    <div className={styles.banner}>
      <span className={styles.message}>
        Register an account using the account drop-down on the right to save
        your work.
      </span>
    </div>
  );
};

export default Banner;
