import React, { ButtonHTMLAttributes } from "react";
import { IconButton } from "../button/icon-button";
import styles from "./accordion.module.css";

export const AccordionList: React.FC<{
  children?: JSX.Element | JSX.Element[];
}> = ({ children }) => {
  return <section className={styles.list}>{children}</section>;
};

export const AccordionItem: React.FC<{
  icon: JSX.Element;
  title: React.ReactNode;
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

export interface AccordionActionProps
  extends ButtonHTMLAttributes<HTMLButtonElement> {
  icon: JSX.Element;
  loading?: boolean;
}

export const AccordionAction: React.FC<AccordionActionProps> = ({
  icon,
  onClick,
  loading,
  ...props
}) => {
  return (
    <IconButton
      onClick={onClick}
      intent="primary"
      icon={icon}
      loading={loading}
      disabled={loading}
      {...props}
    />
  );
};
