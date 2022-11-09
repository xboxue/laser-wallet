import { useQuery } from "@tanstack/react-query";
import { getBalances } from "../services/safe";

const useBalances = (walletAddress: string) => {
  return useQuery(["balances", walletAddress], () =>
    getBalances(walletAddress)
  );
};

export default useBalances;
