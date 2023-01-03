import { DragHandle } from "@theprelude/ds";
import { Resizable } from "re-resizable";
import styles from "../app.module.css";
import VerifiedTests from "./verified-tests";

const Browser: React.FC = () => {
  return (
    <Resizable
      className={styles.browser}
      enable={{ left: true }}
      defaultSize={{
        width: 320,
        height: "100%",
      }}
      handleClasses={{ left: styles.handle }}
      handleComponent={{
        left: <DragHandle className={styles.dragHandle} />,
      }}
    >
      <VerifiedTests />
    </Resizable>
  );
};

export default Browser;
