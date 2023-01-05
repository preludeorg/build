import classNames from "classnames";
import React, { InputHTMLAttributes } from "react";
import styles from "./input.module.css";

export const Input = React.forwardRef<
  HTMLInputElement,
  InputHTMLAttributes<HTMLInputElement>
>(({ className, ...props }, ref) => {
  return (
    <input
      ref={ref}
      className={classNames(styles.input, className)}
      autoComplete="off"
      {...props}
    />
  );
});

export interface InputGroupProps extends InputHTMLAttributes<HTMLInputElement> {
  groupClassName?: string;
  before?: React.ReactNode;
  after?: React.ReactNode;
}

export const InputGroup: React.FC<InputGroupProps> = ({
  groupClassName,
  className,
  before,
  after,
  ...props
}) => {
  return (
    <div className={classNames(styles.group, groupClassName)}>
      {before && <div className={styles.before}>{before}</div>}
      <Input
        className={classNames(
          className,
          before && styles.withBefore,
          after && styles.withAfter
        )}
        {...props}
      />
      {after && <div className={styles.after}>{after}</div>}
    </div>
  );
};
