import SettingsIcon from "../icons/settings-icon";
import styles from "./status-bar.module.css";
import { Popover, Transition } from "@headlessui/react";
import { useConfig } from "../../hooks/use-config";
import useTerminalStore from "../../hooks/terminal-store";

const StatusBar: React.FC = () => {
  const { handleExport, handleImport } = useConfig();
  const { statusIndicator } = useTerminalStore((state) => ({
    statusIndicator: state.statusIndicator,
  }));
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
                  <a
                    onClick={() => {
                      handleExport();
                      close();
                    }}
                  >
                    Export Crententials
                  </a>
                </>
              )}
            </Popover.Panel>
          </Transition>
        </Popover>
      </div>
      {statusIndicator?.loading === true ? (
        <span className={styles.statusIndicator}>{statusIndicator.message}</span>
      ) : (
        ""
      )}
    </div>
  );
};

export default StatusBar;
