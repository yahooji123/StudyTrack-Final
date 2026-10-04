import React, { useState } from "react";
import { Alert, KeyboardAvoidingView, Platform, Pressable, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import API from "../api";
import { useApp } from "../context/AppContext";
import { light, dark } from "../theme";
import { Button, Card, Input, Screen } from "../components/UI";

export default function LoginScreen({ navigation }) {
  const { login, dark: isDark } = useApp();
  const theme = isDark ? dark : light;
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    if (!email || !password) {
      return Alert.alert("Missing details", "Enter email and password.");
    }

    setBusy(true);

    try {
      const response = await API.post("/auth/login", { email, password });
      await login(response.data);
    } catch (error) {
      Alert.alert("Login failed", error.response?.data?.message || "Could not login");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Screen theme={theme} scroll>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <View style={{ alignItems: "center", marginTop: 45, marginBottom: 28 }}>
          <View style={{
            width: 76,
            height: 76,
            borderRadius: 22,
            backgroundColor: theme.primary,
            alignItems: "center",
            justifyContent: "center"
          }}>
            <Ionicons name="book" size={42} color="#fff" />
          </View>
          <Text style={{ color: theme.text, fontSize: 30, fontWeight: "900", marginTop: 15 }}>
            StudyTrack
          </Text>
          <Text style={{ color: theme.muted, marginTop: 5 }}>
            Track your study. Build a better you.
          </Text>
        </View>

        <Card theme={theme}>
          <Text style={{ color: theme.text, fontSize: 23, fontWeight: "900", marginBottom: 18 }}>
            Welcome back
          </Text>

          <Input label="Email" theme={theme} value={email} onChangeText={setEmail} placeholder="you@example.com" autoCapitalize="none" keyboardType="email-address" />
          <Input label="Password" theme={theme} value={password} onChangeText={setPassword} placeholder="Your password" secureTextEntry />

          <Button title={busy ? "Logging in..." : "Login"} onPress={submit} theme={theme} disabled={busy} />

          <View style={{ flexDirection: "row", justifyContent: "center", marginTop: 20 }}>
            <Text style={{ color: theme.muted }}>Don't have an account? </Text>
            <Pressable onPress={() => navigation.navigate("Register")}>
              <Text style={{ color: theme.primary, fontWeight: "800" }}>Sign Up</Text>
            </Pressable>
          </View>
        </Card>
      </KeyboardAvoidingView>
    </Screen>
  );
}
