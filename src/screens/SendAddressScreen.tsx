import Ionicons from "@expo/vector-icons/Ionicons";
import { useNavigation } from "@react-navigation/native";
import { isAddress } from "ethers/lib/utils";
import { Box, Button, Circle, Icon, Input, Pressable, Text } from "native-base";
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
import { useEnsAddress, useProvider } from "wagmi";
import { selectChainId } from "../features/network/networkSlice";

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
  const [value, setValue] = useState("");
  const chainId = useSelector(selectChainId);
  const provider = useProvider({ chainId: 1 });

  // const { data: ensAddress } = useQuery(["ensAddres", value, chainId], () => {
  //   return provider.resolveName(value);
  // });
  // console.log(ensAddress);

  const { data: ensDomains } = useQuery(
    ["ensDomains", value],
    async () => {
      const { data } = await axios.post(
        "https://api.thegraph.com/subgraphs/name/ensdomains/ens",
        {
          query: print(GET_ENS_SUGGESTIONS),
          variables: {
            first: 5,
            name: value,
          },
        }
      );
      return data;
    },
    {
      enabled: value.length > 2,
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
    if (isAddress(value))
      return <AddressPreviewContainer address={value} onPress={handlePress} />;

    return (
      <EnsPreviewContainer
        ensName={value}
        onPress={handlePress}
        // errorComponent={<Text mt="3">Invalid address</Text>}
      />
    );
  }, [value]);

  return (
    <Box p="4" flex={1}>
      <Input
        value={value}
        onChangeText={setValue}
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
      />
      <Box flexDir="row" mt="4">
        <Button
          bgColor="gray.800"
          leftIcon={<Icon as={<Feather name="clipboard" />} color="white" />}
          _text={{ fontSize: "sm" }}
          px="4"
        >
          Paste from clipboard
        </Button>
      </Box>
      {renderPreviewItem()}
      {/* <FlashList
        data={ensDomains}
        renderItem={({ item }) => (
          <AddressOrEnsPreviewItem
            address={item.resolvedAddress.id}
            ensName={item.name}
          />
        )}
      /> */}
      {/* <Button bgColor="gray.800" _text={{ color: "gray.400" }} > */}
      {/* <Button isDisabled={!ensAddress}>Next</Button> */}
      {/* {vaultAddress === walletAddress && (
          <Item
            mt={2}
            onPress={() =>
              navigation.navigate("SendAsset", { address: wallets[0].address })
            }
            title="Send to Wallet 1"
            icon={
              <Circle bg="gray.800" size="9">
                <Icon
                  as={<Ionicons name="flash-outline" />}
                  size="4"
                  color="white"
                />
              </Circle>
            }
          />
        )}
        {vaultAddress && vaultAddress !== walletAddress && (
          <Item
            mt={2}
            onPress={() =>
              navigation.navigate("SendAsset", { address: vaultAddress })
            }
            title="Send to vault"
            icon={
              <Circle bg="gray.800" size="9">
                <Icon
                  as={<Ionicons name="flash-outline" />}
                  size="4"
                  color="white"
                />
              </Circle>
            }
          />
        )} */}
    </Box>
  );
};

export default SendAddressScreen;
