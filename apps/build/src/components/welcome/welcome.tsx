import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  downloadTest,
  isPreludeTest,
  isPWA,
  select,
  Test,
  useAuthStore,
} from "@theprelude/core";
import {
  Button,
  DownloadIcon,
  notify,
  notifyError,
  notifyLoading,
  notifySuccess,
} from "@theprelude/ds";
import React, { useEffect } from "react";
import shallow from "zustand/shallow";
import rectangle from "../../assets/rectangle.png";
import rectangle2 from "../../assets/rectangle2.png";
import rectangle3 from "../../assets/rectangle3.png";
import useIntroStore from "../../hooks/intro-store";
import useNavigationStore from "../../hooks/navigation-store";
import { useTab } from "../../hooks/use-tab";
import { driver } from "../driver/driver";
import WelcomeBlock from "./welcome-block";
import styles from "./welcome.module.css";

const Welcome = React.forwardRef<HTMLDivElement>(({}, ref) => {
  const queryClient = useQueryClient();
  const serviceConfig = useAuthStore(select("host", "credentials"), shallow);
  const completedTests = useIntroStore(
    (state) => state.completedTests,
    shallow
  );

  const expandFirstTest = useIntroStore((state) => state.expandFirstTest);
  const { open } = useTab();
  const viewFirstTest = useMutation(
    async () => {
      notifyLoading("Opening a test to view...", "open-test");
      const tests = queryClient.getQueryData([
        "tests",
        serviceConfig,
      ]) as Array<Test>;

      return {
        code: await downloadTest(tests[0].filename, serviceConfig),
        test: tests[0],
      };
    },
    {
      onSuccess: async ({ code, test }) => {
        open(test, code);
        const saveMessage = isPreludeTest(test)
          ? " in read-only mode"
          : ". all changes will auto-save";
        notifySuccess(`Opened test${saveMessage}`, "open-test");
      },
      onError: (e) => {
        notifyError("Failed to open test code.", e, "open-test");
      },
    }
  );

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
          completed={completedTests.includes("viewTest")}
          onClick={() => {
            if (!queryClient.getQueryData(["tests", serviceConfig])) {
              notify("Waiting for tests to load...");
              return;
            }
            viewFirstTest.mutate();
          }}
          step={1}
          title="View Test"
          description="Prelude periodically releases new open-source tests that ensure your endpoint defense is protecting you. Open your first test."
          image={rectangle}
        />
        <WelcomeBlock
          completed={completedTests.includes("deployTest")}
          onClick={() => {
            expandFirstTest();
            setTimeout(() => {
              driver.highlight({
                element: ".deploy-button svg",
                popover: {
                  position: "left",
                  title: "Deploy Test",
                  description:
                    "Click here to generate a url for the VST then click the copy button to copy the url to your clipboard.",
                },
              });
            }, 500);
          }}
          step={2}
          title="Deploy Test"
          description="Each test is compiled for all major operating systems and can be accessed via HTTP. Download a test and execute it through a terminal."
          image={rectangle2}
        />
        <WelcomeBlock
          completed={completedTests.includes("createTest")}
          step={3}
          title="Create Test"
          description="Tests are written in Go to be cross-platform by default. Customize your security testing by writing your first test."
          image={rectangle3}
        />
        <WelcomeBlock
          completed={completedTests.includes("buildTest")}
          step={4}
          title="Build Test"
          description="When tests are built, they are compiled and checked against a variety of malware signatures before becoming available for deployment. Build your new test."
          image={rectangle3}
        />
      </div>
    </div>
  );
});

export default Welcome;
