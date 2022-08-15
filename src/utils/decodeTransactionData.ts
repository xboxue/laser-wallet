import { ethers, providers } from "ethers";
import { abi as walletAbi } from "laser-sdk/dist/deployments/localhost/LaserWallet.json";
import { erc20ABI, erc721ABI } from "wagmi";
import { TRANSACTION_TYPES } from "../constants/transactions";
import { Transaction } from "../services/etherscan";

const decodeTransactionData = async (
  provider: providers.Provider,
  transaction: Transaction
) => {
  const tx = await provider.getTransaction(transaction.hash);

  if (tx.data === "0x") {
    return {
      type: TRANSACTION_TYPES.SEND,
      from: {
        address: transaction.from,
        ensName: await provider.lookupAddress(transaction.from),
      },
      to: {
        address: transaction.to,
        ensName: await provider.lookupAddress(transaction.from),
      },
      value: transaction.value,
    };
  }

  const iface = new ethers.utils.Interface(walletAbi);
  const [to, value, callData] = iface.parseTransaction({ data: tx.data }).args;

  const baseData = {
    from: {
      address: transaction.to,
      ensName: await provider.lookupAddress(transaction.to),
    },
    to: { address: to, ensName: await provider.lookupAddress(to) },
    value,
  };

  if (callData === "0x") return { type: TRANSACTION_TYPES.SEND, ...baseData };

  try {
    const data = await decodeContractData(provider, callData, to);
    return { ...data, ...baseData };
  } catch (error) {
    return { type: TRANSACTION_TYPES.CONTRACT_INTERACTION, ...baseData };
  }
};

const decodeContractData = async (
  provider: providers.Provider,
  callData: string,
  contractAddress: string
) => {
  try {
    const erc20Interface = new ethers.utils.Interface(erc20ABI);
    const method = erc20Interface.parseTransaction({
      data: callData,
    });
    const erc20 = new ethers.Contract(contractAddress, erc20ABI, provider);
    if (method.name === TRANSACTION_TYPES.TOKEN_APPROVE) {
      return {
        type: method.name,
        args: {
          spender: {
            address: method.args[0],
            ensName: await provider.lookupAddress(method.args[0]),
          },
          amount: method.args[1],
        },
        tokenName: await erc20.name(),
        tokenSymbol: await erc20.symbol(),
        tokenDecimals: await erc20.decimals(),
        contractAddress,
      };
    } else if (method.name === TRANSACTION_TYPES.TOKEN_TRANSFER)
      return {
        type: method.name,
        args: {
          recipient: {
            address: method.args[0],
            ensName: await provider.lookupAddress(method.args[0]),
          },
          amount: method.args[1],
        },
        tokenName: await erc20.name(),
        tokenSymbol: await erc20.symbol(),
        tokenDecimals: await erc20.decimals(),
        contractAddress,
      };
  } catch (error) {}

  try {
    const erc721Interface = new ethers.utils.Interface(erc721ABI);
    const method = erc721Interface.parseTransaction({
      data: callData,
    });
    return { type: method.name };
  } catch {}

  throw new Error("Unsupported contract type");
};

export default decodeTransactionData;
