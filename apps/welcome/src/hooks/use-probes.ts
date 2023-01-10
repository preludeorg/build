import { useQuery } from "@tanstack/react-query";
import { getProbeList, select, useAuthStore } from "@theprelude/core";
import shallow from "zustand/shallow";

export const useProbes = () => {
  const serviceConfig = useAuthStore(select("host", "credentials"), shallow);
  const { data, isLoading } = useQuery(
    ["probes", serviceConfig],
    () => getProbeList(serviceConfig),
    { enabled: !!serviceConfig.credentials }
  );

  return { data, isLoading };
};
