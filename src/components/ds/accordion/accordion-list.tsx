import styles from "./accordion.module.css";

export const AccordionList: React.FC<{
  children?: JSX.Element | JSX.Element[];
}> = ({ children }) => {
  return <section className={styles.list}>{children}</section>;
};

export const AccordionItem: React.FC<{
  icon: JSX.Element;
  title: string;
  actions: JSX.Element[];
}> = ({ icon, title, actions }) => {
  return (
    <div className={styles.item}>
      {icon}
      <span>{title}</span>
      {actions}
    </div>
  );
};
