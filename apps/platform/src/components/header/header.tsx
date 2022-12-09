import { Popover } from "@headlessui/react";
import { select, useAuthStore, useConfig } from "@theprelude/core";
import {
  CheckmarkIcon,
  ChevronIcon,
  CloseIcon,
  IconButton,
  Input,
  Loading,
  notifySuccess,
  PreludeIcon,
  UserIcon,
} from "@theprelude/ds";
import classNames from "classnames";
import { useState } from "react";
import styles from "./header.module.css";

/** TODO: Warn then clean up account */
// window.onbeforeunload = (e) => {
//   e.cancelBubble = false;

//   console.log(e);
//   return "Hlelo";
// };

const Header = () => {
  const { initializing, handle, credentials, initialize, isAnonymous } =
    useAuthStore(
      select(
        "initializing",
        "handle",
        "credentials",
        "initialize",
        "isAnonymous"
      )
    );

  const noUser = !initializing && !credentials;
  return (
    <header className={styles.header}>
      <section className={styles.brand}>
        <PreludeIcon className={styles.logo} />
        <span className={styles.divider} />
        <h4>Build</h4>
      </section>
      <section className={styles.right}>
        {noUser ? (
          <div className={styles.account}>
            <button
              onClick={() => {
                void initialize();
              }}
              className={styles.tag}
            >
              <span>Failed to create an account. Click to try again.</span>
            </button>
          </div>
        ) : (
          <Popover className={styles.account}>
            {({ open }) => (
              <>
                <Popover.Button
                  disabled={initializing || noUser}
                  className={classNames(styles.tag, {
                    [styles.anonymous]: isAnonymous,
                  })}
                >
                  {initializing ? (
                    <Loading />
                  ) : (
                    <>
                      <UserIcon />
                      <span>{handle}</span>
                      <ChevronIcon
                        className={classNames(styles.chevron, {
                          [styles.activeChevron]: open,
                        })}
                      />
                    </>
                  )}
                </Popover.Button>
                <Popover.Panel className={styles.prompt}>
                  {({ close }) => <Panel close={close} />}
                </Popover.Panel>
              </>
            )}
          </Popover>
        )}
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
  const { isAnonymous } = useAuthStore(select("isAnonymous"));
  const { handleExport, handleImport } = useConfig();
  return (
    <div className={styles.options} onClick={(e) => e.stopPropagation()}>
      <a onClick={showAccountManager}>
        {isAnonymous ? "Create a handle" : "Update handle"}
      </a>
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
  const [handle, setHandle] = useState("");
  const { changeHandle } = useAuthStore(select("changeHandle"));

  /** TODO: Use mutate to change handle */
  // const { mutate, isLoading } = useMutation((handle: string) => handle, {
  //   onSuccess: async () => {
  //     close();
  //   },
  //   onError: (e) => {
  //     notifyError("Failed to delete security test variant.", e);
  //   },
  // });

  const handleSubmit: React.FormEventHandler<HTMLFormElement> = (e) => {
    e.preventDefault();
    changeHandle(handle);
    close();
    notifySuccess("Handle updated successfully");
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
        <Input
          ref={(el) => el?.focus()}
          type="text"
          name="handle"
          placeholder="Type your handle"
          onChange={(e) => setHandle(e.target.value)}
        />
        <IconButton
          className={styles.checkmark}
          type="submit"
          icon={<CheckmarkIcon />}
          disabled={handle === ""}
          intent="secondary"
        />
      </form>
    </div>
  );
};

export default Header;
