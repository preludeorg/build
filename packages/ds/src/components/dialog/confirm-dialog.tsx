import { Popover } from "@headlessui/react";
import { Button } from "../button/button";
import { IconButton } from "../button/icon-button";
import { CloseIcon } from "../icons/close-icon";
import styles from "./dialog.module.css";

export const ConfirmDialog: React.FC<{
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
      <Popover.Panel
        className={styles.prompt}
        onClick={(ev: React.MouseEvent<HTMLElement>) => ev.stopPropagation()}
      >
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
                className={styles.button}
                onClick={() => {
                  close();
                  onAffirm();
                }}
              >
                {affirmative}
              </Button>
              <Button
                className={styles.button}
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
