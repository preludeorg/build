import classNames from "classnames";
import useNavigationStore from "../../hooks/navigation-store";
import CloseIcon from "../icons/close-icon";
import { Loading } from "../icons/loading";
import styles from "./overlay.module.css";

const Overlay: React.FC<{
  children?: JSX.Element | JSX.Element[];
  position: "right" | "left";
  title: string;
  description: string;
  loading?: boolean;
}> = ({ children, position, title, description, loading }) => {
  const hideOverlay = useNavigationStore((state) => state.hideOverlay);

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
        <button className={styles.close} onClick={() => hideOverlay()}>
          <CloseIcon />
        </button>

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

export default Overlay;
