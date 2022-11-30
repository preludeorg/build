import { Popover } from "@headlessui/react";
import CloseIcon from "../../icons/close-icon";
import Button from "../button/button";
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
  const handleAffirm = () => {
    close();
    onAffirm();
  };
  const handleDecline = () => {
    close();
    onDecline?.();
  };
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
              <Button
                text={affirmative}
                handleClick={handleAffirm}
                variant="affirm"
              />
              <Button
                text={negative}
                handleClick={handleDecline}
                variant="decline"
              />
            </div>
          </>
        )}
      </Popover.Panel>
    </Popover>
  );
};

export default ConfirmDialog;
