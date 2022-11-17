import SettingsIcon from "../icons/settings-icon";
import styles from "./status-bar.module.css";
import { Popover, Transition } from "@headlessui/react";
import { useConfig } from "../../hooks/use-config";
import useTerminalStore from "../../hooks/terminal-store";
import LoaderIcon from "../icons/loader-icon";
import shallow from "zustand/shallow";

import useNavigationStore from "../../hooks/navigation-store";
import useAuthStore, { selectIsConnected } from "../../hooks/auth-store";
import classNames from "classnames";
import LaunchIcon from "../icons/launch-icon";

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
                      handleImport();
                      close();
                    }}
                  >
                    Import Credentials
                  </a>
                  {isConnected && (
                    <a
                      onClick={() => {
                        handleExport();
                        close();
                      }}
                    >
                      Export Crententials
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
          <div className={classNames(styles.stat, styles.compiled)}>
            <button onClick={() => showOverlay("verifiedTests")}>
              <LaunchIcon className={styles.icon} />
              <span>Compiled</span>
            </button>
          </div>
        )}
      </section>
    </div>
  );
};

export default StatusBar;
