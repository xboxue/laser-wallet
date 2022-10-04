import { useNavigation } from "@react-navigation/native";
import { isValidMnemonic } from "ethers/lib/utils";
import { useFormik } from "formik";
import { Box, Button, FormControl, Text, TextArea } from "native-base";

const RecoveryEnterSeedPhraseScreen = () => {
  const navigation = useNavigation();

  const formik = useFormik({
    initialValues: { seedPhrase: "" },
    onSubmit: async ({ seedPhrase }) =>
      navigation.navigate("SignUpBackup", { importedSeedPhrase: seedPhrase }),
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
      <Button mt="6" onPress={formik.handleSubmit}>
        Next
      </Button>
    </Box>
  );
};

export default RecoveryEnterSeedPhraseScreen;
