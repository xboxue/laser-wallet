import { useNavigation } from "@react-navigation/native";
import { ethers } from "ethers";
import { Box, Button, Text } from "native-base";
import { GoogleSignin } from "@react-native-google-signin/google-signin";
import * as SecureStore from "expo-secure-store";
import axios from "axios";
import { useDispatch } from "react-redux";
import { setOwnerAddress } from "../features/auth/authSlice";
import { useState } from "react";

const GOOGLE_DRIVE_API_KEY = "AIzaSyCitBIU7-UU1QM6yslKIeVq2zgexDUL188";

const SignUpBackUpScreen = () => {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);

  const createWallet = async () => {
    const owner = ethers.Wallet.createRandom();
    await SecureStore.setItemAsync("ownerAddress", owner.address);
    await SecureStore.setItemAsync("ownerPrivateKey", owner.privateKey);
    dispatch(setOwnerAddress(owner.address));
  };

  const createFolder = async (accessToken: string) => {
    const recoveryWallet = ethers.Wallet.createRandom();
    try {
      const { data: folder } = await axios.post(
        `https://www.googleapis.com/drive/v3/files?key=${GOOGLE_DRIVE_API_KEY}`,
        { name: "Laser", mimeType: "application/vnd.google-apps.folder" },
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );

      // TODO: Fix this
      const { data } = await axios.post(
        `https://www.googleapis.com/drive/v3/files?key=${GOOGLE_DRIVE_API_KEY}`,
        { parents: [folder.id], name: `${recoveryWallet.privateKey}` },
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
      await SecureStore.setItemAsync(
        "recoveryWalletAddress",
        recoveryWallet.address
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
