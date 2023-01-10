import { Popover } from "@headlessui/react";
import { useMutation } from "@tanstack/react-query";
import {
  authState,
  changeUserHandle,
  purgeAccount,
  select,
  useAuthStore,
  useConfig,
} from "@theprelude/core";
import {
  CheckmarkIcon,
  ChevronIcon,
  CloseIcon,
  IconButton,
  Input,
  Loading,
  notifyError,
  notifySuccess,
  PreludeIcon,
  UserIcon,
} from "@theprelude/ds";
import classNames from "classnames";
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import styles from "./header.module.css";

const Header = () => {
  const {
    initializing,
    handle,
    credentials,
    initialize,
    isAnonymous,
    dataLossWarning,
  } = useAuthStore(
    select(
      "initializing",
      "handle",
      "credentials",
      "initialize",
      "isAnonymous",
      "dataLossWarning"
    )
  );

  const location = useLocation();

  const titles: Record<string, string> = {
    "/": "Welcome",
    "/build": "Build",
  };

  const handleBeforeUnload = (e: BeforeUnloadEvent) => {
    const { isAnonymous, setDataLossWarning } = authState();

    if (isAnonymous) {
      e.preventDefault();
      setDataLossWarning(true);
      return (e.returnValue = "are you sure?");
    }

    return void 0;
  };

  const handleUnload = async () => {
    const { isAnonymous, host, credentials } = authState();
    if (isAnonymous) {
      await purgeAccount({ host, credentials });
    }
  };

  useEffect(() => {
    window.addEventListener("beforeunload", handleBeforeUnload);
    window.addEventListener("unload", handleUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      window.removeEventListener("unload", handleUnload);
    };
  }, []);

  const noUser = !initializing && !credentials;
  return (
    <header className={styles.header}>
      <section className={styles.brand}>
        <PreludeIcon className={styles.logo} />
        <span className={styles.divider} />
        <h4>{titles[location.pathname] ?? ""}</h4>
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
                <Popover.Panel
                  static={dataLossWarning}
                  className={styles.prompt}
                >
                  {({ close }) => (
                    <Panel showWarning={dataLossWarning} close={close} />
                  )}
                </Popover.Panel>
              </>
            )}
          </Popover>
        )}
      </section>
    </header>
  );
};

const Panel = ({
  close,
  showWarning,
}: {
  close: () => void;
  showWarning?: boolean;
}) => {
  const [overlay, setOverlay] = useState("options");

  if (overlay === "accountManager" || showWarning) {
    return <AccountManager close={close} />;
  }

  return (
    <Options
      close={close}
      showAccountManager={() => setOverlay("accountManager")}
    />
  );
};

const Options: React.FC<{
  showAccountManager: () => void;
  close: () => void;
}> = ({ showAccountManager, close }) => {
  const { isAnonymous, handle, credentials } = useAuthStore(
    select("isAnonymous", "handle", "credentials")
  );
  const { handleExport, handleImport } = useConfig();
  return (
    <div className={styles.options} onClick={(e) => e.stopPropagation()}>
      <div className={styles.userCard}>
        <span>Handle</span>
        <p>{handle}</p>
        <span>Account ID</span>
        <p>{credentials?.account}</p>
      </div>
      <div className={styles.divider} />
      <a onClick={showAccountManager}>
        {isAnonymous ? "Register account" : "Update account info"}
      </a>

      <a
        onClick={() => {
          void handleImport();
          close();
        }}
      >
        Import credentials
      </a>
      {!isAnonymous && (
        <a
          onClick={() => {
            void handleExport();
            close();
          }}
        >
          Export credentials
        </a>
      )}
    </div>
  );
};

const AccountManager: React.FC<{
  close: () => void;
}> = ({ close }) => {
  const [handle, setHandle] = useState("");
  const {
    changeHandle,
    isAnonymous,
    host,
    credentials,
    handle: fromHandle,
    setDataLossWarning,
    dataLossWarning,
  } = useAuthStore(
    select(
      "changeHandle",
      "isAnonymous",
      "host",
      "credentials",
      "handle",
      "setDataLossWarning",
      "dataLossWarning"
    )
  );

  const { mutate, isLoading } = useMutation(
    (handle: string) => {
      if (!fromHandle) {
        throw new Error("expected user to have a handle");
      }
      return changeUserHandle(handle, fromHandle, { host, credentials });
    },
    {
      onSuccess: async ({ token }) => {
        close();
        setDataLossWarning(false);
        changeHandle(handle, token);
        notifySuccess("Handle updated successfully");
      },
      onError: (e) => {
        notifyError("Failed to change user handle.", e);
      },
    }
  );

  const handleSubmit: React.FormEventHandler<HTMLFormElement> = (e) => {
    e.preventDefault();
    mutate(handle);
  };

  const setAccountMessage = () => {
    if (dataLossWarning) {
      return "Create a handle to persist your account. Otherwise your account will not exist beyond this session";
    }
    if (isAnonymous) {
      return "Set your account handle to save your tests.";
    } else {
      return "Change your account handle and credentials.";
    }
  };

  return (
    <div className={styles.create}>
      <div className={styles.title}>
        <span>Your Prelude Handle</span>
        <IconButton
          className={styles.close}
          icon={<CloseIcon />}
          onClick={() => {
            setDataLossWarning(false);
            close();
          }}
        />
      </div>
      <div className={styles.divider} />
      <p>{setAccountMessage()}</p>
      <form onSubmit={handleSubmit}>
        <Input
          ref={(el) => el?.focus()}
          type="text"
          name="handle"
          placeholder="Type your handle"
          onChange={(e) => setHandle(e.target.value)}
        />
        <IconButton
          loading={isLoading}
          className={styles.checkmark}
          type="submit"
          icon={<CheckmarkIcon />}
          disabled={handle === "" || isLoading}
          intent="secondary"
        />
      </form>
    </div>
  );
};

export default Header;
