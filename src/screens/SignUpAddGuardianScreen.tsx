import { useNavigation } from "@react-navigation/native";
import { isAddress } from "ethers/lib/utils";
import { Box, Button, Input, Text } from "native-base";
import { useState } from "react";
import { useDispatch } from "react-redux";
import AddressPreviewContainer from "../components/AddressPreviewContainer/AddressPreviewContainer";
import EnsPreviewContainer from "../components/EnsPreviewContainer/EnsPreviewContainer";
import { addGuardian } from "../features/guardians/guardiansSlice";
import useEnsAddressAndAvatar from "../hooks/useEnsAddressAndAvatar";
import useEnsNameAndAvatar from "../hooks/useEnsNameAndAvatar";
import isEnsDomain from "../utils/isEnsDomain";

const SignUpAddGuardianScreen = () => {
  const navigation = useNavigation();
  const [name, setName] = useState("");
  const [value, setValue] = useState("");

  const { address: ensAddress } = useEnsAddressAndAvatar(value);
  const { ensName } = useEnsNameAndAvatar(value);

  const dispatch = useDispatch();

  const renderPreviewItem = () => {
    if (isAddress(value)) return <AddressPreviewContainer address={value} />;

    if (isEnsDomain(value))
      return (
        <EnsPreviewContainer
          ensName={value}
          errorComponent={<Text mt="3">Invalid address</Text>}
        />
      );

    if (value) return <Text mt="3">Invalid address</Text>;
  };

  return (
    <Box>
      <Box p="4">
        <Text variant="subtitle1" mb="4">
          Add guardian
        </Text>
        <Input
          placeholder="Name"
          value={name}
          onChangeText={setName}
          autoFocus
          size="lg"
        />
        <Input
          mt="3"
          placeholder="Address or ENS"
          value={value}
          onChangeText={setValue}
          size="lg"
          autoCorrect={false}
          autoCapitalize="none"
        />
        {renderPreviewItem()}
        <Button
          mt="4"
          isDisabled={
            !isAddress(value) && !(ensAddress && isAddress(ensAddress))
          }
          onPress={async () => {
            if (!isAddress(value) && !(ensAddress && isAddress(ensAddress)))
              return;
            dispatch(
              addGuardian({
                name,
                address: isAddress(value) ? value : (ensAddress as string),
                ensName: ensAddress ? value : (ensName as string),
              })
            );
            navigation.goBack();
          }}
        >
          Add
        </Button>
      </Box>
    </Box>
  );
};

export default SignUpAddGuardianScreen;
