import { useNavigation } from "@react-navigation/native";
import { useMutation } from "@tanstack/react-query";
import { isValidMnemonic } from "ethers/lib/utils";
import { useFormik } from "formik";
import { Box, Button, FormControl, Text, TextArea } from "native-base";
import { useDispatch } from "react-redux";
import { setIsAuthenticated } from "../features/auth/authSlice";
import { setWalletAddress, setWallets } from "../features/wallet/walletSlice";
import { createWallets } from "../utils/wallet";

const RecoveryEnterSeedPhraseScreen = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();

  const { mutate, isLoading } = useMutation(
    async (seedPhrase: string) => {
      await new Promise((resolve) => setTimeout(resolve, 10));
      return createWallets(seedPhrase);
    },
    {
      onSuccess: (wallets) => {
        dispatch(setIsAuthenticated(true));
        dispatch(setWalletAddress(wallets[0].address));
        dispatch(setWallets(wallets));
        navigation.navigate("RecoveryBackup", { wallets });
      },
    }
  );

  const formik = useFormik({
    initialValues: { seedPhrase: "" },
    onSubmit: async ({ seedPhrase }) => {
      mutate(seedPhrase);
    },
    validate: ({ seedPhrase }) => {
      const errors = {};
      if (!seedPhrase) errors.seedPhrase = "Required";
      if (!isValidMnemonic(seedPhrase))
        errors.seedPhrase = "Invalid recovery phrase";
      return errors;
    },
    validateOnChange: false,
  });

  return (
    <Box p="4">
      <Text variant="subtitle1">Enter your recovery phrase</Text>
      <Text mb={6}>
        This is the 12 word phrase you were given when you created your wallet.
      </Text>

      <FormControl
        isInvalid={formik.touched.seedPhrase && !!formik.errors.seedPhrase}
      >
        <TextArea
          placeholder="Recovery phrase"
          value={formik.values.seedPhrase}
          onChangeText={formik.handleChange("seedPhrase")}
          onBlur={formik.handleBlur("seedPhrase")}
          autoFocus
          size="md"
          autoCapitalize="none"
        />
        <FormControl.ErrorMessage>
          {formik.errors.seedPhrase}
        </FormControl.ErrorMessage>
      </FormControl>
      <Button mt="6" onPress={formik.handleSubmit} isLoading={isLoading}>
        Next
      </Button>
    </Box>
  );
};

export default RecoveryEnterSeedPhraseScreen;
