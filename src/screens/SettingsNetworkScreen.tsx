import { keyBy } from "lodash";
import { Box, Button, Pressable, Text } from "native-base";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { defaultChains } from "wagmi";
import {
  addWallet,
  selectOwnerAddress,
  selectRecoveryOwnerAddress,
  selectWallets,
  setWalletAddress,
} from "../features/wallet/walletSlice";
import { selectGuardians } from "../features/guardians/guardiansSlice";
import { selectChainId, setChainId } from "../features/network/networkSlice";
import { createWallet } from "../services/wallet";

const CreateWalletButton = ({
  chainId,
  ownerAddress,
  recoveryOwnerAddress,
  guardians,
}) => {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  return (
    <Button
      isLoading={loading}
      size="sm"
      ml="auto"
      onPress={async () => {
        setLoading(true);
        try {
          const walletAddress = await createWallet({
            chainId,
            ownerAddress,
            recoveryOwnerAddress,
            guardians,
          });
          dispatch(addWallet({ chainId, address: walletAddress }));
        } finally {
          setLoading(false);
        }
      }}
    >
      Deploy
    </Button>
  );
};

const SettingsNetworkScreen = () => {
  const wallets = useSelector(selectWallets);
  const ownerAddress = useSelector(selectOwnerAddress);
  const recoveryOwnerAddress = useSelector(selectRecoveryOwnerAddress);
  const guardians = useSelector(selectGuardians);
  const currentChainId = useSelector(selectChainId);
  const dispatch = useDispatch();

  const walletsByChain = keyBy(wallets, "chainId");
  return (
    <Box px="4">
      {defaultChains.map(({ name, id }) => (
        <Pressable
          disabled={!walletsByChain[id]}
          onPress={async () => {
            dispatch(setWalletAddress(walletsByChain[id].address));
            dispatch(setChainId(id));
          }}
          key={id}
        >
          {({ isPressed }) => (
            <Box
              py="2"
              flexDir="row"
              alignItems="center"
              opacity={isPressed ? "0.2" : "1"}
            >
              <Text variant="subtitle1">
                {name}
                {currentChainId === id && " (current)"}
              </Text>

              {!walletsByChain[id] && (
                <CreateWalletButton
                  chainId={id}
                  ownerAddress={ownerAddress}
                  recoveryOwnerAddress={recoveryOwnerAddress}
                  guardians={guardians.map((guardian) => guardian.address)}
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
