import BuildIcon from "../icons/build-icon";
import styles from "./nav.module.css";

const Nav: React.FC = () => {
  return (
    <nav className={styles.nav}>
      <section className={styles.top}>
        <a className={styles.item}>
          <BuildIcon />
        </a>
      </section>

      <section className={styles.bottom}></section>
    </nav>
  );
};

export default Nav;
