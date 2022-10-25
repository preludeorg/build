import { useState } from "react";
import ChevronIcon from "../icons/chevron-icon";
import ContainerIcon from "../icons/container-icon";
import styles from "./dcf-results.module.css";
import cx from "classnames";

interface Props {
  name: string;
  status: number;
  cpu: string;
  output: string;
}

const DCFResults: React.FC<Props> = ({ name, status, cpu, output }) => {
  const [expanded, setExpanded] = useState(false);
  return (
    <li className={styles.resultsContainer}>
      <div className={styles.row}>
        <div className={styles.name}>
          <ContainerIcon className={styles.containerIcon} />
          <span>{name}</span>
        </div>
        <span className={styles.cpu}>{cpu}s</span>
        <div className={styles.results}>
          {status === 1 ? (
            <>
              <div className={styles.statusComplete} />
              <span>Completed</span>
            </>
          ) : (
            <>
              <div className={styles.statusFailed} />
              <span>Failed</span>
            </>
          )}
          <button
            className={styles.resultsButton}
            onClick={() => setExpanded(!expanded)}
          >
            <span>View Results</span>
            {expanded ? (
              <ChevronIcon
                className={cx(styles.chevronIcon, styles.activeChevron)}
              />
            ) : (
              <ChevronIcon className={styles.chevronIcon} />
            )}
          </button>
        </div>
      </div>
      {expanded ? <div className={styles.output}>{output}</div> : ""}
    </li>
  );
};

export default DCFResults;
