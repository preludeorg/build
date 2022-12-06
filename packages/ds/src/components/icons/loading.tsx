import classNames from "classnames";
import { LoaderIcon } from "./loader-icon";
import styles from "./loading.module.css";

export const Loading: React.FC<{ className?: string }> = ({ className }) => {
  return <LoaderIcon className={classNames(styles.loaderIcon, className)} />;
};
