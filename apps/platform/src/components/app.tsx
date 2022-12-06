import Build from "@theprelude/build";
import Header from "./header/header";
import Nav from "./nav/nav";
import styles from "./platform.module.css";

function Platform() {
  return (
    <div className={styles.platform}>
      <Header />
      <Nav />
      <main className={styles.wrapper}>
        <Build />
      </main>
    </div>
  );
}

export default Platform;
