import { useNavigation } from "@react-navigation/native";
import { keyBy } from "lodash";
import { Box, Icon, Pressable, Text } from "native-base";
import { useDispatch, useSelector } from "react-redux";
import { defaultChains } from "wagmi";
import { selectChainId, setChainId } from "../features/network/networkSlice";
import {
  selectWallets,
  setWalletAddress,
} from "../features/wallet/walletSlice";
import Ionicons from "@expo/vector-icons/Ionicons";

const SettingsNetworkScreen = () => {
  const navigation = useNavigation();
  const wallets = useSelector(selectWallets);
  const chainId = useSelector(selectChainId);
  const dispatch = useDispatch();
  const walletsByChain = keyBy(wallets, "chainId");

  return (
    <Box px="4">
      {defaultChains.map(({ name, id }) => (
        <Pressable
          onPress={async () => {
            if (walletsByChain[id]) {
              dispatch(setWalletAddress(walletsByChain[id].address));
              dispatch(setChainId(id));
            } else {
              navigation.navigate("SignUpDeployWallet", { chainId: id });
            }
          }}
          key={id}
        >
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
