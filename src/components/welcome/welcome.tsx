import ArrowRight from "../icons/arrow-right";
import WelcomeBlock from "./welcome-block";
import styles from "./welcome.module.css";
import rectangle from "../../assets/rectangle.png";
import rectangle2 from "../../assets/rectangle2.png";
import rectangle3 from "../../assets/rectangle3.png";
import DownloadIcon from "../icons/download-icon";
import classNames from "classnames";
import useNavigationStore, {
  navigatorState,
} from "../../hooks/navigation-store";

window.addEventListener("beforeinstallprompt", (e) => {
  const { setInstaller } = navigatorState();
  setInstaller(e);
});

const Welcome = () => {
  const installer = useNavigationStore((state) => state.installer);
  const setInstaller = useNavigationStore((state) => state.setInstaller);

  async function handleInstall() {
    if (!installer) return;

    installer.prompt();
    if (installer.userChoice) {
      const { outcome } = await installer.userChoice;
      if (outcome === "accepted") {
        setInstaller();
      }
    }
  }

  return (
    <div className={styles.welcome}>
      <header>
        <section className={styles.intro}>
          <h1 className={styles.header}>Prelude Build</h1>
          <h2 className={styles.tagline}>Security simplified</h2>
        </section>
        <section className={styles.install}>
          <button
            onClick={handleInstall}
            className={classNames({ [styles.showInstaller]: !!installer })}
          >
            <DownloadIcon />
            Install
          </button>
        </section>
      </header>
      <div className={styles.blockContainer}>
        <WelcomeBlock
          title="Introduction to Build"
          description="Learn the basic concepts of authoring, testing and deploying security tests at scale"
          image={rectangle}
          link="https://docs.prelude.org/v2/docs/basic"
        />
        <WelcomeBlock
          title="Verified Security Tests"
          description="Design your own security test that can both test your controls and clean up after itself"
          image={rectangle2}
          link="https://docs.prelude.org/v2/docs/understanding-ttps"
        />
        <WelcomeBlock
          title="Prelude CLI"
          description="Use the terminal to automate your workflows or to plug into your favorite IDE"
          image={rectangle3}
          link="https://docs.prelude.org/v2/docs/prelude-cli-1"
        />
      </div>
      <a
        className={styles.docs}
        href="https://docs.prelude.org/v2"
        target="_blank"
      >
        <p className={styles.text}>More guides & documentation</p>
        <ArrowRight className={styles.rightArrow} />
      </a>
    </div>
  );
};

export default Welcome;
