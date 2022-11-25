import { Resizable } from "re-resizable";
import styles from "./app.module.css";
import DragHandle from "./icons/drag-handle-icon";
import Terminal from "./terminal/terminal";

const Footer: React.FC<{ defaultHeight: string | null }> = ({
  defaultHeight,
}) => {
  if (!defaultHeight) {
    return null;
  }

  return (
    <Resizable
      className={styles.footer}
      enable={{ top: true }}
      defaultSize={{ height: defaultHeight, width: "100%" }}
      maxHeight="80vh"
      minHeight="10vh"
      handleClasses={{ top: styles.handle }}
      handleComponent={{
        top: <DragHandle className={styles.dragHandle} />,
      }}
    >
      <Terminal />
    </Resizable>
  );
};

export default Footer;
