import useAuthStore, { selectIsConnected } from "../../hooks/auth-store";
import styles from "./servers.module.css";
import classNames from "classnames";
import useNavigationStore from "../../hooks/navigation-store";

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
