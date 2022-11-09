import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import Constants from "expo-constants";

const useCollectibles = (walletAddress: string) => {
  return useQuery(
    ["collectibles", walletAddress],
    async () => {
      const { data } = await axios.get(
        "https://testnets-api.opensea.io/api/v1/assets",
        {
          params: { owner: walletAddress },
          // headers: {
          //   "X-API-KEY": Constants.expoConfig.extra.openseaApiKey,
          // },
        }
      );
      return data;
    },
    {
      select: (data) => data.assets.filter((asset) => asset.image_url),
    }
  );
};

export default useCollectibles;
