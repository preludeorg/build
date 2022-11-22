import { Popover, Transition } from "@headlessui/react";
import classNames from "classnames";
import shallow from "zustand/shallow";
import useAuthStore, { selectIsConnected } from "../../hooks/auth-store";
import useNavigationStore from "../../hooks/navigation-store";
import useTerminalStore from "../../hooks/terminal-store";
import { useConfig } from "../../hooks/use-config";
import DownloadIcon from "../icons/download-icon";
import LoaderIcon from "../icons/loader-icon";
import SettingsIcon from "../icons/settings-icon";
import styles from "./status-bar.module.css";

const StatusBar: React.FC = () => {
  const { handleExport, handleImport } = useConfig();
  const showOverlay = useNavigationStore((state) => state.showOverlay);
  const isConnected = useAuthStore(selectIsConnected);
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
            <LoaderIcon className={styles.loaderIcon} />
            <span>{statusIndicator.message}</span>
          </div>
        )}
        {isConnected && (
          <div className={classNames(styles.stat, styles.verified)}>
            <button onClick={() => showOverlay("verifiedTests")}>
              <DownloadIcon className={styles.icon} />
              <span>Verified</span>
            </button>
            <div className={styles.notification}>
              <span>Click "Verified" to view all the previously built Verified Security tests</span>
            </div>
          </div>
        )}
      </section>
    </div>
  );
};

export default StatusBar;
