import { authState } from "../../hooks/auth-store";
import styles from "../../components/terminal/commands.module.css";

export const isConnected = () => !!authState().credentials;

export const ErrorMessage: React.FC<{ message: string }> = ({ message }) => {
  return (
    <div>
      <span className={styles.error}>{message}</span>
    </div>
  );
};

export const TerminalMessage: React.FC<{
  message: string;
  helpText?: string;
}> = ({ message, helpText }) => {
  return (
    <div>
      <span>{message}</span>
      {helpText && <span className={styles.helpText}>{helpText}</span>}
    </div>
  );
};
