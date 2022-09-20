import { QueryClient, QueryCache, MutationCache } from "@tanstack/react-query";

let queryClient: QueryClient;
const getQueryClient = (onError: (error: unknown) => void) => {
  if (!queryClient) {
    queryClient = new QueryClient({
      queryCache: new QueryCache({
        onError: (error, query) => {
          if (!query?.meta?.disableGlobalErrorHandler) onError(error);
        },
      }),
      mutationCache: new MutationCache({
        onError: (error, variables, context, mutation) => {
          if (!mutation?.meta?.disableGlobalErrorHandler) onError(error);
        },
      }),
    });
  }
  return queryClient;
};

export default getQueryClient;
