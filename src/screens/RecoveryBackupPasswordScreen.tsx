import { useNavigation } from "@react-navigation/native";
import { useMutation } from "@tanstack/react-query";
import Wallet from "ethereumjs-wallet";
import { BigNumber, ethers } from "ethers";
import * as SecureStore from "expo-secure-store";
import { useFormik } from "formik";
import { Laser } from "laser-sdk";
import { Box, Button, FormControl, Input, Text } from "native-base";
import { useDispatch } from "react-redux";
import { useProvider } from "wagmi";
import * as yup from "yup";
import { setRecoverTx } from "../features/wallet/walletSlice";
import { getBackup } from "../services/cloudBackup";

const RecoveryBackupPasswordScreen = ({ route }) => {
  const { backupName, chainId, address } = route.params;
  const provider = useProvider({ chainId });
  const navigation = useNavigation();
  const dispatch = useDispatch();

  const { mutate, isLoading: backupLoading } = useMutation(
    async (password: string) => {
      const backup = await getBackup(password, backupName);

      const owner = Wallet.generate();
      await SecureStore.setItemAsync(
        "ownerPrivateKey",
        owner.getPrivateKeyString()
      );

      const recoveryOwner = new ethers.Wallet(JSON.parse(backup).privateKey);
      const laser = new Laser(provider, recoveryOwner, address);
      const nonce = await laser.wallet.nonce();
      const recoverTx = await laser.recover(
        owner.getAddressString(),
        nonce.add(BigNumber.from(1))
      );
      dispatch(setRecoverTx(recoverTx));
      return laser.lockWallet(nonce);
    },
    {
      onSuccess: (transaction) => {
        navigation.navigate("RecoveryLockVault", { transaction });
      },
    }
  );
  const formik = useFormik({
    initialValues: { password: "" },
    onSubmit: (values) => {
      mutate(values.password);
    },
    validationSchema: yup.object().shape({
      password: yup.string().required("Required"),
    }),
    validateOnChange: false,
  });

  return (
    <Box p="4">
      <Text variant="subtitle1">Enter your backup password</Text>
      <Text mb="4">Please enter the password to your backup.</Text>

      <FormControl
        isInvalid={formik.touched.password && !!formik.errors.password}
      >
        <Input
          type="password"
          placeholder="Password"
          value={formik.values.password}
          onChangeText={formik.handleChange("password")}
          onBlur={formik.handleBlur("password")}
          autoFocus
          size="lg"
        />
        <FormControl.ErrorMessage>
          {formik.errors.password}
        </FormControl.ErrorMessage>
      </FormControl>
      <Button mt="4" onPress={formik.handleSubmit} isLoading={backupLoading}>
        Next
      </Button>
    </Box>
  );
};

export default RecoveryBackupPasswordScreen;
