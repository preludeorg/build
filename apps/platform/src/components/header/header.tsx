import {
  CheckmarkIcon,
  ChevronIcon,
  CloseIcon,
  IconButton,
  PreludeIcon,
  UserIcon,
} from "@theprelude/ds";
import { useState } from "react";
import styles from "./header.module.css";

const Header: React.FC = () => {
  const [optionsVisible, setOptionsVisible] = useState(false);
  const [managerVisible, setManagerVisible] = useState(false);

  const handleManager = () => {
    setOptionsVisible(false);
    setManagerVisible(true);
  };

  const handleClose: React.MouseEventHandler<HTMLButtonElement> = (e) => {
    e.stopPropagation();
    setOptionsVisible(false);
    setManagerVisible(false);
  };

  const handleSubmit: React.FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const handle = formData.get("handle") as string;
  };

  return (
    <header className={styles.header}>
      <section className={styles.brand}>
        <PreludeIcon className={styles.logo} />
        <span className={styles.divider} />
        <h1>Build</h1>
      </section>
      <section className={styles.right}>
        <div
          onClick={() => setOptionsVisible(!optionsVisible)}
          className={styles.account}
        >
          <UserIcon />
          <span>anonymous-user-23231</span>
          <ChevronIcon
            className={
              optionsVisible === true || managerVisible === true
                ? styles.activeChevron
                : ""
            }
          />
          {optionsVisible && (
            <div
              className={styles.options}
              onClick={(e) => e.stopPropagation()}
            >
              <span onClick={handleManager}>Create a handle</span>
              <div className={styles.divider} />
              <span>Import credentials</span>
              <span>Export credentials</span>
            </div>
          )}
          {managerVisible && (
            <div className={styles.create}>
              <div className={styles.title}>
                <span>Your Prelude Handle</span>
                <IconButton
                  className={styles.close}
                  icon={<CloseIcon />}
                  onClick={handleClose}
                />
              </div>
              <div className={styles.divider} />
              <p>
                You can change your handle at any time to access the tests you
                create and run.
              </p>
              <form onSubmit={handleSubmit}>
                <input type="text" name={"handle"}></input>
                <IconButton
                  type="submit"
                  icon={<CheckmarkIcon />}
                  intent="secondary"
                />
              </form>
            </div>
          )}
        </div>
      </section>
    </header>
  );
};

export default Header;
