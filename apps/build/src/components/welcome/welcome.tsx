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
import buildTestImg from "../../assets/build-test.png";
import createTestImg from "../../assets/create-test.png";
import deployTestImg from "../../assets/deploy-test.png";
import viewTestImg from "../../assets/view-test.png";
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
  const setIsFormOpen = useIntroStore((state) => state.setIsFormOpen);
  const { open } = useTab();
  const showTestToBuild = useMutation(
    async () => {
      notifyLoading("Opening a test to build...", "open-build");
      const tests = queryClient
        .getQueryData<Array<Test>>(["tests", serviceConfig])
        ?.filter((t) => !isPreludeTest(t));

      if (!tests) throw new Error("No tests found");

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
        notifySuccess(`Opened test${saveMessage}`, "open-build");
        setTimeout(() => {
          driver.highlight({
            element: document.querySelector(
              "[data-tooltip-id='build-test']"
            ) as HTMLElement,
            popover: {
              position: "top",
              title: "Build Test",
              description: "Click here to build your test and see the results.",
            },
          });
        }, 200);
      },
      onError: (e) => {
        notifyError("Failed to open test code.", e, "open-build");
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

            setTimeout(() => {
              driver.highlight({
                element: document.querySelector(
                  "[data-tooltip-id='view-test']"
                ) as HTMLElement,
                popover: {
                  position: "left",
                  title: "View Test",
                  description: "Click here to open the test in the editor",
                },
              });
            }, 500);
          }}
          step={1}
          title="View Test"
          description="Prelude periodically releases new open-source tests that ensure your endpoint defense is protecting you. Open your first test."
          image={viewTestImg}
        />
        <WelcomeBlock
          completed={completedTests.includes("deployTest")}
          onClick={() => {
            expandFirstTest();
            setTimeout(() => {
              driver.highlight({
                element: document.querySelector(
                  "[data-tooltip-id='deploy-test']"
                ) as HTMLElement,
                popover: {
                  position: "left",
                  title: "Deploy Test",
                  description:
                    "Click here to generate a url for the VST (Verified Security Test) then click the copy button to copy the url to your clipboard.",
                },
              });
            }, 500);
          }}
          step={2}
          title="Deploy Test"
          description="Each test is compiled for all major operating systems and can be accessed via HTTP. Download a test and execute it through a terminal."
          image={deployTestImg}
        />
        <WelcomeBlock
          completed={completedTests.includes("createTest")}
          onClick={() => {
            setIsFormOpen(true);
            setTimeout(() => {
              driver.highlight({
                element: document.querySelector(
                  "[data-tooltip-id='create-test']"
                ) as HTMLElement,
                popover: {
                  position: "left",
                  title: "Create Test",
                  description:
                    "Enter a name for your test and click the checkmark to create a new test.",
                },
              });
            }, 200);
          }}
          step={3}
          title="Create Test"
          description="Tests are written in Go to be cross-platform by default. Customize your security testing by writing your first test."
          image={createTestImg}
        />
        <WelcomeBlock
          completed={completedTests.includes("buildTest")}
          onClick={() => {
            if (!queryClient.getQueryData(["tests", serviceConfig])) {
              notify("Waiting for tests to load...");
              return;
            }

            if (
              queryClient
                .getQueryData<Test[]>(["tests", serviceConfig])
                ?.filter((t) => !isPreludeTest(t)).length === 0
            ) {
              notify("No tests found. Create a test first.");
              return;
            }
            showTestToBuild.mutate();
          }}
          step={4}
          title="Build Test"
          description="When tests are built, they are compiled and checked against a variety of malware signatures before becoming available for deployment. Build your new test."
          image={buildTestImg}
        />
      </div>
    </div>
  );
});

export default Welcome;
