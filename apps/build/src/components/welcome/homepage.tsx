import { emitter } from "@theprelude/core";
import {
  BookIcon,
  Button,
  EditorIcon,
  KeyIcon,
  PlusIcon,
} from "@theprelude/ds";
import styles from "./homepage.module.css";

const Homepage = () => {
  return (
    <div className={styles.homepage}>
      <div className={styles.left}>
        <div>
          <h3>Start</h3>
          <ul>
            <li>
              <Button
                onClick={() => emitter.emit("createTest")}
                icon={<PlusIcon />}
              >
                Create a test
              </Button>
            </li>
            <li>
              <Button icon={<KeyIcon />}>Export credentials</Button>
            </li>
          </ul>
        </div>
        <div>
          <h3>Recent</h3>
          <ul>
            <li>
              <Button icon={<EditorIcon />}>Test One name</Button>
            </li>
          </ul>
        </div>
      </div>
      <div className={styles.right}>
        <div className={styles.docs}>
          <h3>Docs</h3>
          <ul>
            <li>
              <a href="https://docs.prelude.org/docs/build" target="_blank">
                <BookIcon />
                <h4>Introduction to Build</h4>
              </a>
            </li>
            <li>
              <a
                href="https://docs.prelude.org/docs/deploying-security-tests"
                target="_blank"
              >
                <BookIcon />
                <h4>Using Build at scale</h4>
              </a>
            </li>
            <li>
              <a href="https://docs.prelude.org/docs/tests" target="_blank">
                <BookIcon />
                <h4>Your first test</h4>
              </a>
            </li>
            <li>
              <a
                href="https://docs.prelude.org/docs/tests#results"
                target="_blank"
              >
                <BookIcon />
                <h4>Reading the test results</h4>
              </a>
            </li>
          </ul>
          <a
            href="https://docs.prelude.org/docs"
            target="_blank"
            className={styles.more}
          >
            More...
          </a>
        </div>
      </div>
    </div>
  );
};

export default Homepage;
