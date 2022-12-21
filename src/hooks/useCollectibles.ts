import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { useSelector } from "react-redux";
import { selectChainId } from "../features/network/networkSlice";
import { getNFTs } from "../services/nxyz";

const useCollectibles = (walletAddress: string) => {
  const chainId = useSelector(selectChainId);

  return useInfiniteQuery(
    ["collectibles", walletAddress],
    async ({ pageParam }) => {
      const data = await getNFTs(walletAddress, chainId, pageParam);
      return { ...data, results: data.results.filter((nft) => !nft.isSpam) };
    },
    { getNextPageParam: (lastPage) => lastPage.nextCursor }
  );
};

export default useCollectibles;
