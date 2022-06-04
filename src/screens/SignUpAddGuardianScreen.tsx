import { useNavigation } from "@react-navigation/native";
import { Box, Button, Input, Text } from "native-base";
import { useState } from "react";
import { useDispatch } from "react-redux";
import { addGuardian } from "../features/guardians/guardiansSlice";

const SignUpAddGuardianScreen = () => {
  const navigation = useNavigation();
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const dispatch = useDispatch();

  return (
    <Box>
      <Box p="4">
        <Text variant="subtitle1">Add guardian</Text>
        <Input placeholder="Name" value={name} onChangeText={setName} />
        <Input
          placeholder="Address or ENS"
          value={address}
          onChangeText={setAddress}
        />
        <Button
          mt="4"
          onPress={async () => {
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
