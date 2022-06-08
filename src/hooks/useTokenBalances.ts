import { useContractRead } from "wagmi";
import abi from "../abis/BalanceChecker.abi.json";

const GOERLI_CONTRACT = "0x9788C4E93f9002a7ad8e72633b11E8d1ecd51f9b";

const useTokenBalances = (addresses: string[], tokens: string[]) => {
  return useContractRead(
    { addressOrName: GOERLI_CONTRACT, contractInterface: abi },
    "balances",
    { args: [addresses, tokens], chainId: 5, watch: true }
  );
};

export default useTokenBalances;
