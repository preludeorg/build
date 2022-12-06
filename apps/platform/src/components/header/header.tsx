import { PreludeIcon } from "@theprelude/ds";
import styles from "./header.module.css";

const Header: React.FC = () => {
  return (
    <header className={styles.header}>
      <section className={styles.brand}>
        <PreludeIcon className={styles.logo} />
        <span className={styles.divider} />
        <h1>Build</h1>
      </section>
      <section className={styles.right}></section>
    </header>
  );
};

export default Header;
