import React, { useState } from "react";
import { Alert, KeyboardAvoidingView, Platform, Pressable, Text, View } from "react-native";
import API from "../api";
import { useApp } from "../context/AppContext";
import { light, dark } from "../theme";
import { Button, Card, Input, Screen } from "../components/UI";

export default function RegisterScreen({ navigation }) {
  const { login, dark: isDark } = useApp();
  const theme = isDark ? dark : light;
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    if (!name || !email || !password) {
      return Alert.alert("Missing details", "Fill all fields.");
    }

    setBusy(true);

    try {
      const response = await API.post("/auth/register", {
        name,
        email,
        password
      });

      await login(response.data);
    } catch (error) {
      Alert.alert("Registration failed", error.response?.data?.message || "Could not create account");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Screen theme={theme} scroll>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <Pressable onPress={() => navigation.goBack()} style={{ marginBottom: 22, marginTop: 8 }}>
          <Text style={{ color: theme.primary, fontWeight: "800" }}>‹ Back to Login</Text>
        </Pressable>

        <Text style={{ color: theme.text, fontSize: 30, fontWeight: "900" }}>
          Create Account
        </Text>
        <Text style={{ color: theme.muted, marginTop: 6, marginBottom: 22 }}>
          Start tracking your study time.
        </Text>

        <Card theme={theme}>
          <Input label="Name" theme={theme} value={name} onChangeText={setName} placeholder="Your name" />
          <Input label="Email" theme={theme} value={email} onChangeText={setEmail} placeholder="you@example.com" autoCapitalize="none" keyboardType="email-address" />
          <Input label="Password" theme={theme} value={password} onChangeText={setPassword} placeholder="Minimum 6 characters" secureTextEntry />

          <Button title={busy ? "Creating..." : "Create Account"} onPress={submit} theme={theme} disabled={busy} />
        </Card>
      </KeyboardAvoidingView>
    </Screen>
  );
}
