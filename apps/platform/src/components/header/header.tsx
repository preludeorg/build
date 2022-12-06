import { PreludeIcon } from "@theprelude/ds";
import { useLocation } from "react-router-dom";
import styles from "./header.module.css";

const Header: React.FC = () => {
  const location = useLocation();

  const titles: Record<string, string> = {
    "/": "Welcome",
    "/build": "Build",
  };
  return (
    <header className={styles.header}>
      <section className={styles.brand}>
        <PreludeIcon className={styles.logo} />
        <span className={styles.divider} />
        <h1>{titles[location.pathname] ?? ""}</h1>
      </section>
      <section className={styles.right}></section>
    </header>
  );
};

export default Header;
