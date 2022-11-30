import styles from "./button.module.css";
import { Loading } from "../../icons/loading";
import classNames from "classnames";
import React, { ButtonHTMLAttributes } from "react";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  intent: "primary" | "secondary" | "success";
  size: "small" | "regular" | "medium" | "large";
  icon?: JSX.Element;
  iconPosition?: "left" | "right";
  loading?: boolean;
  children: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({
  intent,
  size,
  icon,
  iconPosition = "left",
  loading,
  children,
  ...props
}) => {
  return (
    <button
      {...props}
      className={classNames(styles.button, {
        [styles.primary]: intent === "primary",
        [styles.secondary]: intent === "secondary",
        [styles.success]: intent === "success",
        [styles.small]: size === "small",
        [styles.regular]: size === "regular",
        [styles.medium]: size === "medium",
        [styles.large]: size === "large",
      })}
    >
      {icon && iconPosition === "left" ? (
        <>
          {loading ? <Loading /> : icon}
          <span>{children}</span>
        </>
      ) : (
        <>
          <span>{children}</span>
          {loading ? <Loading /> : icon}
        </>
      )}
    </button>
  );
};

export default Button;
