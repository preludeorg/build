import DarwinIcon from "./darwin-icon";
import LinuxIcon from "./linux-icon";
import WindowsIcon from "./windows-icon";

const VariantIcon: React.FC<{ variantName: string; className: string }> = ({
  variantName,
  className,
}) => {
  const variantIcons: Record<string, JSX.Element> = {
    darwin: <DarwinIcon className={className} />,
    linux: <LinuxIcon className={className} />,
    windows: <WindowsIcon className={className} />,
  };
  const icon = Object.keys(variantIcons).filter((v) => variantName.includes(v));
  return variantIcons[icon.toString()];
};

export default VariantIcon;
