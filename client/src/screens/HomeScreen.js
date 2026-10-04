import React, { useCallback, useState } from "react";
import { Alert, Pressable, Text, View } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import API from "../api";
import { useApp } from "../context/AppContext";
import { light, dark } from "../theme";
import { Button, Card, Screen, SectionTitle } from "../components/UI";
import { formatMinutes } from "../utils/time";

export default function HomeScreen({ navigation }) {
  const { user, dark: isDark } = useApp();
  const theme = isDark ? dark : light;
  const [data, setData] = useState(null);

  const load = async () => {
    try {
      const response = await API.get("/sessions/dashboard");
      setData(response.data);
    } catch (error) {
      Alert.alert("Error", error.response?.data?.message || "Could not load dashboard");
    }
  };

  useFocusEffect(useCallback(() => {
    load();
  }, []));

  if (!data) {
    return <Screen theme={theme}><Text style={{ color: theme.muted }}>Loading dashboard...</Text></Screen>;
  }

  const goal = user?.dailyGoalMinutes || 360;
  const progress = Math.min(data.todayMinutes / goal, 1);

  return (
    <Screen theme={theme} scroll>
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <View>
          <Text style={{ color: theme.text, fontSize: 25, fontWeight: "900" }}>
            Hi {user?.name?.split(" ")[0]} 👋
          </Text>
          <Text style={{ color: theme.muted, marginTop: 4 }}>Let's make today productive!</Text>
        </View>
        <View style={{ width: 42, height: 42, borderRadius: 14, backgroundColor: theme.primarySoft, alignItems: "center", justifyContent: "center" }}>
          <Ionicons name="notifications-outline" size={22} color={theme.primary} />
        </View>
      </View>

      <Card theme={theme} style={{ backgroundColor: theme.primarySoft }}>
        <Text style={{ color: theme.primary, fontWeight: "800" }}>Today</Text>
        <Text style={{ color: theme.text, fontSize: 14, marginTop: 5 }}>
          {new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
        </Text>
      </Card>

      <Card theme={theme} style={{ backgroundColor: theme.greenSoft }}>
        <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
          <View>
            <Text style={{ color: theme.text, fontWeight: "800" }}>Today's Study</Text>
            <Text style={{ color: theme.text, fontSize: 27, fontWeight: "900", marginTop: 4 }}>
              {formatMinutes(data.todayMinutes)}
            </Text>
          </View>
          <Text style={{ color: theme.text, fontWeight: "800" }}>
            Goal: {formatMinutes(goal)}
          </Text>
        </View>

        <View style={{ height: 10, borderRadius: 10, backgroundColor: "#CDEFE0", overflow: "hidden", marginTop: 14 }}>
          <View style={{ width: `${progress * 100}%`, height: "100%", backgroundColor: theme.green }} />
        </View>
      </Card>

      <View style={{ flexDirection: "row", gap: 10 }}>
        <Card theme={theme} style={{ flex: 1, backgroundColor: theme.purpleSoft }}>
          <Text style={{ color: theme.muted }}>This Week</Text>
          <Text style={{ color: theme.text, fontSize: 20, fontWeight: "900", marginTop: 6 }}>
            {formatMinutes(data.weekMinutes)}
          </Text>
        </Card>
        <Card theme={theme} style={{ flex: 1, backgroundColor: theme.orangeSoft }}>
          <Text style={{ color: theme.muted }}>This Month</Text>
          <Text style={{ color: theme.text, fontSize: 20, fontWeight: "900", marginTop: 6 }}>
            {formatMinutes(data.monthMinutes)}
          </Text>
        </Card>
      </View>

      <SectionTitle title="Today's Subjects" action="View All" onAction={() => navigation.navigate("History")} theme={theme} />

      <Card theme={theme}>
        {Object.keys(data.subjectToday).length === 0 ? (
          <Text style={{ color: theme.muted }}>No study recorded today.</Text>
        ) : (
          Object.entries(data.subjectToday).map(([name, minutes]) => (
            <View key={name} style={{ flexDirection: "row", justifyContent: "space-between", paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: theme.border }}>
              <Text style={{ color: theme.text, fontWeight: "700" }}>{name}</Text>
              <Text style={{ color: theme.muted }}>{formatMinutes(minutes)}</Text>
            </View>
          ))
        )}
      </Card>

      <Button
        title="Start Study"
        icon="add"
        theme={theme}
        onPress={() => navigation.navigate("Timer")}
      />

      <Pressable onPress={() => navigation.navigate("Manual")} style={{ alignItems: "center", marginTop: 15 }}>
        <Text style={{ color: theme.primary, fontWeight: "800" }}>+ Add Manual Study</Text>
      </Pressable>
    </Screen>
  );
}
