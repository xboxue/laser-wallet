import {
  ApolloClient,
  createHttpLink,
  InMemoryCache,
  NormalizedCacheObject,
} from "@apollo/client";
import { setContext } from "@apollo/client/link/context";

let client: ApolloClient<NormalizedCacheObject>;

type ClientOptions = {
  getToken: () => Promise<string | null>;
};

const createApolloClient = ({ getToken }: ClientOptions) => {
  const httpLink = createHttpLink({
    uri: process.env.REACT_APP_HASURA_API,
  });

  const authLink = setContext(async (_, { headers }) => {
    const token = await getToken();

    return {
      headers: {
        ...headers,
        authorization: token ? `Bearer ${token}` : "",
      },
    };
  });

  return new ApolloClient({
    link: authLink.concat(httpLink),
    cache: new InMemoryCache(),
  });
};

const getApolloClient = (options: ClientOptions) => {
  if (!client) client = createApolloClient(options);
  return client;
};

export default getApolloClient;
