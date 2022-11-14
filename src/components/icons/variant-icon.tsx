import DarwinIcon from "./darwin-icon";
import LinuxIcon from "./linux-icon";
import WindowsIcon from "./windows-icon";

const VariantIcon: React.FC<{ platform?: string; className: string }> = ({
  platform,
  className,
}) => {
  const variantIcons: Record<string, JSX.Element> = {
    darwin: <DarwinIcon className={className} />,
    linux: <LinuxIcon className={className} />,
    windows: <WindowsIcon className={className} />,
  };
  return platform ? variantIcons[platform] : null;
};

export default VariantIcon;
