import { useNavigation } from "@react-navigation/native";
import Wallet from "ethereumjs-wallet";
import { Box, Button, FormControl, Input, Text } from "native-base";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { DEFAULT_CHAIN } from "../constants/chains";
import {
  addWallet,
  setOwnerAddress,
  setOwnerPrivateKey,
  setRecoveryOwnerAddress,
  setWalletAddress,
} from "../features/auth/authSlice";
import { selectGuardians } from "../features/guardians/guardiansSlice";
import { createBackup, isValidPassword } from "../services/cloudBackup";
import { createWallet } from "../services/wallet";

const SignUpBackupPasswordScreen = () => {
  const navigation = useNavigation();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const guardians = useSelector(selectGuardians);
  const dispatch = useDispatch();

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
              const owner = Wallet.generate();
              const recoveryOwner = Wallet.generate();

              const walletAddress = await createWallet({
                chainId: DEFAULT_CHAIN,
                guardians: guardians.map((guardian) => guardian.address),
                ownerAddress: owner.getAddressString(),
                recoveryOwnerAddress: recoveryOwner.getAddressString(),
              });

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
              dispatch(
                addWallet({ address: walletAddress, chainId: DEFAULT_CHAIN })
              );
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
