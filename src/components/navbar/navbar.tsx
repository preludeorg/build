import classNames from "classnames";
import EditorIcon from "../icons/editor-icon";
import HostsIcon from "../icons/hosts-icon";
import SettingsIcon from "../icons/settings-icon";
import styles from "./navbar.module.css";

interface Props {
  navigation: string;
  setNavigation: (n: string) => void;
  toggleServerPanel: () => void;
}

const Navbar: React.FC<Props> = ({
  navigation,
  setNavigation,
  toggleServerPanel,
}) => {
  return (
    <nav className={styles.navbar}>
      <ul className={styles.topIcons}>
        <li
          className={classNames(styles.iconWrapper, {
            [styles.active]: navigation === "editor",
          })}
          onClick={() => setNavigation("editor")}
        >
          <EditorIcon className={styles.icon} />
        </li>
        <li className={styles.iconWrapper} onClick={() => toggleServerPanel()}>
          <HostsIcon className={styles.icon} />
        </li>
      </ul>
      <li className={styles.iconWrapper}>
        <SettingsIcon className={styles.icon} />
      </li>
    </nav>
  );
};

export default Navbar;
