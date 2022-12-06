import classNames from "classnames";
import cn from "classnames/bind";
import React, { ButtonHTMLAttributes } from "react";
import { Loading } from "../icons/loading";
import styles from "./icon-button.module.css";
const cx = cn.bind(styles);

export interface ButtonIconProps
  extends ButtonHTMLAttributes<HTMLButtonElement> {
  intent?: "primary" | "secondary" | "success" | "error";
  icon: JSX.Element;
  loading?: boolean;
}

export const IconButton: React.FC<ButtonIconProps> = ({
  className,
  intent = "primary",
  icon,
  loading,
  ...props
}) => {
  return (
    <button
      {...props}
      className={classNames(cx("iconButton", intent), className)}
    >
      {loading ? <Loading /> : icon}
    </button>
  );
};
