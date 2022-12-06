import PreludeIcon from "../icons/prelude-icon";
import styles from "./header.module.css";

const Header: React.FC = () => {
  return (
    <header className={styles.header}>
      <section className={styles.brand}>
        <PreludeIcon className={styles.logo} />
        <span className={styles.divider} />
        <h1>Prelude Build</h1>
      </section>
      <section className={styles.right}></section>
    </header>
  );
};

export default Header;
