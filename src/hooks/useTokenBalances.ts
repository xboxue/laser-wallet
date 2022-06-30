import { useSelector } from "react-redux";
import { useContractRead } from "wagmi";
import abi from "../abis/BalanceChecker.abi.json";
import { selectChainId } from "../features/network/networkSlice";

const GOERLI_CONTRACT = "0x9788C4E93f9002a7ad8e72633b11E8d1ecd51f9b";

const useTokenBalances = (addresses: string[], tokens: string[]) => {
  const chainId = useSelector(selectChainId);
  return useContractRead({
    addressOrName: GOERLI_CONTRACT,
    contractInterface: abi,
    functionName: "balances",
    args: [addresses, tokens],
    chainId,
    watch: true,
  });
};

export default useTokenBalances;
