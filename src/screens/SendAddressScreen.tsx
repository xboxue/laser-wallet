import Ionicons from "@expo/vector-icons/Ionicons";
import { useNavigation } from "@react-navigation/native";
import { isAddress } from "ethers/lib/utils";
import { Box, Icon, Input, Text } from "native-base";
import { useState } from "react";
import AddressPreviewContainer from "../components/AddressOrEnsPreview/AddressPreviewContainer/AddressPreviewContainer";
import EnsPreviewContainer from "../components/AddressOrEnsPreview/EnsPreviewContainer/EnsPreviewContainer";

const SendAddressScreen = () => {
  const navigation = useNavigation();
  const [value, setValue] = useState("");
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
      </Box>
    </Box>
  );
};

export default SendAddressScreen;
