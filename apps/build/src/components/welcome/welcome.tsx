import { isPWA, select } from "@theprelude/core";
import {
  ArrowRight,
  Button,
  DownloadIcon,
  PreludeWordmark,
} from "@theprelude/ds";
import React, { useEffect } from "react";
import shallow from "zustand/shallow";
import rectangle from "../../assets/rectangle.png";
import rectangle2 from "../../assets/rectangle2.png";
import rectangle3 from "../../assets/rectangle3.png";
import useNavigationStore from "../../hooks/navigation-store";
import WelcomeBlock from "./welcome-block";
import styles from "./welcome.module.css";

const Welcome = React.forwardRef<HTMLDivElement>(({}, ref) => {
  const { installer, setInstaller, isInstalled, setIsInstalled } =
    useNavigationStore(
      select("installer", "setInstaller", "isInstalled", "setIsInstalled"),
      shallow
    );

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

  function handleBeforeInstall(e: Event) {
    e.preventDefault();
    const installed = isPWA();
    if (!installed) {
      setInstaller(e);
    }
  }

  const handleAppInstalled = (e: Event) => {
    if (!isInstalled) {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
      e.preventDefault();
      setIsInstalled(true);
    }
  };

  useEffect(() => {
    window.addEventListener("beforeinstallprompt", handleBeforeInstall);
    window.addEventListener("appinstalled", handleAppInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  return (
    <div ref={ref} className={styles.welcome}>
      <header>
        <section>
          <PreludeWordmark className={styles.wordmark} />
          <div className={styles.line} />
          <h2 className={styles.tagline}>Security Test Authoring</h2>
        </section>
        <section className={styles.install}>
          {!isInstalled && Boolean(installer) && (
            <Button onClick={handleInstall} icon={<DownloadIcon />}>
              Install
            </Button>
          )}
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
});

export default Welcome;
