import { createTest, isPWA, select, useAuthStore } from "@theprelude/core";
import {
  ArrowRight,
  Button,
  DownloadIcon,
  Input,
  notifyError,
  notifySuccess,
} from "@theprelude/ds";
import React, { useEffect, useState } from "react";
import shallow from "zustand/shallow";
import rectangle from "../../assets/rectangle.png";
import rectangle2 from "../../assets/rectangle2.png";
import rectangle3 from "../../assets/rectangle3.png";
import useNavigationStore from "../../hooks/navigation-store";
import WelcomeBlock from "./welcome-block";
import styles from "./welcome.module.css";
import * as uuid from "uuid";
import { getLanguage } from "../../../../build/src/lib/lang";
import { format } from "date-fns";

const Welcome = React.forwardRef<HTMLDivElement>(({}, ref) => {
  const showOverlay = useNavigationStore((state) => state.showOverlay);
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
      <div className={styles.actions}>
        <CreateTest />
        <Button onClick={() => showOverlay("securityTests")} intent="secondary">
          View tests
        </Button>
      </div>
    </div>
  );
});

const CreateTest = () => {
  const serviceConfig = useAuthStore(select("host", "credentials"), shallow);
  const [rule, setRule] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleCreateTest = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const testId = uuid.v4();
    const code = getLanguage("go")
      .template.replaceAll("$NAME", testId)
      .replaceAll("$QUESTION", rule)
      .replaceAll("$CREATED", format(new Date(), "yyyy-MM-dd hh:mm:ss.SSSSSS"));
    try {
      setIsLoading(true);
      await createTest(
        testId,
        rule,
        code,
        serviceConfig,
        new AbortController().signal
      );
      notifySuccess("Successfully created test");
    } catch (err) {
      notifyError("Failed to create test", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={(e) => handleCreateTest(e)} className={styles.form}>
      <Input
        type="text"
        name="rule"
        placeholder="Enter the rule"
        onChange={(e) => setRule(e.target.value)}
      />
      <Button
        type="submit"
        intent="primary"
        disabled={rule === "" || isLoading}
        loading={isLoading}
      >
        Create test
      </Button>
    </form>
  );
};

export default Welcome;
