import { useAuth, useSession } from "@clerk/clerk-expo";
import { useNavigation } from "@react-navigation/native";
import { Box, Button, Text } from "native-base";
import { useDispatch, useSelector } from "react-redux";
import {
  selectIsLaserGuardianEnabled,
  setIsLaserGuardianEnabled,
} from "../features/guardians/guardiansSlice";

const SignUpLaserGuardianDetailsScreen = () => {
  const navigation = useNavigation();
  const isLaserGuardianEnabled = useSelector(selectIsLaserGuardianEnabled);
  const dispatch = useDispatch();
  const { isSignedIn } = useAuth();

  return (
    <Box p="4">
      <Text variant="subtitle1">Laser Guardian</Text>
      <Text>
        You'll be able to easily recover your wallet using your account.
      </Text>
      <Button
        mt="4"
        variant={isLaserGuardianEnabled ? "outline" : "solid"}
        onPress={() => {
          if (!isSignedIn) return navigation.navigate("SignUpEmail");
          dispatch(setIsLaserGuardianEnabled(!isLaserGuardianEnabled));
          navigation.goBack();
        }}
      >
        {isLaserGuardianEnabled ? "Disable" : "Enable"}
      </Button>
    </Box>
  );
};

export default SignUpLaserGuardianDetailsScreen;
