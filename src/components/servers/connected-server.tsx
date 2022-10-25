import styles from "./servers.module.css";

const ConnectedServer = () => {
  return (
    <div className={styles.container}>
      <div className={styles.status}/>
      <div className={styles.serverName}>testserver.prelude.org</div>
    </div>
  );
}
 
export default ConnectedServer;