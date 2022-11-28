import { useNavigation } from "@react-navigation/native";
import { isAddress } from "ethers/lib/utils";
import { useFormik } from "formik";
import { Input } from "native-base";
import { useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useEnsAddress } from "wagmi";
import SignUpLayout from "../components/SignUpLayout/SignUpLayout";
import { selectChainId } from "../features/network/networkSlice";
import { setTrustedOwnerAddress } from "../features/wallet/walletSlice";

const SignUpAddOwnerScreen = () => {
  const navigation = useNavigation();
  const chainId = useSelector(selectChainId);
  const dispatch = useDispatch();
  const ref = useRef();

  const formik = useFormik({
    initialValues: { address: "" },
    onSubmit: async (values) => {
      dispatch(setTrustedOwnerAddress(ensAddress || values.address));
      navigation.navigate("SignUpBackup", {});
    },
    validate: async (values) => {
      const errors = {};

      if (!ensAddress && !isAddress(values.address)) {
        errors.address = "Invalid address or ENS";
      }

      return errors;
    },
  });

  const { data: ensAddress } = useEnsAddress({
    name: formik.values.address,
    chainId,
    enabled: formik.values.address.includes("."),
  });

  return (
    <SignUpLayout
      title="Add a trusted wallet"
      subtitle="A trusted wallet can help you recover your wallet if you lose your phone."
      onNext={formik.handleSubmit}
      isDisabled={!isAddress(formik.values.address) && !ensAddress}
      showSkip
      onSkip={() => navigation.navigate("SignUpBackup", {})}
      hasInput
    >
      <Input
        placeholder="ENS or Address"
        value={formik.values.address}
        onChangeText={formik.handleChange("address")}
        onBlur={formik.handleBlur("address")}
        autoCorrect={false}
        autoCapitalize="none"
        ref={ref}
        onLayout={() => ref.current?.focus()}
      />
    </SignUpLayout>
  );
};

export default SignUpAddOwnerScreen;
