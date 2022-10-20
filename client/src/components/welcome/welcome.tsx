import ArrowRight from '../icons/arrow-right';
import WelcomeBlock from './welcome-block';
import styles from './welcome.module.css';

const Welcome = () => {
  return (
    <div className={styles.welcome}>
      <h1 className={styles.welcomeHeader}>Prelude IDE</h1>
      <h2 className={styles.welcomeTagline}>Security simplified</h2>
      <div className={styles.blockContainer}>
        <WelcomeBlock 
          title={'Introduction to Operator'} 
          description={'Learn about the basic concepts and go over the default TTP sets.'} 
          image={'/static/images/rectangle.png'} 
          link={'/'}
        />
        <WelcomeBlock 
        title={'Your first TTP'} 
          description={'Learn about the basic concepts and go over the default TTP sets.'} 
          image={'/static/images/rectangle.png'} 
          link={'/'}
        />
        <WelcomeBlock 
          title={'Using Operator at scale'} 
          description={'Learn about the basic concepts and go over the default TTP sets.'} 
          image={'/static/images/rectangle.png'} 
          link={'/'}
        />
      </div>
      <a className={styles.docsBlock}>
        <p className={styles.docsBlockText}>More guides & documentation</p>
        <ArrowRight className={styles.rightArrow}/>
      </a>
    </div>
  );
}

export default Welcome;