import React, { useState } from "react";
import { Alert, Pressable, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useApp } from "../context/AppContext";
import { light, dark } from "../theme";
import API from "../api";
import { Button, Card, Input, Screen, SectionTitle } from "../components/UI";
import { formatMinutes } from "../utils/time";

export default function ProfileScreen() {
  const { user, logout, dark: isDark, toggleDark, refreshUser } = useApp();
  const theme = isDark ? dark : light;
  const [goal, setGoal] = useState(String((user?.dailyGoalMinutes || 360) / 60));
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const saveGoal = async () => {
    try {
      await API.put("/user/goal", { hours: Number(goal) });
      await refreshUser();
      Alert.alert("Saved", "Daily goal updated.");
    } catch (error) {
      Alert.alert("Error", error.response?.data?.message || "Could not update goal");
    }
  };

  const changePassword = async () => {
    try {
      await API.put("/user/password", { oldPassword, newPassword });
      setOldPassword("");
      setNewPassword("");
      setShowPassword(false);
      Alert.alert("Done", "Password changed successfully.");
    } catch (error) {
      Alert.alert("Error", error.response?.data?.message || "Could not change password");
    }
  };

  return (
    <Screen theme={theme} scroll>
      <View style={{ alignItems: "center", marginTop: 8, marginBottom: 22 }}>
        <View style={{
          width: 78,
          height: 78,
          borderRadius: 39,
          backgroundColor: theme.purpleSoft,
          alignItems: "center",
          justifyContent: "center"
        }}>
          <Text style={{ color: theme.purple, fontSize: 30, fontWeight: "900" }}>
            {user?.name?.charAt(0)?.toUpperCase()}
          </Text>
        </View>

        <Text style={{ color: theme.text, fontSize: 24, fontWeight: "900", marginTop: 10 }}>
          {user?.name}
        </Text>
        <Text style={{ color: theme.muted, marginTop: 3 }}>{user?.email}</Text>
      </View>

      <Card theme={theme}>
        <Text style={{ color: theme.text, fontSize: 17, fontWeight: "900", marginBottom: 14 }}>
          Daily Study Goal
        </Text>
        <Input label="Hours per day" theme={theme} value={goal} onChangeText={setGoal} keyboardType="decimal-pad" />
        <Button title="Save Goal" theme={theme} onPress={saveGoal} />
      </Card>

      <Card theme={theme}>
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
            <Ionicons name={isDark ? "moon" : "sunny"} size={22} color={theme.primary} />
            <Text style={{ color: theme.text, fontWeight: "800" }}>Dark Mode</Text>
          </View>
          <Pressable
            onPress={toggleDark}
            style={{
              width: 52,
              height: 30,
              borderRadius: 20,
              backgroundColor: isDark ? theme.primary : theme.border,
              padding: 3,
              justifyContent: "center"
            }}
          >
            <View style={{
              width: 24,
              height: 24,
              borderRadius: 12,
              backgroundColor: "#fff",
              alignSelf: isDark ? "flex-end" : "flex-start"
            }} />
          </Pressable>
        </View>
      </Card>

      <SectionTitle title="Achievements" theme={theme} />

      <Card theme={theme}>
        <View style={{ flexDirection: "row", gap: 10, alignItems: "center" }}>
          <Text style={{ fontSize: 28 }}>🔥</Text>
          <View>
            <Text style={{ color: theme.text, fontWeight: "900" }}>7 Day Streak</Text>
            <Text style={{ color: theme.muted }}>Keep studying consistently.</Text>
          </View>
        </View>
      </Card>

      <Card theme={theme}>
        <View style={{ flexDirection: "row", gap: 10, alignItems: "center" }}>
          <Text style={{ fontSize: 28 }}>📚</Text>
          <View>
            <Text style={{ color: theme.text, fontWeight: "900" }}>50 Hours Studied</Text>
            <Text style={{ color: theme.muted }}>A long-term milestone.</Text>
          </View>
        </View>
      </Card>

      {showPassword && (
        <Card theme={theme}>
          <Input label="Old Password" theme={theme} value={oldPassword} onChangeText={setOldPassword} secureTextEntry />
          <Input label="New Password" theme={theme} value={newPassword} onChangeText={setNewPassword} secureTextEntry />
          <Button title="Change Password" theme={theme} onPress={changePassword} />
        </Card>
      )}

      {!showPassword && (
        <Button title="Change Password" theme={theme} secondary onPress={() => setShowPassword(true)} />
      )}

      <View style={{ marginTop: 12 }}>
        <Button title="Logout" theme={theme} danger onPress={() => logout()} />
      </View>

      <Text style={{ color: theme.muted, textAlign: "center", marginTop: 18 }}>
        Current daily goal: {formatMinutes(user?.dailyGoalMinutes || 360)}
      </Text>
    </Screen>
  );
}
