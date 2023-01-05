import { isPWA, select } from "@theprelude/core";
import { Button, DownloadIcon } from "@theprelude/ds";
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
        <section className={styles.headline}>
          <h2>Security Test Authoring</h2>
          <h4>Create and manage your own security tests with Prelude Build</h4>
        </section>
        <div className={styles.right}>
          <section className={styles.install}>
            {!isInstalled && Boolean(installer) && (
              <Button onClick={handleInstall} icon={<DownloadIcon />}>
                Install
              </Button>
            )}
          </section>
          <div>
            <a
              className={styles.docs}
              href="https://docs.prelude.org/v2"
              target="_blank"
            >
              <p className={styles.text}>Documentation</p>
            </a>
          </div>
        </div>
      </header>
      <div className={styles.blockContainer}>
        <WelcomeBlock
          completed
          step={1}
          title="View Test"
          description="Prelude periodically releases new open-source tests that ensure your endpoint defense is protecting you. Open your first test."
          image={rectangle}
          link="https://docs.prelude.org/v2/docs/basic"
        />
        <WelcomeBlock
          step={2}
          title="Deploy Test"
          description="Each test is compiled for all major operating systems and can be accessed via HTTP. Download a test and execute it through a terminal."
          image={rectangle2}
          link="https://docs.prelude.org/v2/docs/understanding-ttps"
        />
        <WelcomeBlock
          step={3}
          title="Create Test"
          description="Tests are written in Go to be cross-platform by default. Customize your security testing by writing your first test."
          image={rectangle3}
          link="https://docs.prelude.org/v2/docs/prelude-cli-1"
        />
        <WelcomeBlock
          step={4}
          title="Build Test"
          description="When tests are built, they are compiled and checked against a variety of malware signatures before becoming available for deployment. Build your new test."
          image={rectangle3}
          link="https://docs.prelude.org/v2/docs/prelude-cli-1"
        />
      </div>
    </div>
  );
});

export default Welcome;
