import { Test } from "@theprelude/sdk";
import styles from "./terminal.module.css";

interface Props {
  test?: Test;
  children: JSX.Element | JSX.Element[];
}

const PrimaryPrompt: React.FC<Props> = ({ children, test }) => {
  return (
    <div className={styles.ps1}>
      {test && <div className={styles.border} />}
      <div>
        {test && (
          <div className={styles.properties}>
            <span>[</span>
            {test.question}
            <span>]</span>
            {"  "}
            <span className={styles.testId}>id:[</span>
            <span className={styles.testId}>{test.id}</span>
            <span className={styles.testId}>]</span>
            {"  "}
          </div>
        )}
        <span>$</span>
        <div className={styles.lineText}>{children}</div>
      </div>
    </div>
  );
};

export default PrimaryPrompt;
