import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import { isEqual, uniq, uniqWith } from "lodash";
import { useSelector } from "react-redux";
import { WETH_CONTRACT } from "../constants/contracts";
import { selectChainId } from "../features/network/networkSlice";
import { getNFTMetadata, getTokenMetadata } from "../services/nxyz";
import { getTransfers } from "../services/safe";
import isEqualCaseInsensitive from "../utils/isEqualCaseInsensitive";

const PAGE_SIZE = 15;

const useTransfers = (walletAddress: string) => {
  const chainId = useSelector(selectChainId);

  return useInfiniteQuery(
    ["transfers", walletAddress, chainId],
    async ({ pageParam: offset = 0 }) => {
      const data = await getTransfers(
        walletAddress,
        chainId,
        PAGE_SIZE,
        offset
      );
      const { results: transfers } = data;

      const nfts = uniqWith(
        transfers
          .filter((transfer) => transfer.type === "ERC721_TRANSFER")
          .map((transfer) => ({
            tokenId: transfer.tokenId,
            contractAddress: transfer.tokenAddress as string,
          })),
        isEqual
      );
      const nftMetadata = nfts.length
        ? await getNFTMetadata(
            nfts.map((nft) => nft.contractAddress),
            nfts.map((nft) => nft.tokenId),
            chainId
          )
        : [];

      const tokenAddresses = uniq(
        transfers
          .filter(
            (transfer) =>
              transfer.type === "ERC20_TRANSFER" ||
              transfer.type === "ETHER_TRANSFER"
          )
          .map((transfer) =>
            transfer.type === "ETHER_TRANSFER"
              ? WETH_CONTRACT
              : (transfer.tokenAddress as string)
          )
      );
      const tokenMetadata = tokenAddresses.length
        ? await getTokenMetadata(tokenAddresses, chainId)
        : [];

      return {
        ...data,
        results: transfers
          .map((transfer) => {
            if (transfer.type === "ERC721_TRANSFER") {
              return {
                ...transfer,
                metadata: nftMetadata.find(
                  (nft) =>
                    nft.contractAddress === transfer.tokenAddress &&
                    nft.nft.tokenID === transfer.tokenId
                ),
              };
            }

            if (transfer.type === "ERC20_TRANSFER") {
              return {
                ...transfer,
                metadata: tokenMetadata.find((token) =>
                  isEqualCaseInsensitive(
                    token.contractAddress,
                    transfer.tokenAddress
                  )
                ),
              };
            }

            if (transfer.type === "ETHER_TRANSFER") {
              const metadata = tokenMetadata.find((token) =>
                isEqualCaseInsensitive(token.contractAddress, WETH_CONTRACT)
              );
              return { ...transfer, metadata };
            }

            return transfer;
          })
          .filter(
            (transfer) =>
              transfer.type !== "ERC20_TRANSFER" ||
              transfer.metadata?.currentPrice?.fiat?.[0].value > 1
          ),
      };
    },
    {
      getNextPageParam: (lastPage, pages) => {
        if (lastPage.count < PAGE_SIZE) return;
        return pages.length * PAGE_SIZE;
      },
    }
  );
};

export default useTransfers;
