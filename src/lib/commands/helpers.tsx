import { authState } from "../../hooks/auth-store";
import styles from "../../components/terminal/commands.module.css";

export const isConnected = () => !!authState().credentials;

export const ErrorMessage: React.FC<{ message: string }> = ({ message }) => {
  return <span className={styles.error}>{message}</span>;
};

export const TerminalMessage: React.FC<{
  message: string;
  helpText?: string;
}> = ({ message, helpText }) => {
  return (
    <>
      <span>{message}</span>
      {helpText && <span className={styles.helpText}>{helpText}</span>}
    </>
  );
};
