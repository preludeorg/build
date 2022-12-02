import styles from "./icon-button.module.css";
import { Loading } from "../icons/loading";
import cn from "classnames/bind";
import classNames from "classnames";
import React, { ButtonHTMLAttributes } from "react";
const cx = cn.bind(styles);

export interface ButtonIconProps
  extends ButtonHTMLAttributes<HTMLButtonElement> {
  intent?: "primary" | "secondary" | "success" | "error";
  icon: JSX.Element;
  loading?: boolean;
}
const IconButton: React.FC<ButtonIconProps> = ({
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

export default IconButton;
