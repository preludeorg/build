import { selectIsConnected, useAuthStore } from "@theprelude/core";
import classNames from "classnames";
import useNavigationStore from "../../../hooks/navigation-store";
import styles from "./servers.module.css";

const ConnectedServer = () => {
  const host = useAuthStore((state) => state.host);
  const isConnected = useAuthStore(selectIsConnected);
  const serverName = isConnected ? host : "Disconnected";
  const hideOverlay = useNavigationStore((state) => state.hideOverlay);
  return (
    <button onClick={hideOverlay} className={styles.container}>
      <div
        className={classNames(styles.status, {
          [styles.connected]: isConnected,
        })}
      />
      <div className={styles.serverName}>{serverName}</div>
    </button>
  );
};

export default ConnectedServer;
