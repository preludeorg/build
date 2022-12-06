import {
  CheckmarkIcon,
  ChevronIcon,
  CloseIcon,
  IconButton,
  PreludeIcon,
  UserIcon,
} from "@theprelude/ds";
import { Popover } from "@headlessui/react";
import { useState } from "react";
import styles from "./header.module.css";
import classNames from "classnames";

const Header = () => {
  const [overlay, setOverlay] = useState("");
  return (
    <header className={styles.header}>
      <section className={styles.brand}>
        <PreludeIcon className={styles.logo} />
        <span className={styles.divider} />
        <h1>Build</h1>
      </section>
      <section className={styles.right}>
        <Popover className={styles.account}>
          <Popover.Button
            className={styles.tag}
            onClick={() => {
              overlay === "" ? setOverlay("options") : setOverlay("");
            }}
          >
            <UserIcon />
            <span>anonymous-user-23231</span>
            <ChevronIcon
              className={classNames(styles.chevron, {
                [styles.activeChevron]: overlay !== "",
              })}
            />
          </Popover.Button>
          <Popover.Panel className={styles.prompt}>
            {() => (
              <>
                {overlay === "options" && <Options setOverlay={setOverlay} />}

                {overlay === "accountManager" && (
                  <AccountManager setOverlay={setOverlay} />
                )}
              </>
            )}
          </Popover.Panel>
        </Popover>
      </section>
    </header>
  );
};

const Options: React.FC<{
  setOverlay: (o: string) => void;
}> = ({ setOverlay }) => {
  return (
    <div className={styles.options} onClick={(e) => e.stopPropagation()}>
      <span onClick={() => setOverlay("accountManager")}>Create a handle</span>
      <div className={styles.divider} />
      <span>Import credentials</span>
      <span>Export credentials</span>
    </div>
  );
};

const AccountManager: React.FC<{
  setOverlay: (o: string) => void;
}> = ({ setOverlay }) => {
  const handleSubmit: React.FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const handle = formData.get("handle") as string;
  };

  return (
    <div className={styles.create}>
      <div className={styles.title}>
        <span>Your Prelude Handle</span>
        <IconButton
          className={styles.close}
          icon={<CloseIcon />}
          onClick={() => setOverlay("")}
        />
      </div>
      <div className={styles.divider} />
      <p>
        You can change your handle at any time to access the tests you create
        and run.
      </p>
      <form onSubmit={handleSubmit}>
        <input type="text" name={"handle"}></input>
        <IconButton
          className={styles.checkmark}
          type="submit"
          icon={<CheckmarkIcon />}
          intent="secondary"
        />
      </form>
    </div>
  );
};

export default Header;
