import { useState } from "react";
import { InputGroup } from "../forms/input";
import HostsIcon from "../icons/hosts-icon";
import CloseIcon from "../icons/close-icon";
import CopyIcon from "../icons/copy-icon";
import styles from "./servers.module.css";
import cx from "classnames";
import useTerminalStore from "../../hooks/terminal-store";

const Servers: React.FC<{ toggleServerPanel: () => void }> = ({
  toggleServerPanel,
}) => {
  const [serverType, setServerType] = useState("prelude");
  const write = useTerminalStore((state) => state.write);

  const handleSubmit: React.FormEventHandler<HTMLFormElement> = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const server = formData.get("server");
    const username = formData.get("username");
    const token = formData.get("token");

    write(
      <span style={{ color: "green" }}>
        connecting to server {server as string}
      </span>
    );
    toggleServerPanel();
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
            By default, Operator is backed by the hosted Prelude Server. You can
            host alternative Server instances and log in below
          </p>
          <div className={styles.selection}>
            <p
              className={cx(styles.server, {
                [styles.activeServer]: serverType === "prelude",
              })}
              onClick={() => {
                setServerType("prelude");
              }}
            >
              Prelude
            </p>
            <p
              className={cx(styles.server, {
                [styles.activeServer]: serverType === "custom",
              })}
              onClick={() => {
                setServerType("custom");
              }}
            >
              Custom
            </p>
          </div>
          <form className={styles.form} onSubmit={handleSubmit}>
            <div>
              <label htmlFor="server" className={styles.label}>
                Server
              </label>
              {serverType === "prelude" ? (
                <InputGroup
                  type="url"
                  key={"prelude-server"}
                  name={"server"}
                  className={styles.input}
                  readOnly
                  value={"testserver.prelude.org"}
                />
              ) : (
                <InputGroup
                  type="url"
                  key={"custom-server"}
                  className={styles.input}
                  name={"server"}
                  placeholder="Enter an IP"
                  required
                />
              )}
            </div>
            <div>
              <label htmlFor="username" className={styles.label}>
                Username
              </label>
              <InputGroup
                type="text"
                name={"username"}
                className={styles.input}
                placeholder="Enter an account ID"
                required
                after={<CopyIcon className={styles.inputIcon} />}
              />
            </div>
            <div>
              <label htmlFor="token" className={styles.label}>
                Token
              </label>
              <InputGroup
                type="text"
                name={"token"}
                className={styles.input}
                placeholder="Enter a Token"
                required
                after={<CopyIcon className={styles.inputIcon} />}
              />
            </div>
            <button type="submit" className={styles.connect}>
              Connect
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Servers;
