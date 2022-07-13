import Ionicons from "@expo/vector-icons/Ionicons";
import { useNavigation } from "@react-navigation/native";
import { isAddress } from "ethers/lib/utils";
import {
  Avatar,
  Box,
  Icon,
  Input,
  Pressable,
  Skeleton,
  Text,
} from "native-base";
import { useState } from "react";
import { useSelector } from "react-redux";
import { useEnsAddress, useEnsAvatar, useEnsName } from "wagmi";
import { selectChainId } from "../features/network/networkSlice";
import formatAddress from "../utils/formatAddress";

const SendAddressScreen = () => {
  const chainId = useSelector(selectChainId);
  const navigation = useNavigation();
  const [value, setValue] = useState("");

  const isEnsDomain = value.includes(".");

  // Resolve ENS name to address if input is ENS domain
  const { data: addressFromEnsName, isLoading: addressFromEnsNameLoading } =
    useEnsAddress({
      name: value,
      enabled: isEnsDomain,
      chainId: 1,
    });

  // Resolve address to ENS name if input is a valid address
  const { data: ensNameFromAddress, isLoading: ensNameFromAddressLoading } =
    useEnsName({
      address: value,
      enabled: isAddress(value),
      chainId: 1,
    });

  // Fetch ENS avatar if input is ENS domain or if address resolved to an ENS name
  const { data: ensAvatar, isLoading: ensAvatarLoading } = useEnsAvatar({
    addressOrName: isEnsDomain ? value : (ensNameFromAddress as string),
    enabled: isEnsDomain || !!ensNameFromAddress,
    chainId: 1,
  });

  const renderItem = () => {
    if (isAddress(value)) {
      if (ensNameFromAddressLoading || ensAvatarLoading) return <Skeleton />;

      if (ensNameFromAddress) {
        return (
          <Pressable
            onPress={() =>
              navigation.navigate("SendAsset", {
                address: value,
                ensName: ensNameFromAddress,
              })
            }
          >
            <Box flexDirection="row" alignItems="center" mt="3">
              <Avatar source={ensAvatar ? { uri: ensAvatar } : undefined}>
                {ensNameFromAddress[0]}
              </Avatar>
              <Box ml="2">
                <Text variant="subtitle1">{ensNameFromAddress}</Text>
                <Text>{formatAddress(value)}</Text>
              </Box>
            </Box>
          </Pressable>
        );
      }

      return (
        <Pressable
          onPress={() => navigation.navigate("SendAsset", { address: value })}
        >
          <Box flexDirection="row" alignItems="center" mt="3">
            <Avatar>0x</Avatar>
            <Text ml="2" variant="subtitle1">
              {formatAddress(value)}
            </Text>
          </Box>
        </Pressable>
      );
    }

    if (isEnsDomain) {
      if (addressFromEnsNameLoading || ensAvatarLoading) return <Skeleton />;

      if (addressFromEnsName && isAddress(addressFromEnsName))
        return (
          <Pressable
            onPress={() =>
              navigation.navigate("SendAsset", {
                address: addressFromEnsName,
                ensName: value,
              })
            }
          >
            <Box flexDirection="row" alignItems="center" mt="3">
              <Avatar source={ensAvatar ? { uri: ensAvatar } : undefined}>
                {value[0]}
              </Avatar>
              <Box ml="2">
                <Text variant="subtitle1">{value}</Text>
                <Text>{formatAddress(addressFromEnsName)}</Text>
              </Box>
            </Box>
          </Pressable>
        );
    }

    if (value) return <Text mt="3">Invalid address</Text>;
  };

  return (
    <Box>
      <Box p="4">
        <Text variant="subtitle1" mb="3">
          Send
        </Text>
        <Input
          value={value}
          onChangeText={setValue}
          placeholder="Address or ENS"
          variant="filled"
          borderRadius="10"
          p="2"
          borderWidth="0"
          fontSize="md"
          InputLeftElement={
            <Icon as={Ionicons} name="search-outline" ml="3" size="5" />
          }
          autoCorrect={false}
          autoCapitalize="none"
          mb="1"
        />
        {renderItem()}
      </Box>
    </Box>
  );
};

export default SendAddressScreen;
