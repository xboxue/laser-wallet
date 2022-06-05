import { useNavigation } from "@react-navigation/native";
import { Avatar, Box, Button, Text } from "native-base";
import { useSelector } from "react-redux";
import { selectGuardians } from "../features/guardians/guardiansSlice";
import formatAddress from "../utils/formatAddress";

const SignUpGuardiansScreen = () => {
  const navigation = useNavigation();
  const guardians = useSelector(selectGuardians);

  return (
    <Box>
      <Box p="4">
        <Text variant="subtitle1">Choose your guardians</Text>
        <Text mb="4">
          Guardians ensure you can recover your wallet in case your device is
          lost.
        </Text>
        {guardians.map((guardian) => (
          <Box
            flexDirection="row"
            alignItems="center"
            mb="2"
            key={guardian.address}
          >
            <Avatar>{guardian.name[0]}</Avatar>
            <Box ml="3">
              <Text variant="subtitle1">{guardian.name}</Text>
              <Text ml="auto">{formatAddress(guardian.address)}</Text>
            </Box>
          </Box>
        ))}
        <Button mt="4" onPress={() => navigation.navigate("SignUpAddGuardian")}>
          Add guardian
        </Button>
        <Button mt="4" onPress={() => navigation.navigate("SignUpBackUp")}>
          Next
        </Button>
      </Box>
    </Box>
  );
};

export default SignUpGuardiansScreen;
