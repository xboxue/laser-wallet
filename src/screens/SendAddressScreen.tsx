import Ionicons from "@expo/vector-icons/Ionicons";
import { useNavigation } from "@react-navigation/native";
import { isAddress } from "ethers/lib/utils";
import { Box, Circle, Icon, Input, Pressable, Text } from "native-base";
import { useState } from "react";
import { useSelector } from "react-redux";
import AddressPreviewContainer from "../components/AddressPreviewContainer/AddressPreviewContainer";
import EnsPreviewContainer from "../components/EnsPreviewContainer/EnsPreviewContainer";
import {
  selectVaultAddress,
  selectWalletAddress,
  selectWallets,
} from "../features/wallet/walletSlice";

const Item = ({ onPress, icon, title, ...props }) => (
  <Pressable onPress={onPress}>
    {({ isPressed }) => (
      <Box
        flexDirection="row"
        alignItems="center"
        py="2"
        opacity={isPressed ? 0.3 : 1}
        {...props}
      >
        {icon}
        <Box ml="3">
          <Text variant="subtitle1">{title}</Text>
        </Box>
      </Box>
    )}
  </Pressable>
);

const SendAddressScreen = () => {
  const navigation = useNavigation();
  const [value, setValue] = useState("");
  const vaultAddress = useSelector(selectVaultAddress);
  const walletAddress = useSelector(selectWalletAddress);
  const wallets = useSelector(selectWallets);
  const isEnsDomain = value.includes(".");

  const handlePress = (address: string, ensName?: string) => {
    navigation.navigate("SendAsset", {
      address,
      ensName,
    });
  };

  const renderPreviewItem = () => {
    if (isAddress(value))
      return <AddressPreviewContainer address={value} onPress={handlePress} />;

    if (isEnsDomain)
      return (
        <EnsPreviewContainer
          ensName={value}
          onPress={handlePress}
          errorComponent={<Text mt="3">Invalid address</Text>}
        />
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
        {renderPreviewItem()}
        {vaultAddress === walletAddress ? (
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
        ) : (
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
        )}
      </Box>
    </Box>
  );
};

export default SendAddressScreen;
