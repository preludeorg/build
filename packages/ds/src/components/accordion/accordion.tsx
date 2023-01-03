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
}> = ({ title, children, expanded, edit, loading, onToggle }) => {
  return (
    <div
      className={classNames(styles.accordion, {
        [styles.active]: expanded,
      })}
    >
      <div>
        <header onClick={onToggle}>
          <div>{title}</div>
          {loading ? <Loading /> : <ChevronIcon className={styles.expand} />}
        </header>
        {edit && <>{edit}</>}
      </div>
      {expanded && children}
    </div>
  );
};
