import { Popover } from "@headlessui/react";
import { useConfig } from "@theprelude/core";
import {
  CheckmarkIcon,
  ChevronIcon,
  CloseIcon,
  IconButton,
  PreludeIcon,
  UserIcon,
} from "@theprelude/ds";
import classNames from "classnames";
import { useState } from "react";
import styles from "./header.module.css";

const Header = () => {
  return (
    <header className={styles.header}>
      <section className={styles.brand}>
        <PreludeIcon className={styles.logo} />
        <span className={styles.divider} />
        <h4>Build</h4>
      </section>
      <section className={styles.right}>
        <Popover className={styles.account}>
          {({ open }) => (
            <>
              <Popover.Button className={styles.tag}>
                <UserIcon />
                <span>anonymous-user-23231</span>
                <ChevronIcon
                  className={classNames(styles.chevron, {
                    [styles.activeChevron]: open,
                  })}
                />
              </Popover.Button>
              <Popover.Panel className={styles.prompt}>
                {({ close }) => <Panel close={close} />}
              </Popover.Panel>
            </>
          )}
        </Popover>
      </section>
    </header>
  );
};

const Panel = ({ close }: { close: () => void }) => {
  const [overlay, setOverlay] = useState("options");
  return (
    <>
      {overlay === "options" && (
        <Options
          close={close}
          showAccountManager={() => setOverlay("accountManager")}
        />
      )}
      {overlay === "accountManager" && <AccountManager close={close} />}
    </>
  );
};

const Options: React.FC<{
  showAccountManager: () => void;
  close: () => void;
}> = ({ showAccountManager, close }) => {
  const { handleExport, handleImport } = useConfig();
  return (
    <div className={styles.options} onClick={(e) => e.stopPropagation()}>
      <a onClick={showAccountManager}>Create a handle</a>
      <div className={styles.divider} />
      <a
        onClick={() => {
          void handleImport();
          close();
        }}
      >
        Import credentials
      </a>
      <a
        onClick={() => {
          void handleExport();
          close();
        }}
      >
        Export credentials
      </a>
    </div>
  );
};

const AccountManager: React.FC<{
  close: () => void;
}> = ({ close }) => {
  const handleSubmit: React.FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault();
    close();
  };

  return (
    <div className={styles.create}>
      <div className={styles.title}>
        <span>Your Prelude Handle</span>
        <IconButton
          className={styles.close}
          icon={<CloseIcon />}
          onClick={close}
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
