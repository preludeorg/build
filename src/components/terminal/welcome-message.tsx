import { Credentials } from "@theprelude/sdk";

const WelcomeMessage: React.FC<{ host: string; credentials?: Credentials }> = ({
  host,
  credentials,
}) => {
  if (host && credentials) {
    return (
      <div>
        Welcome to Prelude Build
        <br />
        <br />
        Connected to {host}
        <br />
        <br />
        Type “list-manifest” to show all your TTPs
      </div>
    );
  }
  return (
    <span>
      Welcome to Prelude Build
      <br />
      <br />
      Type "use {`<handle>`}" to get started
      <br />
      <br />
    </span>
  );
};

export default WelcomeMessage;
