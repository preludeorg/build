import styles from "./welcome.module.css";

const WelcomeBlock: React.FC<{
  link: string;
  title: string;
  image: string;
  description: string;
}> = (props) => {
  return (
    <a className={styles.block} href={props.link} target="_blank">
      <h2 className={styles.title}>{props.title}</h2>
      <img className={styles.image} src={props.image} />
      <p className={styles.description}>{props.description}</p>
    </a>
  );
};

export default WelcomeBlock;
