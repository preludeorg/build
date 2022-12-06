import { Button } from "@theprelude/ds";
import { useRegisterSW } from "virtual:pwa-register/react";
import styles from "./reload-prompt.module.css";

function ReloadPrompt() {
  const {
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
          <Button onClick={() => updateServiceWorker(true)}>Reload</Button>
        )}
        <Button onClick={() => close()} intent={"secondary"}>
          Close
        </Button>
      </div>
    </div>
  );
}

export default ReloadPrompt;
