import { useNavigation } from "@react-navigation/native";
import {
  Avatar,
  Box,
  Button,
  Icon,
  Input,
  Pressable,
  Stack,
  Text,
} from "native-base";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useState } from "react";
import { isAddress } from "ethers/lib/utils";
import formatAddress from "../utils/formatAddress";

const SendAddressScreen = () => {
  const navigation = useNavigation();
  const [value, setValue] = useState("");

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
        />
        {isAddress(value) ? (
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
        ) : (
          value && <Text mt="3">Invalid address</Text>
        )}
      </Box>
    </Box>
  );
};

export default SendAddressScreen;
