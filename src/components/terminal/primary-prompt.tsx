import { TTP } from "../../lib/ttp";
import styles from "./terminal.module.css";

interface Props {
  ttp?: TTP;
  children: JSX.Element | JSX.Element[];
}

const PrimaryPrompt: React.FC<Props> = ({ children, ttp }) => {
  return (
    <div className={styles.ps1}>
      {ttp && <div className={styles.border} />}
      <div>
        {ttp && (
          <div className={styles.properties}>
            <span>[</span>
            {ttp.question}
            <span>]</span>
            {"  "}
            <span>id:[</span>
            {ttp.id}
            <span>]</span>
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
