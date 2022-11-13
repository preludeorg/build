import styles from "./reload-prompt.module.css";
import { useRegisterSW } from "virtual:pwa-register/react";

function ReloadPrompt() {
  let {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW();

  const close = () => {
    setNeedRefresh(false);
  };

  if (!needRefresh) {
    return null;
  }

  return (
    <div className={styles.container}>
      <div className={styles.message}>
        <span>
          New version of application available, click on reload button to
          update.
        </span>
      </div>
      <div className={styles.buttons}>
        {needRefresh && (
          <button
            className={styles.reloadButton}
            onClick={() => updateServiceWorker(true)}
          >
            Reload
          </button>
        )}
        <button className={styles.close} onClick={() => close()}>
          Close
        </button>
      </div>
    </div>
  );
}

export default ReloadPrompt;
