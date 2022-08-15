import { QueryClient, QueryCache, MutationCache } from "@tanstack/react-query";

let queryClient: QueryClient;
const getQueryClient = (onError: (error: unknown) => void) => {
  if (!queryClient) {
    queryClient = new QueryClient({
      queryCache: new QueryCache({ onError }),
      mutationCache: new MutationCache({ onError }),
    });
  }
  return queryClient;
};

export default getQueryClient;
