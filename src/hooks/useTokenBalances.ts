import { providers } from "ethers";
import { useSelector } from "react-redux";
import { useContractRead } from "wagmi";
import abi from "../abis/BalanceChecker.abi.json";
import { selectChainId } from "../features/network/networkSlice";

const BALANCE_CONTRACT = {
  homestead: "0xb1f8e55c7f64d203c1400b9d8555d050f94adf39",
  ropsten: "0x8D9708f3F514206486D7E988533f770a16d074a7",
  rinkeby: "0x3183B673f4816C94BeF53958BaF93C671B7F8Cf2",
  kovan: "0x55ABBa8d669D60A10c104CC493ec5ef389EC92bb",
  goerli: "0x9788C4E93f9002a7ad8e72633b11E8d1ecd51f9b",
};

const useTokenBalances = (addresses: string[], tokens: string[]) => {
  const chainId = useSelector(selectChainId);
  const chain = providers.getNetwork(chainId).name;
  return useContractRead({
    addressOrName: BALANCE_CONTRACT[chain],
    contractInterface: abi,
    functionName: "balances",
    args: [addresses, tokens],
    chainId,
    watch: true,
  });
};

export default useTokenBalances;
