import { useNavigation } from "@react-navigation/native";
import { useMutation } from "@tanstack/react-query";
import { ethers } from "ethers";
import { useFormik } from "formik";
import { Box, Button, FormControl, Input, Text } from "native-base";
import * as yup from "yup";
import { getBackup } from "../services/cloudBackup";

const RecoveryBackupPasswordScreen = ({ route }) => {
  const { backupName } = route.params;
  const navigation = useNavigation();

  const { mutate, isLoading: backupLoading } = useMutation(
    async (password: string) => {
      const backup = await getBackup(password, backupName);
      const { recoveryOwnerPrivateKey } = JSON.parse(backup);

      const recoveryOwner = new ethers.Wallet(recoveryOwnerPrivateKey);
      return recoveryOwner;
    },
    {
      onSuccess: (recoveryOwner) => {
        navigation.navigate("RecoverySignIn", { recoveryOwner });
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
