import { Transition } from "@headlessui/react";
import { select, selectIsConnected, useAuthStore } from "@theprelude/core";
import { DownloadIcon, FolderIcon, Loading } from "@theprelude/ds";
import shallow from "zustand/shallow";
import useNavigationStore from "../../hooks/navigation-store";
import useTerminalStore from "../../hooks/terminal-store";
import styles from "./status-bar.module.css";
const StatusBar: React.FC = () => {
  const showOverlay = useNavigationStore((state) => state.showOverlay);
  const isConnected = useAuthStore(selectIsConnected);
  const { tooltipVisible, hideTooltip } = useAuthStore(
    select("tooltipVisible", "hideTooltip")
  );
  const statusIndicator = useTerminalStore(
    (state) => state.statusIndicator,
    shallow
  );
  return (
    <div className={styles.statusBar}>
      <section className={styles.right}>
        {statusIndicator?.loading === true && (
          <div className={styles.statusIndicator}>
            <Loading />
            <span>{statusIndicator.message}</span>
          </div>
        )}
        {isConnected && (
          <>
            <div className={styles.stat}>
              <button onClick={() => showOverlay("securityTests")}>
                <FolderIcon className={styles.icon} />
                <span>Security Tests</span>
              </button>
            </div>
            <div className={styles.stat}>
              <button
                onClick={() => {
                  showOverlay("verifiedTests");
                  hideTooltip();
                }}
              >
                <DownloadIcon className={styles.icon} />
                <span>Verified</span>
              </button>
              <Transition
                show={tooltipVisible}
                className={styles.notification}
                as="div"
                enter={styles.enter}
                enterFrom={styles.enterFrom}
                enterTo={styles.enterTo}
                leave={styles.leave}
                leaveFrom={styles.leaveFrom}
                leaveTo={styles.leaveTo}
              >
                <span>
                  Click "Verified" to view all the previously built Verified
                  Security tests
                </span>
              </Transition>
            </div>
          </>
        )}
      </section>
    </div>
  );
};

export default StatusBar;
