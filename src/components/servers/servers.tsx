import { useState } from "react";
import { InputGroup } from "../forms/input";
import HostsIcon from "../icons/hosts-icon";
import CloseIcon from "../icons/close-icon";
import CopyIcon from "../icons/copy-icon";
import styles from "./servers.module.css";
import cx from "classnames";
import useTerminalStore from "../../hooks/terminal-store";
import * as Prelude from "@prelude/sdk";
import useAuthStore from "../../hooks/auth-store";

const Servers: React.FC<{ toggleServerPanel: () => void }> = ({
  toggleServerPanel,
}) => {
  const write = useTerminalStore((state) => state.write);
  const { host, credentials, serverType } = useAuthStore((state) => ({
    host: state.host,
    credentials: state.credentials,
    serverType: state.serverType,
  }));

  const [type, setType] = useState(serverType);

  const handleSubmit: React.FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const server = formData.get("server") as string;
    const username = formData.get("username") as string;
    const token = formData.get("token") as string;

    const config: Prelude.ServiceConfig = {
      host: server,
      credentials: {
        account: username,
        token,
      },
    };

    const service = new Prelude.Service(config);

    try {
      await service.build.listManifest();
    } catch (err) {}
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
              <label htmlFor="server" className={styles.label}>
                Server
              </label>
              {type === "prelude" ? (
                <InputGroup
                  type="url"
                  key={"prelude-server"}
                  name={"server"}
                  className={styles.input}
                  readOnly
                  defaultValue={host}
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
                defaultValue={credentials?.account ?? ""}
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
                type="password"
                name={"token"}
                defaultValue={credentials?.token ?? ""}
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
