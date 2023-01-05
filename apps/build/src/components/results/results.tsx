import { useMutation } from "@tanstack/react-query";
import classNames from "classnames";

import {
  createURL,
  parseBuildVerifiedSecurityTest,
  select,
  useAuthStore,
} from "@theprelude/core";
import {
  AlertIcon,
  Button,
  CheckmarkIcon,
  ChevronIcon,
  CopyIcon,
  DownloadIcon,
  IconButton,
  notifyError,
  notifySuccess,
  TimeIcon,
  VariantIcon,
} from "@theprelude/ds";
import { buildStyles, CircularProgressbar } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import styles from "./results.module.css";

const Results: React.FC = () => {
  const [deployURL, setDeployURL] = useState<string | null>(null);
  const mutation = useMutation(
    () => createURL(result.name, { host, credentials }),
    {
      onSuccess: ({ url }) => {
        setDeployURL(url);
      },
      onSettled: () => {
        showTooltip();
      },
    }
  );
  return <li className={styles.variantContainer}></li>;
};

interface DownloadLinkProps {
  onClick: () => void;
  deployURL: string | null;
  loading: boolean;
  timer: { percent: number; minutes: number; seconds: number };
}

const DownloadLink: React.FC<DownloadLinkProps> = ({
  onClick,
  deployURL,
  loading,
  timer,
}) => {
  const handleCopy = async () => {
    try {
      if (!deployURL) {
        throw new Error("missing url");
      }
      await navigator.clipboard.writeText(deployURL);
      notifySuccess("Link copied to clipboard");
    } catch (error) {
      notifyError("Failed to copy to clipboard", error);
    }
  };

  return (
    <div onClick={(e) => e.stopPropagation()}>
      {deployURL ? (
        <div className={classNames(styles.download, styles.copy)}>
          <input
            type="url"
            value={deployURL}
            readOnly
            className={styles.url}
          ></input>
          <IconButton
            className={styles.copyIconButton}
            onClick={() => handleCopy()}
            intent="primary"
            icon={<CopyIcon />}
          />
          <div style={{ width: 20, height: 20, marginTop: -6 }}>
            <CircularProgressbar
              counterClockwise
              value={timer.percent}
              strokeWidth={50}
              styles={buildStyles({
                strokeLinecap: "butt",
                backgroundColor: "#D9D9D9",
                pathColor: "#3D4246",
              })}
            />
          </div>
          <span>
            Expires in {timer.minutes.toString().padStart(2, "0")}:
            {timer.seconds.toString().padStart(2, "0")}
          </span>
        </div>
      ) : (
        <Button
          onClick={onClick}
          intent={"secondary"}
          size={"small"}
          icon={<DownloadIcon />}
          loading={loading}
        >
          {loading ? "Generating link..." : "Generate Deploy Link"}
        </Button>
      )}
    </div>
  );
};

export default Results;
