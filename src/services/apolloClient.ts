import {
  ApolloClient,
  createHttpLink,
  from,
  InMemoryCache,
  NormalizedCacheObject,
} from "@apollo/client";
import { setContext } from "@apollo/client/link/context";
import { onError } from "@apollo/client/link/error";
import { RetryLink } from "@apollo/client/link/retry";
import { SentryLink } from "apollo-link-sentry";
import Constants from "expo-constants";

let client: ApolloClient<NormalizedCacheObject>;

type ClientOptions = {
  getToken: () => Promise<string | null>;
  onError: (error?: unknown) => void;
};

const createApolloClient = (options: ClientOptions) => {
  const sentryLink = new SentryLink();

  const errorLink = onError(({ graphQLErrors, networkError }) => {
    if (graphQLErrors) {
      console.log(graphQLErrors);
      options.onError();
    }
    if (networkError) {
      console.log(networkError);
      options.onError(networkError);
    }
  });

  const retryLink = new RetryLink();

  const httpLink = createHttpLink({
    uri: Constants.expoConfig.extra.graphqlApi,
  });

  const authLink = setContext(async (_, { headers }) => {
    const token = await options.getToken();

    return {
      headers: {
        ...headers,
        authorization: token ? `Bearer ${token}` : "",
      },
    };
  });

  return new ApolloClient({
    link: from([authLink, errorLink, sentryLink, retryLink, httpLink]),
    cache: new InMemoryCache(),
  });
};

const getApolloClient = (options: ClientOptions) => {
  if (!client) client = createApolloClient(options);
  return client;
};

export default getApolloClient;
