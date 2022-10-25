import ArrowRight from "../icons/arrow-right";
import WelcomeBlock from "./welcome-block";
import styles from "./welcome.module.css";
import rectangle from "../../assets/rectangle.png";
import rectangle2 from "../../assets/rectangle2.png";
import rectangle3 from "../../assets/rectangle3.png";

const Welcome = () => {
  return (
    <div className={styles.welcome}>
      <h1 className={styles.header}>Prelude IDE</h1>
      <h2 className={styles.tagline}>Security simplified</h2>
      <div className={styles.blockContainer}>
        <WelcomeBlock
          title={"Introduction to Operator"}
          description={
            "Learn about the basic concepts and go over the default TTP sets."
          }
          image={rectangle}
          link={"/"}
        />
        <WelcomeBlock
          title={"Your first TTP"}
          description={
            "Learn about the basic concepts and go over the default TTP sets."
          }
          image={rectangle2}
          link={"/"}
        />
        <WelcomeBlock
          title={"Using Operator at scale"}
          description={
            "Learn about the basic concepts and go over the default TTP sets."
          }
          image={rectangle3}
          link={"/"}
        />
      </div>
      <a
        className={styles.docs}
        href="https://docs.prelude.org"
        target="_blank"
      >
        <p className={styles.text}>More guides & documentation</p>
        <ArrowRight className={styles.rightArrow} />
      </a>
    </div>
  );
};

export default Welcome;
