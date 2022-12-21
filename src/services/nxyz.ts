import axios, { AxiosError } from "axios";
import Constants from "expo-constants";

const getChain = (chainId: number) => {
  if (chainId === 1) {
    return "ethereum";
  } else if (chainId === 5) {
    return "gor";
  } else throw new Error("Chain not supported");
};

export const getNFTMetadata = async (
  contractAddresses: string[],
  tokenIds: string[],
  chainId: number
) => {
  const { data } = await axios.get("https://api.n.xyz/api/v1/nfts", {
    params: {
      chainID: getChain(chainId),
      apikey: Constants.expoConfig.extra.nxyzApiKey,
      contractAddresses: contractAddresses.join(","),
      tokenIdentifiers: tokenIds.join(","),
    },
  });
  return data;
};

export const getTokenMetadata = async (
  contractAddresses: string[],
  chainId: number
) => {
  const { data } = await axios.get(
    "https://api.n.xyz/api/v1/fungibles/metadata",
    {
      params: {
        chainID: getChain(chainId),
        apikey: Constants.expoConfig.extra.nxyzApiKey,
        contractAddresses: contractAddresses.join(","),
      },
    }
  );
  return data;
};

export const getBalances = async (address: string, chainId: number) => {
  try {
    const { data } = await axios.get(
      `https://api.n.xyz/api/v1/address/${address}/balances/fungibles`,
      {
        params: {
          chainID: getChain(chainId),
          apikey: Constants.expoConfig.extra.nxyzApiKey,
          filterDust: true,
        },
      }
    );
    return data;
  } catch (error) {
    if (error instanceof AxiosError && error.response?.status === 404) {
      return [];
    }
    throw error;
  }
};

export const getNFTs = async (
  address: string,
  chainId: number,
  cursor?: string
) => {
  try {
    const { headers, data } = await axios.get(
      `https://api.n.xyz/api/v1/address/${address}/balances/nfts`,
      {
        params: {
          chainID: getChain(chainId),
          apikey: Constants.expoConfig.extra.nxyzApiKey,
          cursor,
        },
      }
    );
    return { results: data, nextCursor: headers["x-doc-next-cursor"] };
  } catch (error) {
    if (error instanceof AxiosError && error.response?.status === 404) {
      return { results: [] };
    }
    throw error;
  }
};

export const getTransactions = async (
  address: string,
  chainId: number,
  cursor?: string
) => {
  try {
    const { headers, data } = await axios.get(
      `https://api.n.xyz/api/v1/address/${address}/transactions`,
      {
        params: {
          chainID: getChain(chainId),
          apikey: Constants.expoConfig.extra.nxyzApiKey,
          cursor,
        },
      }
    );
    return { results: data, nextCursor: headers["x-doc-next-cursor"] };
  } catch (error) {
    if (error instanceof AxiosError && error.response?.status === 404) {
      return { results: [] };
    }
    throw error;
  }
};
