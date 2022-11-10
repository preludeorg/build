import useAuthStore, { selectIsConnected } from "../../hooks/auth-store";
import styles from "./servers.module.css";
import classNames from "classnames";
import useNavigationStore from "../../hooks/navigation-store";

const ConnectedServer = () => {
  const host = useAuthStore((state) => state.host);
  const isConnected = useAuthStore(selectIsConnected);
  const serverName = isConnected ? host : "Disconnected";
  const toggleServerPanel = useNavigationStore(
    (state) => state.toggleServerPanel
  );
  return (
    <button onClick={toggleServerPanel} className={styles.container}>
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
