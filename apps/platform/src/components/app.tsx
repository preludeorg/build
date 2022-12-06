import Build from "@theprelude/build";
import Header from "./header/header";
import Nav from "./nav/nav";
import styles from "./platform.module.css";

function Platform() {
  return (
    <div className={styles.platform}>
      <Header />
      <div className={styles.wrapper}>
        <Nav />
        <Build />
      </div>
    </div>
  );
}

export default Platform;
