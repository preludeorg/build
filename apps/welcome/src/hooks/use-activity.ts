import { useQuery } from "@tanstack/react-query";
import { getActivity, select, useAuthStore } from "@theprelude/core";
import shallow from "zustand/shallow";

export const useActivity = () => {
  const serviceConfig = useAuthStore(select("host", "credentials"), shallow);
  const { data, isLoading } = useQuery(
    ["activity", serviceConfig],
    () => getActivity(serviceConfig),
    { enabled: !!serviceConfig.credentials }
  );

  return { data, isLoading };
};
