import { useNavigation } from "@react-navigation/native";
import { useMutation } from "@tanstack/react-query";
import { isValidMnemonic } from "ethers/lib/utils";
import { useFormik } from "formik";
import { Box, Button, FormControl, Input, Text } from "native-base";
import { useDispatch } from "react-redux";
import * as yup from "yup";
import { setIsAuthenticated } from "../features/auth/authSlice";
import { setWalletAddress, setWallets } from "../features/wallet/walletSlice";
import { getBackup } from "../services/cloudBackup";
import * as SecureStore from "expo-secure-store";
import { createWallets } from "../utils/wallet";

const RecoverySeedPhrasePasswordScreen = ({ route }) => {
  const { backupName } = route.params;
  const navigation = useNavigation();
  const dispatch = useDispatch();

  const { mutate: restoreBackup, isLoading: isRestoringBackup } = useMutation(
    async (password: string) => {
      const backup = await getBackup(password, backupName);
      const { seedPhrase } = JSON.parse(backup);
      if (!isValidMnemonic(seedPhrase))
        throw new Error("Invalid recovery phrase");
      await SecureStore.setItemAsync("backupPassword", password);
      return createWallets(seedPhrase);
    },
    {
      onSuccess: (wallets) => {
        dispatch(setWallets(wallets));
        dispatch(setIsAuthenticated(true));
        dispatch(setWalletAddress(wallets[0].address));
        navigation.navigate("RecoveryImportVault");
      },
    }
  );
  const formik = useFormik({
    initialValues: { password: "" },
    onSubmit: (values) => {
      restoreBackup(values.password);
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
      <Button
        mt="4"
        onPress={formik.handleSubmit}
        isLoading={isRestoringBackup}
      >
        Next
      </Button>
    </Box>
  );
};

export default RecoverySeedPhrasePasswordScreen;
