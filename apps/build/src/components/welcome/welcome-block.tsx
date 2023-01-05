import { CheckmarkIcon } from "@theprelude/ds";
import classNames from "classnames";
import styles from "./welcome.module.css";

const WelcomeBlock: React.FC<{
  step: number;
  title: string;
  image: string;
  description: string;
  completed?: boolean;
  onClick?: () => void;
}> = (props) => {
  return (
    <button
      onClick={props.onClick}
      className={classNames(styles.block, {
        [styles.completedBlock]: props.completed,
      })}
    >
      {props.completed && (
        <div className={styles.completed}>
          <div className={styles.check}>
            <CheckmarkIcon />
          </div>
        </div>
      )}
      <h2 className={styles.title}>
        <span className={styles.step}>{props.step}</span>
        {props.title}
      </h2>
      <img className={styles.image} src={props.image} />
      <p className={styles.description}>{props.description}</p>
    </button>
  );
};

export default WelcomeBlock;
