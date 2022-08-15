import { useNavigation } from "@react-navigation/native";
import { Box, Pressable, Switch, Text } from "native-base";
import { useDispatch, useSelector } from "react-redux";
import {
  selectIsBiometricsEnabled,
  setIsBiometricsEnabled,
} from "../features/auth/authSlice";

const SettingsSecurityScreen = () => {
  const navigation = useNavigation();
  const isBiometricsEnabled = useSelector(selectIsBiometricsEnabled);
  const dispatch = useDispatch();

  return (
    <Box px="4">
      <Box
        flexDir="row"
        alignItems="center"
        justifyContent="space-between"
        py="3"
      >
        <Text variant="subtitle1">Enable fingerprint</Text>
        <Switch
          size="lg"
          isChecked={isBiometricsEnabled}
          onToggle={() =>
            dispatch(setIsBiometricsEnabled(!isBiometricsEnabled))
          }
        />
      </Box>
      <Pressable
        onPress={() => {
          navigation.navigate("SettingsPasscode");
        }}
      >
        <Box
          flexDir="row"
          alignItems="center"
          justifyContent="space-between"
          py="3"
        >
          <Text variant="subtitle1">Change passcode</Text>
        </Box>
      </Pressable>
    </Box>
  );
};

export default SettingsSecurityScreen;
