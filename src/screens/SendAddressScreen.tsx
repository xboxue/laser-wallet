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
import { useEnsAddress, useEnsAvatar } from "wagmi";
import { selectChainId } from "../features/network/networkSlice";
import formatAddress from "../utils/formatAddress";

const SendAddressScreen = () => {
  const chainId = useSelector(selectChainId);
  const navigation = useNavigation();
  const [value, setValue] = useState("");

  const { data: ensAddress, isLoading: ensAddressLoading } = useEnsAddress({
    name: value,
    enabled: value.includes("."),
    chainId,
  });

  const { data: ensAvatar, isLoading: ensAvatarLoading } = useEnsAvatar({
    addressOrName: value,
    enabled: !!ensAddress,
    chainId,
  });

  const renderItem = () => {
    if (isAddress(value))
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

    if (ensAddressLoading || ensAvatarLoading) return <Skeleton />;

    if (ensAddress && isAddress(ensAddress))
      return (
        <Pressable
          onPress={() =>
            navigation.navigate("SendAsset", {
              address: ensAddress,
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
              <Text>{formatAddress(ensAddress)}</Text>
            </Box>
          </Box>
        </Pressable>
      );

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
