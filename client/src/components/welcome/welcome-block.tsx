import styles from './welcome.module.css';

const WelcomeBlock = (props: any) => {
  return (
    <a className={styles.block} href={props.link}>
      <h2 className={styles.title}>{props.title}</h2>
      <img className={styles.image} src={props.image}/>
      <p className={styles.description}>{props.description}</p>
    </a>
  );
}
 
export default WelcomeBlock;