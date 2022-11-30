import { Loading } from "../../icons/loading";
import IconButton from "../button/icon-button";
import styles from "./accordion.module.css";

export const AccordionList: React.FC<{
  children?: JSX.Element | JSX.Element[];
}> = ({ children }) => {
  return <section className={styles.list}>{children}</section>;
};

export const AccordionItem: React.FC<{
  icon: JSX.Element;
  title: string;
  actions: JSX.Element;
}> = ({ icon, title, actions }) => {
  return (
    <div className={styles.item}>
      {icon}
      <span>{title}</span>
      {actions}
    </div>
  );
};

export const AccordionAction: React.FC<{
  loading?: boolean;
  icon: JSX.Element;
  onClick?: () => void;
}> = ({ icon, onClick, loading }) => {
  return (
    <IconButton
      onClick={onClick}
      intent="primary"
      icon={icon}
      loading={loading}
      disabled={loading}
    />
  );
};
