import { Avatar, Box, Pressable, Text } from "native-base";
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
        <Avatar source={ensAvatar ? { uri: ensAvatar } : undefined}>
          {ensName ? ensName[0] : "0x"}
        </Avatar>
        <Box ml="2">
          {ensName ? (
            <>
              <Text variant="subtitle1">{ensName}</Text>
              <Text>{formatAddress(address)}</Text>
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
