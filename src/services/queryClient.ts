import { QueryClient, QueryCache, MutationCache } from "@tanstack/react-query";
import * as Sentry from "sentry-expo";

let queryClient: QueryClient;
const getQueryClient = (onError: (error: unknown) => void) => {
  if (!queryClient) {
    queryClient = new QueryClient({
      queryCache: new QueryCache({
        onError: (error, query) => {
          if (!query.options.disableErrorToast) onError(error);
          console.error(error);
          Sentry.Native.captureException(error);
        },
      }),
      mutationCache: new MutationCache({
        onError: (error, variables, context, mutation) => {
          if (!mutation?.meta?.disableErrorToast) onError(error);
          console.error(error);
          Sentry.Native.captureException(error);
        },
      }),
    });
  }
  return queryClient;
};

export default getQueryClient;
