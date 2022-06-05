import { useNavigation } from "@react-navigation/native";
import { isAddress } from "ethers/lib/utils";
import { Box, Button, Input, Text } from "native-base";
import { useState } from "react";
import { useDispatch } from "react-redux";
import { addGuardian } from "../features/guardians/guardiansSlice";

const SignUpAddGuardianScreen = () => {
  const navigation = useNavigation();
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [error, setError] = useState("");
  const dispatch = useDispatch();

  return (
    <Box>
      <Box p="4">
        <Text variant="subtitle1">Add guardian</Text>
        <Input placeholder="Name" value={name} onChangeText={setName} />
        <Input
          mt="3"
          placeholder="Address or ENS"
          value={address}
          onChangeText={setAddress}
        />
        {error && <Text>{error}</Text>}
        <Button
          mt="4"
          onPress={async () => {
            if (!isAddress(address)) return setError("Invalid address");
            dispatch(addGuardian({ name, address }));
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
