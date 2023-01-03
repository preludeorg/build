import { selectIsConnected, useAuthStore } from "@theprelude/core";
import { FolderIcon } from "@theprelude/ds";
import useNavigationStore from "../../hooks/navigation-store";
import styles from "./status-bar.module.css";
const StatusBar: React.FC = () => {
  const showOverlay = useNavigationStore((state) => state.showOverlay);
  const isConnected = useAuthStore(selectIsConnected);
  return (
    <div className={styles.statusBar}>
      <section className={styles.right}>
        {isConnected && (
          <>
            <div className={styles.stat}>
              <button onClick={() => showOverlay("securityTests")}>
                <FolderIcon className={styles.icon} />
                <span>Security Tests</span>
              </button>
            </div>
          </>
        )}
      </section>
    </div>
  );
};

export default StatusBar;
