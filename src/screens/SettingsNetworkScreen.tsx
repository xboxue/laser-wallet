import Ionicons from "@expo/vector-icons/Ionicons";
import { Box, Icon, Pressable, Text } from "native-base";
import { useDispatch, useSelector } from "react-redux";
import { defaultChains } from "wagmi";
import { selectChainId, setChainId } from "../features/network/networkSlice";

const SettingsNetworkScreen = () => {
  const chainId = useSelector(selectChainId);
  const dispatch = useDispatch();

  return (
    <Box px="4">
      {defaultChains.map(({ name, id }) => (
        <Pressable onPress={() => dispatch(setChainId(id))} key={id}>
          {({ isPressed }) => (
            <Box
              py="2"
              flexDir="row"
              alignItems="center"
              justifyContent="space-between"
              opacity={isPressed ? "0.2" : "1"}
            >
              <Text variant="subtitle1">{name}</Text>
              {chainId === id && (
                <Icon
                  as={<Ionicons name="ios-checkmark-circle" />}
                  size="6"
                  color="green.500"
                />
              )}
            </Box>
          )}
        </Pressable>
      ))}
    </Box>
  );
};

export default SettingsNetworkScreen;
