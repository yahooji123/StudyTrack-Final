import React from "react";
import { NavigationContainer, DarkTheme as NavDark, DefaultTheme as NavLight } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import { AppProvider, useApp } from "./context/AppContext";
import { light, dark } from "./theme";
import { Loading } from "./components/UI";
import LoginScreen from "./screens/LoginScreen";
import RegisterScreen from "./screens/RegisterScreen";
import HomeScreen from "./screens/HomeScreen";
import TimerScreen from "./screens/TimerScreen";
import ManualScreen from "./screens/ManualScreen";
import SubjectsScreen from "./screens/SubjectsScreen";
import HistoryScreen from "./screens/HistoryScreen";
import AnalyticsScreen from "./screens/AnalyticsScreen";
import ProfileScreen from "./screens/ProfileScreen";

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function MainTabs() {
  const { dark: isDark } = useApp();
  const theme = isDark ? dark : light;

  const icons = {
    Home: "home-outline",
    History: "time-outline",
    Analytics: "bar-chart-outline",
    Subjects: "book-outline",
    Profile: "person-outline"
  };

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: theme.primary,
        tabBarInactiveTintColor: theme.muted,
        tabBarStyle: {
          backgroundColor: theme.card,
          borderTopColor: theme.border,
          height: 66,
          paddingBottom: 8,
          paddingTop: 6
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "700"
        },
        tabBarIcon: ({ color, size }) => (
          <Ionicons name={icons[route.name]} size={size} color={color} />
        )
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="History" component={HistoryScreen} />
      <Tab.Screen name="Analytics" component={AnalyticsScreen} />
      <Tab.Screen name="Subjects" component={SubjectsScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

function Root() {
  const { user, loading, dark: isDark } = useApp();

  if (loading) {
    return <Loading theme={isDark ? dark : light} />;
  }

  const navTheme = isDark ? {
    ...NavDark,
    colors: { ...NavDark.colors, background: dark.bg, card: dark.card, text: dark.text, border: dark.border, primary: dark.primary }
  } : {
    ...NavLight,
    colors: { ...NavLight.colors, background: light.bg, card: light.card, text: light.text, border: light.border, primary: light.primary }
  };

  return (
    <NavigationContainer theme={navTheme}>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {user ? (
          <>
            <Stack.Screen name="Main" component={MainTabs} />
            <Stack.Screen name="Timer" component={TimerScreen} />
            <Stack.Screen name="Manual" component={ManualScreen} />
          </>
        ) : (
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <AppProvider>
      <Root />
    </AppProvider>
  );
}
