import { useNavigation } from "@react-navigation/native";
import axios from "axios";
import Wallet from "ethereumjs-wallet";
import Constants from "expo-constants";
import { Box, Button, FormControl, Input, Text } from "native-base";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  setOwnerAddress,
  setOwnerPrivateKey,
  setRecoveryOwnerAddress,
  setWalletAddress,
} from "../features/auth/authSlice";
import { selectGuardians } from "../features/guardians/guardiansSlice";
import { createBackup, isValidPassword } from "../services/cloudBackup";

const SignUpBackupPasswordScreen = () => {
  const navigation = useNavigation();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const guardians = useSelector(selectGuardians);
  const dispatch = useDispatch();

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

    return { owner, recoveryOwner, walletAddress: data.walletAddress };
  };

  return (
    <Box>
      <Box p="4">
        <Text variant="subtitle1" mb="4">
          Create password
        </Text>
        <FormControl isInvalid={!isValidPassword(password)}>
          <Input
            type="password"
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            autoFocus
            size="lg"
          />
          <FormControl.ErrorMessage>
            {password && password.length < 8 && "Must be at least 8 characters"}
          </FormControl.ErrorMessage>
        </FormControl>
        <FormControl
          isInvalid={!!confirmPassword && password !== confirmPassword}
        >
          <Input
            isDisabled={!isValidPassword(password)}
            type="password"
            mt="3"
            placeholder="Confirm password"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            size="lg"
          />
          <FormControl.ErrorMessage>
            Passwords don't match
          </FormControl.ErrorMessage>
        </FormControl>
        <Button
          isLoading={loading}
          isDisabled={
            !isValidPassword(password) || password !== confirmPassword
          }
          mt="4"
          onPress={async () => {
            try {
              setLoading(true);
              const { owner, recoveryOwner, walletAddress } =
                await createWallet();

              await createBackup(
                recoveryOwner.getPrivateKeyString(),
                password,
                recoveryOwner.getAddressString()
              );

              dispatch(setOwnerAddress(owner.getAddressString()));
              dispatch(setOwnerPrivateKey(owner.getPrivateKeyString()));
              dispatch(
                setRecoveryOwnerAddress(recoveryOwner.getAddressString())
              );
              dispatch(setWalletAddress(walletAddress));
            } finally {
              setLoading(false);
            }
          }}
        >
          Create backup
        </Button>
      </Box>
    </Box>
  );
};

export default SignUpBackupPasswordScreen;
