import React from "react";
import Servers from "./servers/servers";

const overlays: Record<string, React.FC> = {
  servers: Servers,
};

const Overlays: React.FC<{ overlay: string }> = ({ overlay }) => {
  const Component = overlays[overlay];

  if (!Component) return null;

  return <Component />;
};

export default Overlays;
