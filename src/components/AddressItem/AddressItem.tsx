import Ionicons from "@expo/vector-icons/Ionicons";
import { Box, Icon, Text } from "native-base";
import { Pressable } from "react-native";
import CopyIconButton from "../CopyIconButton/CopyIconButton";

interface Props {
  selected: boolean;
  onPress: () => void;
  title: string;
  address: string;
}

const AddressItem = ({ selected, onPress, title, address }: Props) => {
  return (
    <Pressable onPress={onPress}>
      {({ pressed }) => (
        <Box
          flexDir="row"
          alignItems="center"
          bgColor={pressed ? "gray.100" : "white"}
          rounded="lg"
          px="4"
          py="3"
        >
          <Text mr="3" fontSize="md">
            {title}
          </Text>
          {selected && (
            <Icon
              as={<Ionicons name="ios-checkmark-circle" />}
              size="6"
              color="green.500"
            />
          )}
          <CopyIconButton value={address} ml="auto" />
        </Box>
      )}
    </Pressable>
  );
};

export default AddressItem;
