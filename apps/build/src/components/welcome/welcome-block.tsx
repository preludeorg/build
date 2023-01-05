import { CheckmarkIcon } from "@theprelude/ds";
import styles from "./welcome.module.css";

const WelcomeBlock: React.FC<{
  step: number;
  link: string;
  title: string;
  image: string;
  description: string;
  completed?: boolean;
}> = (props) => {
  return (
    <a className={styles.block} href={props.link} target="_blank">
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
    </a>
  );
};

export default WelcomeBlock;
