import React from "react";
import SecurityTests from "./security-tests/security-tests";
import Servers from "./servers/servers";

const overlays: Record<string, React.FC> = {
  servers: Servers,
  securityTests: SecurityTests,
};

const Overlays: React.FC<{ overlay: string }> = ({ overlay }) => {
  const Component = overlays[overlay];

  if (!Component) return null;

  return <Component />;
};

export default Overlays;
