import React from "react";
import Servers from "./servers/servers";
import TestCatalog from "./tests/test-catalog";
import VerifiedTests from "./verified-tests/verified-tests";

const overlays: Record<string, React.FC> = {
  servers: Servers,
  testCatalog: TestCatalog,
  verifiedTests: VerifiedTests,
};

const Overlays: React.FC<{ overlay: string }> = ({ overlay }) => {
  const Component = overlays[overlay];

  if (!Component) return null;

  return <Component />;
};

export default Overlays;
