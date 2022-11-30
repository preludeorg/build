import { Popover } from "@headlessui/react";
import CloseIcon from "../../icons/close-icon";
import Button from "../button/button";
import IconButton from "../button/icon-button";
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
  affirmative = "Yes, delete",
  negative = "No, don't delete",
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
              <IconButton
                className={styles.close}
                onClick={() => close()}
                icon={<CloseIcon />}
              />
            </div>
            <div className={styles.options}>
              <Button
                onClick={() => {
                  close();
                  onAffirm();
                }}
              >
                {affirmative}
              </Button>
              <Button
                onClick={() => {
                  close();
                  onDecline?.();
                }}
                intent={"secondary"}
              >
                {negative}
              </Button>
            </div>
          </>
        )}
      </Popover.Panel>
    </Popover>
  );
};

export default ConfirmDialog;
