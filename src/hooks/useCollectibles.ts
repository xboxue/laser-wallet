import { useQuery } from "@tanstack/react-query";
import axios from "axios";

const useCollectibles = (walletAddress: string) => {
  return useQuery(
    ["collectibles", walletAddress],
    async () => {
      const { data } = await axios.get("https://api.opensea.io/api/v1/assets", {
        params: { owner: "0x869Ce3c7415F06Db4ff6d599d629C1a9C7C8a820" },
        headers: {
          "X-API-KEY": "8e7b1de17b664412ad9b6a15be4196c8",
        },
      });
      return data;
    },
    {
      select: (data) => data.assets.filter((asset) => asset.image_url),
    }
  );
};

export default useCollectibles;
