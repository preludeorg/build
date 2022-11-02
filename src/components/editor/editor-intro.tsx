import ArrowRight from "../icons/arrow-right";
import HelpIcon from "../icons/help-icon";
import styles from "./editor-intro.module.css";

const EditorIntro = () => {
  return (
    <div className={styles.intro}>
      <div className={styles.container}>
        <h2>You can use one of the following commands to get started:</h2>
        <div className={styles.stepsheet}>
          <div className={styles.step}>
            <span>list-manifest</span>
            <div className={styles.iconContainer}>
              <HelpIcon className={styles.helpIcon} />
              <div className={styles.tooltip}>
                Lists the manifest of ttps accesible by your account.
              </div>
            </div>
          </div>
          <ArrowRight className={styles.arrowIcon} />
          <div className={styles.step}>
            <span>put-ttp</span>
            <div className={styles.iconContainer}>
              <HelpIcon className={styles.helpIcon} />
              <div className={styles.tooltip}>
                Creates a ttp with a given question.
              </div>
            </div>
          </div>
          <ArrowRight className={styles.arrowIcon} />
          <div className={styles.step}>
            <span>create-code-file</span>
            <div className={styles.iconContainer}>
              <HelpIcon className={styles.helpIcon} />
              <div className={styles.tooltip}>
                Creates a new code file in current ttp.
              </div>
            </div>
          </div>
        </div>
        <a
          className={styles.docs}
          href="https://docs.prelude.org"
          target="_blank"
        >
          <p className={styles.text}>More guides & documentation</p>
          <ArrowRight className={styles.arrowIcon} />
        </a>
      </div>
    </div>
  );
};

export default EditorIntro;
