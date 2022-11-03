import { useState } from "react";
import { InputGroup } from "../forms/input";
import HostsIcon from "../icons/hosts-icon";
import CloseIcon from "../icons/close-icon";
import CopyIcon from "../icons/copy-icon";
import styles from "./servers.module.css";
import cx from "classnames";
import useTerminalStore from "../../hooks/terminal-store";
import useAuthStore, { selectIsConnected } from "../../hooks/auth-store";

const Servers: React.FC<{ toggleServerPanel: () => void }> = ({
  toggleServerPanel,
}) => {
  const write = useTerminalStore((state) => state.write);
  const { host, credentials, serverType } = useAuthStore((state) => ({
    host: state.host,
    credentials: state.credentials,
    serverType: state.serverType,
  }));

  const isConnected = useAuthStore(selectIsConnected);
  const login = useAuthStore((state) => state.login);
  const disconnect = useAuthStore((state) => state.disconnect);
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
    const isLoggedIn = await login(host, accountID, token, type);
    if (isLoggedIn) {
      write(
        <span style={{ color: "green" }}>
          Connecting to server {host as string}
        </span>
      );
    }
  };

  const copyText = (text: string) => {
    navigator.clipboard.writeText(
      (document.getElementsByName(text)[0] as HTMLInputElement).value
    );
  };

  return (
    <div
      className={styles.overlay}
      onClick={(e) => {
        toggleServerPanel();
      }}
    >
      <div className={styles.servers} onClick={(e) => e.stopPropagation()}>
        <div
          className={styles.closeIcon}
          onClick={(e) => {
            toggleServerPanel();
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
              className={cx(styles.server, {
                [styles.activeServer]: type === "prelude",
              })}
              onClick={() => {
                setType("prelude");
              }}
            >
              Prelude
            </p>
            <p
              className={cx(styles.server, {
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
              className={cx(styles.connect, {
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
