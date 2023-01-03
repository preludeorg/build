import { useQuery } from "@tanstack/react-query";
import { listTests, select, useAuthStore } from "@theprelude/core";
import shallow from "zustand/shallow";

export const useTests = () => {
  const serviceConfig = useAuthStore(select("host", "credentials"), shallow);
  const { data, isLoading } = useQuery(["tests", serviceConfig], () =>
    listTests(serviceConfig)
  );

  return { data, isLoading };
};
