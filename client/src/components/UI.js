import React from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

export function Screen({ children, theme, scroll = false }) {
  const Container = scroll ? require("react-native").ScrollView : View;

  return (
    <Container
      style={[styles.screen, { backgroundColor: theme.bg }]}
      contentContainerStyle={scroll ? styles.scrollContent : undefined}
      showsVerticalScrollIndicator={false}
    >
      {children}
    </Container>
  );
}

export function Header({ title, subtitle, theme, onBack, right }) {
  return (
    <View style={styles.header}>
      <View style={styles.headerLeft}>
        {onBack && (
          <Pressable onPress={onBack} style={styles.back}>
            <Ionicons name="chevron-back" size={24} color={theme.text} />
          </Pressable>
        )}
        <View>
          <Text style={[styles.title, { color: theme.text }]}>{title}</Text>
          {subtitle && <Text style={[styles.subtitle, { color: theme.muted }]}>{subtitle}</Text>}
        </View>
      </View>
      {right}
    </View>
  );
}

export function Card({ children, theme, style }) {
  return (
    <View style={[
      styles.card,
      {
        backgroundColor: theme.card,
        borderColor: theme.border
      },
      style
    ]}>
      {children}
    </View>
  );
}

export function Button({ title, onPress, theme, secondary = false, danger = false, disabled = false, icon }) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.button,
        {
          backgroundColor: danger
            ? theme.red
            : secondary
              ? theme.primarySoft
              : theme.primary,
          opacity: disabled ? 0.5 : pressed ? 0.8 : 1
        }
      ]}
    >
      {icon && <Ionicons name={icon} size={18} color={secondary ? theme.primary : "#fff"} />}
      <Text style={[
        styles.buttonText,
        { color: secondary ? theme.primary : "#fff" }
      ]}>
        {title}
      </Text>
    </Pressable>
  );
}

export function Input({ label, theme, ...props }) {
  return (
    <View style={styles.inputWrap}>
      {label && <Text style={[styles.label, { color: theme.text }]}>{label}</Text>}
      <TextInput
        {...props}
        placeholderTextColor={theme.muted}
        style={[
          styles.input,
          {
            color: theme.text,
            backgroundColor: theme.card,
            borderColor: theme.border
          }
        ]}
      />
    </View>
  );
}

export function SectionTitle({ title, action, onAction, theme }) {
  return (
    <View style={styles.sectionTitle}>
      <Text style={[styles.sectionText, { color: theme.text }]}>{title}</Text>
      {action && (
        <Pressable onPress={onAction}>
          <Text style={{ color: theme.primary, fontWeight: "700" }}>{action}</Text>
        </Pressable>
      )}
    </View>
  );
}

export function Empty({ text, theme }) {
  return (
    <Card theme={theme} style={{ alignItems: "center", paddingVertical: 30 }}>
      <Ionicons name="book-outline" size={34} color={theme.muted} />
      <Text style={{ color: theme.muted, marginTop: 10 }}>{text}</Text>
    </Card>
  );
}

export function Loading({ theme }) {
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: theme.bg }}>
      <ActivityIndicator size="large" color={theme.primary} />
    </View>
  );
}

export const styles = StyleSheet.create({
  screen: {
    flex: 1
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 110
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 12,
    paddingBottom: 18
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center"
  },
  back: {
    marginRight: 8,
    padding: 4
  },
  title: {
    fontSize: 22,
    fontWeight: "800"
  },
  subtitle: {
    fontSize: 13,
    marginTop: 3
  },
  card: {
    borderWidth: 1,
    borderRadius: 18,
    padding: 16,
    marginBottom: 14
  },
  button: {
    minHeight: 52,
    borderRadius: 14,
    paddingHorizontal: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8
  },
  buttonText: {
    fontSize: 15,
    fontWeight: "800"
  },
  inputWrap: {
    marginBottom: 14
  },
  label: {
    fontSize: 13,
    fontWeight: "700",
    marginBottom: 7
  },
  input: {
    minHeight: 50,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    fontSize: 15
  },
  sectionTitle: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 8,
    marginBottom: 12
  },
  sectionText: {
    fontSize: 17,
    fontWeight: "800"
  }
});
