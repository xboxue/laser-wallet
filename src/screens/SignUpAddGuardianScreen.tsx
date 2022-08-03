import { useNavigation } from "@react-navigation/native";
import { isAddress } from "ethers/lib/utils";
import { useFormik } from "formik";
import { Box, Button, FormControl, Input, Text } from "native-base";
import { useDispatch } from "react-redux";
import { v4 as uuidv4 } from "uuid";
import AddressPreviewContainer from "../components/AddressPreviewContainer/AddressPreviewContainer";
import EnsPreviewContainer from "../components/EnsPreviewContainer/EnsPreviewContainer";
import { addGuardian } from "../features/guardians/guardiansSlice";
import useEnsAddressAndAvatar from "../hooks/useEnsAddressAndAvatar";
import useEnsNameAndAvatar from "../hooks/useEnsNameAndAvatar";
import isEnsDomain from "../utils/isEnsDomain";

const SignUpAddGuardianScreen = () => {
  const navigation = useNavigation();

  const formik = useFormik({
    initialValues: { address: "", name: "" },
    onSubmit: ({ address, name }) => {
      dispatch(
        addGuardian({
          id: uuidv4(),
          name,
          address: isAddress(address) ? address : (ensAddress as string),
          ensName: ensAddress ? address : (ensName as string),
        })
      );
      navigation.goBack();
    },
    validate: ({ address, name }) => {
      const errors = {};
      if (!isAddress(address) && !(ensAddress && isAddress(ensAddress)))
        errors.address = "Invalid address";
      if (!name) errors.name = "Required";

      return errors;
    },
  });

  const { address: ensAddress } = useEnsAddressAndAvatar(formik.values.address);
  const { ensName } = useEnsNameAndAvatar(formik.values.address);

  const dispatch = useDispatch();

  const renderPreviewItem = () => {
    if (isAddress(formik.values.address))
      return <AddressPreviewContainer address={formik.values.address} />;

    if (isEnsDomain(formik.values.address))
      return <EnsPreviewContainer ensName={formik.values.address} />;
  };

  return (
    <Box p="4">
      <Text variant="subtitle1" mb="4">
        Add guardian
      </Text>
      <FormControl isInvalid={formik.touched.name && !!formik.errors.name}>
        <Input
          placeholder="Name"
          value={formik.values.name}
          onChangeText={formik.handleChange("name")}
          onBlur={formik.handleBlur("name")}
          autoFocus
          size="lg"
        />
        <FormControl.ErrorMessage>
          {formik.errors.name}
        </FormControl.ErrorMessage>
      </FormControl>
      <FormControl
        isInvalid={formik.touched.address && !!formik.errors.address}
      >
        <Input
          mt="3"
          placeholder="Address or ENS"
          value={formik.values.address}
          onChangeText={formik.handleChange("address")}
          onBlur={formik.handleBlur("address")}
          size="lg"
          autoCorrect={false}
          autoCapitalize="none"
        />
        <FormControl.ErrorMessage>
          {formik.errors.address}
        </FormControl.ErrorMessage>
      </FormControl>
      {renderPreviewItem()}
      <Button mt="4" onPress={formik.handleSubmit}>
        Add
      </Button>
    </Box>
  );
};

export default SignUpAddGuardianScreen;
