import classNames from "classnames";
import { IconButton } from "../button/icon-button";
import { CloseIcon } from "../icons/close-icon";
import { Loading } from "../icons/loading";
import styles from "./overlay.module.css";

export const Overlay: React.FC<{
  children?: JSX.Element | JSX.Element[];
  position: "right" | "left";
  title: string;
  description: string;
  loading?: boolean;
  hideOverlay: () => void;
}> = ({ children, position, title, description, loading, hideOverlay }) => {
  return (
    <div className={styles.overlay}>
      <div
        className={styles.backdrop}
        onClick={() => {
          hideOverlay();
        }}
      />
      <div
        className={classNames(styles.panel, {
          [styles.right]: position === "right",
          [styles.left]: position === "left",
        })}
      >
        <IconButton
          className={styles.close}
          onClick={() => hideOverlay()}
          icon={<CloseIcon />}
          intent="primary"
        />

        <div className={styles.title}>
          <span className={styles.legend}>
            {title}
            {loading && <Loading />}
          </span>
        </div>
        <span className={styles.description}>{description}</span>

        {children}
      </div>
    </div>
  );
};
