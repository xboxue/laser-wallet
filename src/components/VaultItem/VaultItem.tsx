import Ionicons from "@expo/vector-icons/Ionicons";
import { useNavigation } from "@react-navigation/native";
import { format, parseISO } from "date-fns";
import * as WebBrowser from "expo-web-browser";
import { Box, Circle, Icon, Pressable, Text } from "native-base";
import { defaultChains, useProvider } from "wagmi";
import { getAddressUrl } from "../../services/etherscan";
import formatAddress from "../../utils/formatAddress";

interface Props {
  address: string;
  chainId: number;
  createdAt: string;
  onPress: () => void;
}

const VaultItem = ({ address, chainId, createdAt, onPress }: Props) => {
  return (
    <Pressable onPress={onPress}>
      {({ isPressed }) => (
        <Box
          py={2}
          flexDir="row"
          alignItems="center"
          opacity={isPressed ? 0.3 : 1}
        >
          <Circle bg="gray.800" size="9">
            <Icon
              as={<Ionicons name="flash-outline" />}
              size="4"
              color="white"
            />
          </Circle>
          <Box ml="3">
            <Pressable
              onPress={() =>
                WebBrowser.openBrowserAsync(getAddressUrl(chainId, address))
              }
            >
              {({ isPressed }) => (
                <Box
                  flexDir="row"
                  alignItems="center"
                  opacity={isPressed ? 0.3 : 1}
                >
                  <Text variant="subtitle1" mr={2}>
                    {formatAddress(address)}
                  </Text>
                  <Icon as={<Ionicons name="open-outline" />} size="4" />
                </Box>
              )}
            </Pressable>
            <Text>
              {defaultChains.find((chain) => chain.id === chainId)?.name} ·{" "}
              {format(parseISO(createdAt), "LLL d")}
            </Text>
          </Box>
        </Box>
      )}
    </Pressable>
  );
};

export default VaultItem;
