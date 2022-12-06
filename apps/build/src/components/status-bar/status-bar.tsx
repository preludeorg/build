import { Popover, Transition } from "@headlessui/react";
import { select, selectIsConnected, useAuthStore } from "@theprelude/core";
import {
  DownloadIcon,
  FolderIcon,
  Loading,
  SettingsIcon,
} from "@theprelude/ds";
import shallow from "zustand/shallow";
import useNavigationStore from "../../hooks/navigation-store";
import useTerminalStore from "../../hooks/terminal-store";
import { useConfig } from "../../hooks/use-config";
import styles from "./status-bar.module.css";

const StatusBar: React.FC = () => {
  const { handleExport, handleImport } = useConfig();
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
      <div className={styles.stat}>
        <Popover className={styles.popover}>
          <Popover.Button>
            <SettingsIcon className={styles.icon} />
            <span>Settings</span>
          </Popover.Button>

          <Transition
            enter={styles.enter}
            enterFrom={styles.enterFrom}
            enterTo={styles.enterTo}
            leave={styles.leave}
            leaveFrom={styles.leaveFrom}
            leaveTo={styles.leaveTo}
          >
            <Popover.Panel className={styles.panel}>
              {({ close }) => (
                <>
                  <a
                    onClick={() => {
                      void handleImport();
                      close();
                    }}
                  >
                    Import Credentials
                  </a>
                  {isConnected && (
                    <a
                      onClick={() => {
                        void handleExport();
                        close();
                      }}
                    >
                      Export Credentials
                    </a>
                  )}
                </>
              )}
            </Popover.Panel>
          </Transition>
        </Popover>
      </div>

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
