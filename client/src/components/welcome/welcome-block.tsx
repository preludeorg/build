import styles from './welcome.module.css';

const WelcomeBlock = (props: any) => {
  return (
    <a className={styles.welcomeBlock} href={props.link}>
      <h2 className={styles.blockTitle}>{props.title}</h2>
      <img className={styles.blockImage} src={props.image}/>
      <p className={styles.blockDescription}>{props.description}</p>
    </a>
  );
}
 
export default WelcomeBlock;