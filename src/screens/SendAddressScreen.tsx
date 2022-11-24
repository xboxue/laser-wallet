import Ionicons from "@expo/vector-icons/Ionicons";
import { useNavigation } from "@react-navigation/native";
import { isAddress } from "ethers/lib/utils";
import {
  Box,
  Button,
  Circle,
  Icon,
  Input,
  Pressable,
  Spinner,
  Text,
} from "native-base";
import { useCallback, useState } from "react";
import { useSelector } from "react-redux";
import AddressPreviewContainer from "../components/AddressPreviewContainer/AddressPreviewContainer";
import EnsPreviewContainer from "../components/EnsPreviewContainer/EnsPreviewContainer";
import {
  selectVaultAddress,
  selectWalletAddress,
  selectWallets,
} from "../features/wallet/walletSlice";
import Feather from "@expo/vector-icons/Feather";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { gql } from "@apollo/client";
import { print } from "graphql";
import { sortBy } from "lodash";
import AddressOrEnsPreviewItem from "../components/AddressOrEnsPreviewItem/AddressOrEnsPreviewItem";
import { FlashList } from "@shopify/flash-list";
import { useEnsAddress, useEnsAvatar, useEnsName, useProvider } from "wagmi";
import { selectChainId } from "../features/network/networkSlice";
import * as Clipboard from "expo-clipboard";
import useEnsNameAndAvatar from "../hooks/useEnsNameAndAvatar";
import isEnsDomain from "../utils/isEnsDomain";

const GET_ENS_SUGGESTIONS = gql`
  query GetENSSuggestions($name: String!, $first: Int!) {
    domains(
      first: $first
      where: { name_starts_with: $name, resolvedAddress_not: null }
      orderBy: labelName
      orderDirection: asc
    ) {
      id
      name
      labelName
      resolvedAddress {
        id
      }
    }
  }
`;

const SendAddressScreen = () => {
  const navigation = useNavigation();
  const [addressOrName, setAddressOrName] = useState("");
  const chainId = useSelector(selectChainId);

  const { data: ensName, isLoading: ensNameLoading } = useEnsName({
    address: addressOrName,
    enabled: isAddress(addressOrName),
    chainId,
  });

  const { data: ensAvatar, isLoading: ensAvatarLoading } = useEnsAvatar({
    addressOrName,
    enabled: isAddress(addressOrName) || isEnsDomain(addressOrName),
    chainId,
  });

  const { data: address, isLoading: addressLoading } = useEnsAddress({
    name: addressOrName,
    chainId,
    enabled: isEnsDomain(addressOrName),
  });

  const { data: ensDomains, isInitialLoading: ensDomainsLoading } = useQuery(
    ["ensDomains", addressOrName],
    async () => {
      const { data } = await axios.post(
        "https://api.thegraph.com/subgraphs/name/ensdomains/ens",
        {
          query: print(GET_ENS_SUGGESTIONS),
          variables: {
            first: 5,
            name: addressOrName,
          },
        }
      );
      return data;
    },
    {
      enabled: addressOrName.length > 2,
      select: ({ data }) =>
        sortBy(data?.domains, (domain) => domain.name.length),
    }
  );

  const handlePress = (address: string, ensName?: string) => {
    navigation.navigate("Send Token", {
      address,
      ensName,
    });
  };

  const renderPreviewItem = useCallback(() => {
    if (ensNameLoading || addressLoading) return <Spinner size="lg" mt="6" />;

    if (address)
      return (
        <AddressOrEnsPreviewItem
          address={address}
          ensName={addressOrName}
          ensAvatar={ensAvatar || undefined}
          onPress={handlePress}
        />
      );

    if (isAddress(addressOrName))
      return (
        <AddressOrEnsPreviewItem
          address={addressOrName}
          ensName={ensName || undefined}
          ensAvatar={ensAvatar || undefined}
          onPress={handlePress}
        />
      );

    if (ensDomainsLoading) return <Spinner size="lg" mt="6" />;

    return (
      <FlashList
        data={ensDomains}
        renderItem={({ item }) => (
          <AddressOrEnsPreviewItem
            address={item.resolvedAddress.id}
            ensName={item.name}
            onPress={handlePress}
          />
        )}
      />
    );
  }, [
    addressOrName,
    ensDomains,
    address,
    ensAvatar,
    ensName,
    ensAvatarLoading,
    ensNameLoading,
    addressLoading,
  ]);

  return (
    <Box p="4" flex={1}>
      <Input
        value={addressOrName}
        onChangeText={setAddressOrName}
        placeholder="Address or ENS"
        variant="filled"
        fontSize="lg"
        InputLeftElement={
          <Icon as={Ionicons} name="search-outline" ml="3" size="5" />
        }
        p="2"
        bgColor="gray.800"
        autoCorrect={false}
        autoCapitalize="none"
        autoFocus
      />
      <Box flexDir="row" mt="4">
        <Button
          bgColor="gray.800"
          leftIcon={<Icon as={<Feather name="clipboard" />} color="white" />}
          _text={{ fontSize: "sm" }}
          px="4"
          onPress={async () =>
            setAddressOrName(await Clipboard.getStringAsync())
          }
        >
          Paste from clipboard
        </Button>
      </Box>
      {renderPreviewItem()}
    </Box>
  );
};

export default SendAddressScreen;
