import classNames from "classnames";
import { useState } from "react";
import shallow from "zustand/shallow";
import useAuthStore, { selectIsConnected } from "../../hooks/auth-store";
import useNavigationStore from "../../hooks/navigation-store";
import useTerminalStore from "../../hooks/terminal-store";
import { select } from "../../lib/utils/select";
import { InputGroup } from "../forms/input";
import CloseIcon from "../icons/close-icon";
import CopyIcon from "../icons/copy-icon";
import HostsIcon from "../icons/hosts-icon";
import styles from "./servers.module.css";

const Servers: React.FC = () => {
  const hideOverlay = useNavigationStore((state) => state.hideOverlay);

  const { write, takeControl } = useTerminalStore(
    select("write", "takeControl"),
    shallow
  );

  const { host, credentials, serverType } = useAuthStore(
    select("host", "credentials", "serverType"),
    shallow
  );

  const { isConnected, login, disconnect } = useAuthStore((state) => ({
    isConnected: selectIsConnected(state),
    login: state.login,
    disconnect: state.disconnect,
  }));

  const [type, setType] = useState(serverType);

  const handleSubmit: React.FormEventHandler<HTMLFormElement> = async (e) => {
    if (isConnected) {
      disconnect();
      return;
    }
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const host = formData.get("host") as string;
    const accountID = formData.get("accountID") as string;
    const token = formData.get("token") as string;
    const isLoggedIn = await login(
      { host, account: accountID, token, serverType: type },
      takeControl().signal
    );
    if (isLoggedIn) {
      write(
        <span style={{ color: "green" }}>
          Connecting to server {host as string}
        </span>
      );
    }
  };

  const copyText = async (text: string) => {
    await navigator.clipboard.writeText(
      (document.getElementsByName(text)[0] as HTMLInputElement).value
    );
  };

  return (
    <div
      className={styles.overlay}
      onClick={() => {
        hideOverlay();
      }}
    >
      <div className={styles.servers} onClick={(e) => e.stopPropagation()}>
        <div
          className={styles.closeIcon}
          onClick={() => {
            hideOverlay();
          }}
        >
          <CloseIcon className={styles.icon} />
        </div>
        <div className={styles.content}>
          <div className={styles.titleBar}>
            <HostsIcon className={styles.icon} />
            <h2 className={styles.title}>Servers</h2>
          </div>
          <p className={styles.description}>
            By default, Build is backed by the hosted Prelude Server. You can
            host alternative Server instances and log in below
          </p>
          <div className={styles.selection}>
            <p
              className={classNames(styles.server, {
                [styles.activeServer]: type === "prelude",
              })}
              onClick={() => {
                setType("prelude");
              }}
            >
              Prelude
            </p>
            <p
              className={classNames(styles.server, {
                [styles.activeServer]: type === "custom",
              })}
              onClick={() => {
                setType("custom");
              }}
            >
              Custom
            </p>
          </div>
          <form className={styles.form} onSubmit={handleSubmit}>
            <div>
              <label htmlFor="host" className={styles.label}>
                Host
              </label>
              {type === "prelude" ? (
                <InputGroup
                  type="url"
                  key={"prelude-host"}
                  name={"host"}
                  className={styles.input}
                  readOnly
                  defaultValue={host}
                />
              ) : (
                <InputGroup
                  type="url"
                  key={"custom-host"}
                  className={styles.input}
                  name={"host"}
                  placeholder="Enter an IP"
                  required
                />
              )}
            </div>
            <div>
              <label htmlFor="accountID" className={styles.label}>
                Account ID
              </label>
              <InputGroup
                defaultValue={credentials?.account ?? ""}
                type="text"
                name={"accountID"}
                className={styles.input}
                placeholder="Enter an account ID"
                required
                after={
                  <div onClick={() => copyText("username")}>
                    <CopyIcon className={styles.inputIcon} />
                  </div>
                }
              />
            </div>
            <div>
              <label htmlFor="token" className={styles.label}>
                Token
              </label>
              <InputGroup
                type="password"
                name={"token"}
                defaultValue={credentials?.token ?? ""}
                className={styles.input}
                placeholder="Enter a Token"
                required
                after={
                  <div onClick={() => copyText("token")}>
                    <CopyIcon className={styles.inputIcon} />
                  </div>
                }
              />
            </div>
            <button
              type="submit"
              className={classNames(styles.connect, {
                [styles.disconnect]: isConnected,
              })}
            >
              {isConnected ? "Disconnect" : "Connect"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Servers;
