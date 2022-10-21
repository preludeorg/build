import { InputHTMLAttributes } from "react"
import styles from "./input.module.css"
import classNames from "classnames"

export const Input: React.FC<InputHTMLAttributes<HTMLInputElement>> = ({ className, ...props }) => {
  return (
    <input className={classNames(styles.input, className)} {...props} />
  )
}

export interface InputGroupProps extends InputHTMLAttributes<HTMLInputElement> {
  groupClassName?: string;
  before?: React.ReactNode
  after?: React.ReactNode
}

export const InputGroup: React.FC<InputGroupProps> = ({ groupClassName, className, before, after, ...props }) => {
  return (
    <div className={classNames(styles.group, groupClassName)}>
      {before && <div className={styles.before}>{before}</div>}
      <Input
        className={
          classNames(
            className,
            before && styles.withBefore,
            after && styles.withAfter
          )
        }
        {...props}
      />
      {after && <div className={styles.after}>{after}</div>}
    </div>
  )
}