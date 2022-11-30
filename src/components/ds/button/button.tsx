import styles from "./button.module.css";
import { Loading } from "../../icons/loading";
import classNames from "classnames";

const Button: React.FC<{
  handleClick?: () => void;
  text: string;
  icon?: JSX.Element;
  loading?: boolean;
  disabled?: boolean;
  variant?: "affirm" | "decline" | "build" | "download";
}> = ({ handleClick, text, icon, loading, disabled = true, variant }) => {
  return (
    <button
      onClick={handleClick}
      className={classNames(styles.button, {
        [styles.affirm]: variant === "affirm",
        [styles.decline]: variant === "decline",
        [styles.build]: variant === "build",
        [styles.download]: variant === "download",
      })}
      disabled={disabled}
    >
      {loading ? <Loading /> : icon}
      <span>{text}</span>
    </button>
  );
};

export default Button;
