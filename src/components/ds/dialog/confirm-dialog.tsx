import { Popover } from "@headlessui/react";
import CloseIcon from "../../icons/close-icon";
import styles from "./dialog.module.css";

const ConfirmDialog: React.FC<{
  message: string;
  affirmative?: string;
  negative?: string;
  onAffirm: () => void;
  onDecline?: () => void;
  children: JSX.Element | JSX.Element[];
}> = ({
  message,
  affirmative = "Yes",
  negative = "No",
  children,
  onAffirm,
  onDecline,
}) => {
  return (
    <Popover className={styles.confirm}>
      <Popover.Button as="div">{children}</Popover.Button>
      <Popover.Panel className={styles.prompt}>
        {({ close }) => (
          <>
            <div className={styles.message}>
              <span>{message}</span>
              <button onClick={() => close()}>
                <CloseIcon />
              </button>
            </div>
            <div className={styles.options}>
              <button
                onClick={() => {
                  close();
                  onAffirm();
                }}
                className={styles.approve}
              >
                {affirmative}
              </button>
              <button
                onClick={() => {
                  close();
                  onDecline?.();
                }}
              >
                {negative}
              </button>
            </div>
          </>
        )}
      </Popover.Panel>
    </Popover>
  );
};

export default ConfirmDialog;
