import classNames from "classnames";
import cn from "classnames/bind";
import React, { ButtonHTMLAttributes } from "react";
import { Loading } from "../icons/loading";
import styles from "./button.module.css";
const cx = cn.bind(styles);

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  intent?: "primary" | "secondary" | "success" | "error";
  size?: "small" | "regular" | "medium" | "large";
  icon?: JSX.Element;
  iconPosition?: "left" | "right";
  loading?: boolean;
  extraIcon?: JSX.Element;
}

export const Button: React.FC<ButtonProps> = ({
  className,
  intent = "primary",
  size = "small",
  icon,
  iconPosition = "left",
  extraIcon,
  loading,
  children,
  ...props
}) => {
  return (
    <button
      {...props}
      className={classNames(cx("button", intent, size), className)}
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
      {extraIcon ? extraIcon : ""}
    </button>
  );
};
