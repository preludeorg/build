import { Transition } from "@headlessui/react";
import { select, selectIsConnected, useAuthStore } from "@theprelude/core";
import { DownloadIcon, FolderIcon, Loading } from "@theprelude/ds";
import shallow from "zustand/shallow";
import useNavigationStore from "../../hooks/navigation-store";
import styles from "./status-bar.module.css";
const StatusBar: React.FC = () => {
  const showOverlay = useNavigationStore((state) => state.showOverlay);
  const isConnected = useAuthStore(selectIsConnected);
  const { tooltipVisible, hideTooltip } = useAuthStore(
    select("tooltipVisible", "hideTooltip")
  );
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
