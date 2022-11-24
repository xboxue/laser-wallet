import Ionicons from "@expo/vector-icons/Ionicons";
import { Box, Circle, Icon, Image, Pressable, Text } from "native-base";
import formatAddress from "../../utils/formatAddress";

interface Props {
  address: string;
  ensName?: string;
  ensAvatar?: string;
  onPress?: (address: string, ensName?: string) => void;
}

const AddressOrEnsPreviewItem = ({
  address,
  ensName,
  ensAvatar,
  onPress,
}: Props) => {
  return (
    <Pressable onPress={() => onPress?.(address, ensName)}>
      <Box flexDirection="row" alignItems="center" mt="3">
        {ensAvatar ? (
          <Image
            source={{ uri: ensAvatar }}
            alt="avatar"
            size="9"
            borderRadius="full"
          />
        ) : (
          <Circle bgColor="gray.700" size="9">
            <Icon as={<Ionicons name="person" />} size="4" color="gray.200" />
          </Circle>
        )}
        <Box ml="4">
          {ensName ? (
            <>
              <Text variant="subtitle1">{ensName}</Text>
              <Text variant="body2">{formatAddress(address)}</Text>
            </>
          ) : (
            <Text variant="subtitle1">{formatAddress(address)}</Text>
          )}
        </Box>
      </Box>
    </Pressable>
  );
};

export default AddressOrEnsPreviewItem;
