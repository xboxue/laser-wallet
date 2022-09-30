import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import ActivityScreen from "../screens/ActivityScreen";
import HomeScreen from "../screens/HomeScreen";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Icon } from "native-base";
import theme from "../styles/theme";

const Tab = createBottomTabNavigator();

const TabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          elevation: 0,
          borderTopColor: theme.colors.gray[200],
          paddingBottom: 8,
          paddingTop: 8,
          height: 60,
        },
        tabBarActiveTintColor: theme.colors.gray[800],
        tabBarInactiveTintColor: theme.colors.gray[400],
      }}
    >
      <Tab.Screen
        name="Assets"
        component={HomeScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Icon as={<Ionicons name="wallet" />} size={size} color={color} />
          ),
        }}
      />

      <Tab.Screen
        name="Activity"
        component={ActivityScreen}
        options={{
          headerShown: true,
          tabBarIcon: ({ color, size }) => (
            <Icon as={<Ionicons name="flash" />} size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

export default TabNavigator;