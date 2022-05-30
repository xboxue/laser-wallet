import { useNavigation } from "@react-navigation/native";
import { Box, Button, Text } from "native-base";

const SignUpGuardiansScreen = () => {
  const navigation = useNavigation();

  return (
    <Box>
      <Box p="4">
        <Text variant="subtitle1">Choose your guardians</Text>
        <Text>
          Guardians ensure you can recover your wallet in case your device is
          lost.
        </Text>
        <Button mt="4">Add guardian</Button>
        <Button mt="4" onPress={() => navigation.navigate("SignUpBackUp")}>
          Next
        </Button>
      </Box>
    </Box>
  );
};

export default SignUpGuardiansScreen;
