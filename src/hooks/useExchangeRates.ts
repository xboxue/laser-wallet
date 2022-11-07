import { useQuery } from "@tanstack/react-query";
import axios from "axios";

const useExchangeRates = () => {
  return useQuery(
    ["exchangeRates"],
    async () => {
      const { data } = await axios.get(
        "https://api.coinbase.com/v2/exchange-rates"
      );
      return data;
    },
    { select: ({ data }) => data.rates }
  );
};

export default useExchangeRates;
