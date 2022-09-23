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
        Laser provides a service for you to easily start your wallet recovery
        with your email.
      </Text>
      <Button
        mt="4"
        variant={isLaserGuardianEnabled ? "subtle" : "solid"}
        onPress={() => {
          if (!isSignedIn) return navigation.navigate("SignUpEmail");
          dispatch(setIsLaserGuardianEnabled(!isLaserGuardianEnabled));
          navigation.goBack();
        }}
        isDisabled
      >
        {isLaserGuardianEnabled ? "Disable" : "Enable"}
      </Button>
    </Box>
  );
};

export default SignUpLaserGuardianDetailsScreen;
