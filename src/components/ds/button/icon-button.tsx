import styles from "./button.module.css";
import { Loading } from "../../icons/loading";
import classNames from "classnames/bind";
import React, { ButtonHTMLAttributes } from "react";
const cx = classNames.bind(styles);

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
    <button {...props} className={cx("iconButton", intent, className)}>
      {loading ? <Loading /> : icon}
    </button>
  );
};

export default IconButton;
