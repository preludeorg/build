import Build from "@theprelude/build";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Header from "./header/header";
import Nav from "./nav/nav";
import styles from "./platform.module.css";

function Platform() {
  return (
    <Router>
      <div className={styles.platform}>
        <Header />
        <Nav />
        <main className={styles.wrapper}>
          <Routes>
            <Route path="/" element={<Build />} />
            <Route path="/build" element={<Build />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default Platform;
