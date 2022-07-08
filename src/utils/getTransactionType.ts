import { ethers, providers } from "ethers";
import { erc20ABI, erc721ABI } from "wagmi";
import { TRANSACTION_TYPES } from "../constants/transactions";
import { Transaction } from "../services/etherscan";
import isContractAddress from "./isContractAddress";

const getTransactionType = async (
  provider: providers.Provider,
  transaction: Transaction
) => {
  if (!transaction.to) return TRANSACTION_TYPES.DEPLOY_CONTRACT;

  const isContract = await isContractAddress(provider, transaction.to);
  if (!isContract) return TRANSACTION_TYPES.SEND;

  try {
    const name = await getTokenMethodName(provider, transaction);
    return name;
  } catch {
    return TRANSACTION_TYPES.CONTRACT_INTERACTION;
  }
};

const getTokenMethodName = async (
  provider: providers.Provider,
  transaction: Transaction
) => {
  const tx = await provider.getTransaction(transaction.hash);
  const iface = new ethers.utils.Interface([
    "function exec(address to, uint256 value, bytes callData, uint256 _nonce, uint256 maxFeePerGas, uint256 maxPriorityFeePerGas, uint256 gasLimit, bytes signatures)",
  ]);
  const callData = iface.parseTransaction({ data: tx.data }).args[2];

  try {
    const erc20Interface = new ethers.utils.Interface(erc20ABI);
    const { name } = erc20Interface.parseTransaction({
      data: callData,
    });
    return name;
  } catch {}

  try {
    const erc721Interface = new ethers.utils.Interface(erc721ABI);
    const { name } = erc721Interface.parseTransaction({
      data: callData,
    });
    return name;
  } catch {}

  throw new Error("Unsupported contract type");
};

export default getTransactionType;
