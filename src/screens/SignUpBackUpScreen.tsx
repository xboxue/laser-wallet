import { GoogleSignin } from "@react-native-google-signin/google-signin";
import axios from "axios";
import Wallet from "ethereumjs-wallet";
import * as SecureStore from "expo-secure-store";
import { Box, Button, Text } from "native-base";
import { useState } from "react";
import { useDispatch } from "react-redux";
import { setOwnerAddress } from "../features/auth/authSlice";

const GOOGLE_DRIVE_API_KEY = "AIzaSyCitBIU7-UU1QM6yslKIeVq2zgexDUL188";

const SignUpBackUpScreen = () => {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);

  const createWallet = async () => {
    const owner = Wallet.generate();
    await SecureStore.setItemAsync("ownerAddress", owner.getAddressString());
    await SecureStore.setItemAsync(
      "ownerPrivateKey",
      owner.getPrivateKeyString()
    );
    dispatch(setOwnerAddress(owner.getAddressString()));
  };

  const createFolder = async (accessToken: string) => {
    const recoveryWallet = Wallet.generate();
    try {
      const { data: folder } = await axios.post(
        `https://www.googleapis.com/drive/v3/files?key=${GOOGLE_DRIVE_API_KEY}`,
        { name: "Laser", mimeType: "application/vnd.google-apps.folder" },
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );

      // TODO: Fix this
      const { data } = await axios.post(
        `https://www.googleapis.com/drive/v3/files?key=${GOOGLE_DRIVE_API_KEY}`,
        {
          parents: [folder.id],
          name: `${recoveryWallet.getPrivateKeyString()}`,
        },
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
      await SecureStore.setItemAsync(
        "recoveryWalletAddress",
        recoveryWallet.getAddressString()
      );
    } catch (error) {
      console.log(JSON.stringify(error));
    }
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
              await createFolder(accessToken);
              await createWallet();
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