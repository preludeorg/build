import classNames from "classnames";
import { ChevronIcon } from "../icons/chevron-icon";
import { Loading } from "../icons/loading";
import styles from "./accordion.module.css";

export const Accordion: React.FC<{
  title: React.ReactNode;
  children?: JSX.Element | JSX.Element[];
  loading?: boolean;
  edit?: React.ReactNode;
  expanded: boolean;
  onToggle: () => void;
  className?: string;
}> = ({ title, children, expanded, edit, loading, onToggle, className }) => {
  return (
    <div
      className={classNames(
        styles.accordion,
        {
          [styles.active]: expanded,
        },
        className
      )}
    >
      <header onClick={onToggle}>
        <div>{title}</div>
        {edit && <>{edit}</>}
        {loading ? <Loading /> : <ChevronIcon className={styles.expand} />}
      </header>
      {expanded && children}
    </div>
  );
};
