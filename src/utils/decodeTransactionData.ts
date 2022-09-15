import { fromUnixTime } from "date-fns";
import { ethers, providers } from "ethers";
import { LaserFactory__factory } from "laser-sdk/dist/typechain";
import { erc20ABI, erc721ABI } from "wagmi";
import { Erc20__factory } from "../abis/types";
import { TRANSACTION_TYPES } from "../constants/transactions";

export const decodeTxDataByHash = async (
  provider: providers.Provider,
  hash: string
) => {
  const [tx, receipt] = await Promise.all([
    provider.getTransaction(hash),
    provider.getTransactionReceipt(hash),
  ]);

  const baseData = {
    from: { address: tx.from, ensName: await provider.lookupAddress(tx.from) },
    to: { address: tx.to, ensName: await provider.lookupAddress(tx.to) },
    value: tx.value,
    ...(receipt && {
      isError: receipt.status === 0,
      timestamp: fromUnixTime(
        (await provider.getBlock(receipt.blockNumber)).timestamp
      ),
    }),
  };

  if (tx.data === "0x") return { type: TRANSACTION_TYPES.SEND, ...baseData };

  try {
    const data = await decodeContractData(provider, tx.data, tx.to);
    return { ...data, ...baseData };
  } catch (error) {
    return { type: TRANSACTION_TYPES.CONTRACT_INTERACTION, ...baseData };
  }
};

export const decodePendingTxData = async (
  provider: providers.Provider,
  tx: providers.TransactionRequest
) => {
  const baseData = {
    from: { address: tx.from, ensName: await provider.lookupAddress(tx.from) },
    to: { address: tx.to, ensName: await provider.lookupAddress(tx.to) },
    value: tx.value,
  };

  if (tx.data === "0x") return { type: TRANSACTION_TYPES.SEND, ...baseData };

  try {
    const data = await decodeContractData(provider, tx.data, tx.to);
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
    const erc20 = Erc20__factory.connect(contractAddress, provider);
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

  try {
    const factoryInterface = new ethers.utils.Interface(
      LaserFactory__factory.abi
    );
    const method = factoryInterface.parseTransaction({
      data: callData,
    });
    if (method.name === "createProxy")
      return { type: TRANSACTION_TYPES.DEPLOY_WALLET };
  } catch {}

  throw new Error("Unsupported contract type");
};
