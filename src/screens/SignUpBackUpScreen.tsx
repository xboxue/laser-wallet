import { GoogleSignin } from "@react-native-google-signin/google-signin";
import axios from "axios";
import Wallet from "ethereumjs-wallet";
import Constants from "expo-constants";
import { Box, Button, Text } from "native-base";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  setOwnerAddress,
  setOwnerPrivateKey,
  setRecoveryOwnerAddress,
  setWalletAddress,
} from "../features/auth/authSlice";
import { selectGuardians } from "../features/guardians/guardiansSlice";

const SignUpBackUpScreen = () => {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const guardians = useSelector(selectGuardians);

  const createWallet = async () => {
    const owner = Wallet.generate();
    const recoveryOwner = Wallet.generate();

    const { data } = await axios.post(
      `${Constants.manifest?.extra?.relayerUrl}/wallets`,
      {
        owner: owner.getAddressString(),
        recoveryOwner: recoveryOwner.getAddressString(),
        guardians: guardians.map((guardian) => guardian.address),
      }
    );

    if (!data.walletAddress) throw new Error("Wallet creation failed");

    dispatch(setOwnerAddress(owner.getAddressString()));
    dispatch(setOwnerPrivateKey(owner.getPrivateKeyString()));
    dispatch(setRecoveryOwnerAddress(recoveryOwner.getAddressString()));
    dispatch(setWalletAddress(data.walletAddress));

    return { owner, recoveryOwner, walletAddress: data.walletAddress };
  };

  const createBackup = async (accessToken: string, privateKey: string) => {
    const { data: folder } = await axios.post(
      `https://www.googleapis.com/drive/v3/files?key=${Constants.manifest?.extra?.googleDriveApiKey}`,
      { name: "Laser", mimeType: "application/vnd.google-apps.folder" },
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );

    // TODO: Fix this
    const { data } = await axios.post(
      `https://www.googleapis.com/drive/v3/files?key=${Constants.manifest?.extra?.googleDriveApiKey}`,
      {
        parents: [folder.id],
        name: `${privateKey}`,
      },
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );
  };

  return (
    <Box>
      <Box p="4">
        <Text variant="subtitle1">Back up your recovery wallet</Text>
        <Text>
          Store the encrypted key of your recovery wallet. This will be used to
          recover your funds in case your device is lost.
        </Text>

        <Button
          isLoading={loading}
          mt="4"
          onPress={async () => {
            try {
              GoogleSignin.configure({
                scopes: ["https://www.googleapis.com/auth/drive.file"],
              });

              await GoogleSignin.signIn();
              const { accessToken } = await GoogleSignin.getTokens();
              setLoading(true);
              const { recoveryOwner } = await createWallet();
              await createBackup(
                accessToken,
                recoveryOwner.getPrivateKeyString()
              );
            } catch (error) {
              console.log(error);
            }
            setLoading(false);
          }}
        >
          Back up on Google Drive
        </Button>
      </Box>
    </Box>
  );
};

export default SignUpBackUpScreen;
