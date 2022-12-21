import { useQuery } from "@tanstack/react-query";
import { useSelector } from "react-redux";
import { selectChainId } from "../features/network/networkSlice";
import { getBalances } from "../services/nxyz";

const useBalances = (walletAddress: string) => {
  const chainId = useSelector(selectChainId);

  return useQuery(
    ["balances", walletAddress, chainId],
    () => getBalances(walletAddress, chainId),
    {
      ...(chainId === 1 && {
        select: (tokens) => tokens.filter((token) => token.fiat?.[0].value > 1),
      }),
    }
  );
};

export default useBalances;
