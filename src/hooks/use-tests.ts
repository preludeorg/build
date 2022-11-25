import { useQuery } from "@tanstack/react-query";
import shallow from "zustand/shallow";
import { getTestList } from "../lib/api";
import { select } from "../lib/utils/select";
import useAuthStore from "./auth-store";

export const useTests = () => {
  const serviceConfig = useAuthStore(select("host", "credentials"), shallow);
  const { data, isLoading } = useQuery(["tests", serviceConfig], () =>
    getTestList(serviceConfig)
  );

  return { data, isLoading };
};
