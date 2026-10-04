import React, { useCallback, useEffect, useState } from "react";
import { Alert, AppState, Pressable, Text, View } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import API from "../api";
import { useApp } from "../context/AppContext";
import { light, dark } from "../theme";
import { Button, Card, Input, Screen } from "../components/UI";
import { formatClock } from "../utils/time";

export default function TimerScreen({ navigation }) {
  const { dark: isDark } = useApp();
  const theme = isDark ? dark : light;
  const [subjects, setSubjects] = useState([]);
  const [subject, setSubject] = useState(null);
  const [topic, setTopic] = useState("");
  const [notes, setNotes] = useState("");
  const [mode, setMode] = useState("idle");
  const [startAt, setStartAt] = useState(null);
  const [pausedSeconds, setPausedSeconds] = useState(0);
  const [displaySeconds, setDisplaySeconds] = useState(0);

  const load = async () => {
    const [subjectResponse, saved] = await Promise.all([
      API.get("/subjects"),
      AsyncStorage.getItem("activeTimer")
    ]);

    setSubjects(subjectResponse.data);

    if (subjectResponse.data.length && !subject) {
      setSubject(subjectResponse.data[0]);
    }

    if (saved) {
      const timer = JSON.parse(saved);
      setStartAt(timer.startAt);
      setPausedSeconds(timer.pausedSeconds || 0);
      setTopic(timer.topic || "");
      setNotes(timer.notes || "");
      setMode(timer.mode || "running");
    }
  };

  useFocusEffect(useCallback(() => {
    load().catch(() => {});
  }, []));

  useEffect(() => {
    const update = () => {
      if (mode === "running" && startAt) {
        const seconds = Math.max(
          0,
          Math.floor((Date.now() - startAt) / 1000) - pausedSeconds
        );
        setDisplaySeconds(seconds);
      }
    };

    update();
    const interval = setInterval(update, 1000);
    const subscription = AppState.addEventListener("change", update);

    return () => {
      clearInterval(interval);
      subscription.remove();
    };
  }, [mode, startAt, pausedSeconds]);

  const saveTimer = async (next) => {
    await AsyncStorage.setItem("activeTimer", JSON.stringify(next));
  };

  const start = async () => {
    if (!subject) {
      return Alert.alert("Select subject", "Create/select a subject first.");
    }

    const timer = {
      mode: "running",
      startAt: Date.now(),
      pausedSeconds: 0,
      topic,
      notes,
      subjectId: subject._id
    };

    setStartAt(timer.startAt);
    setPausedSeconds(0);
    setDisplaySeconds(0);
    setMode("running");
    await saveTimer(timer);
  };

  const pause = async () => {
    if (!startAt) return;

    const elapsed = Math.max(
      0,
      Math.floor((Date.now() - startAt) / 1000) - pausedSeconds
    );

    const timer = {
      mode: "paused",
      startAt,
      pausedSeconds: pausedSeconds + elapsed,
      topic,
      notes,
      subjectId: subject?._id
    };

    setPausedSeconds(timer.pausedSeconds);
    setDisplaySeconds(timer.pausedSeconds);
    setMode("paused");
    await saveTimer(timer);
  };

  const resume = async () => {
    const timer = {
      mode: "running",
      startAt: Date.now(),
      pausedSeconds: 0,
      topic,
      notes,
      subjectId: subject?._id
    };

    setStartAt(timer.startAt);
    setPausedSeconds(0);
    setMode("running");
    await saveTimer(timer);
  };

  const reset = async () => {
    await AsyncStorage.removeItem("activeTimer");
    setMode("idle");
    setStartAt(null);
    setPausedSeconds(0);
    setDisplaySeconds(0);
  };

  const stop = async () => {
    const minutes = Math.max(1, Math.round(displaySeconds / 60));

    if (!subject) {
      return Alert.alert("Select subject", "Select a subject first.");
    }

    try {
      await API.post("/sessions", {
        subject: subject._id,
        topic,
        notes,
        durationMinutes: minutes,
        date: new Date().toISOString()
      });

      await AsyncStorage.removeItem("activeTimer");
      setMode("idle");
      setStartAt(null);
      setPausedSeconds(0);
      setDisplaySeconds(0);
      Alert.alert("Saved", `${minutes} minute study session saved.`);
      navigation.goBack();
    } catch (error) {
      Alert.alert("Could not save", error.response?.data?.message || "Try again");
    }
  };

  const chooseSubject = (item) => {
    setSubject(item);
  };

  return (
    <Screen theme={theme} scroll>
      <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 18 }}>
        <Pressable onPress={() => navigation.goBack()} style={{ marginRight: 8 }}>
          <Ionicons name="chevron-back" size={25} color={theme.text} />
        </Pressable>
        <Text style={{ color: theme.text, fontSize: 22, fontWeight: "900" }}>Study Timer</Text>
      </View>

      <Text style={{ color: theme.muted, marginBottom: 8 }}>Subject</Text>

      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 16 }}>
        {subjects.map((item) => (
          <Pressable
            key={item._id}
            onPress={() => chooseSubject(item)}
            style={{
              paddingVertical: 10,
              paddingHorizontal: 15,
              borderRadius: 12,
              backgroundColor: subject?._id === item._id ? theme.primary : theme.primarySoft
            }}
          >
            <Text style={{ color: subject?._id === item._id ? "#fff" : theme.primary, fontWeight: "800" }}>
              {item.name}
            </Text>
          </Pressable>
        ))}
      </View>

      <Input label="Topic (Optional)" theme={theme} value={topic} onChangeText={setTopic} placeholder="Dynamic Programming" />
      <Input label="Notes (Optional)" theme={theme} value={notes} onChangeText={setNotes} placeholder="What did you learn?" multiline />

      <Card theme={theme} style={{ alignItems: "center", paddingVertical: 28 }}>
        <View style={{
          width: 245,
          height: 245,
          borderRadius: 123,
          borderWidth: 16,
          borderColor: theme.primarySoft,
          alignItems: "center",
          justifyContent: "center"
        }}>
          <Text style={{ color: theme.text, fontSize: 34, fontWeight: "900" }}>
            {formatClock(displaySeconds)}
          </Text>
          <Text style={{ color: theme.muted, marginTop: 5 }}>
            {mode === "running" ? "Studying..." : mode === "paused" ? "Paused" : "Ready"}
          </Text>
        </View>
      </Card>

      {mode === "idle" && <Button title="Start Study" icon="play" theme={theme} onPress={start} />}
      {mode === "running" && (
        <View style={{ gap: 10 }}>
          <Button title="Pause" icon="pause" theme={theme} secondary onPress={pause} />
          <Button title="Stop & Save" icon="stop" theme={theme} onPress={stop} />
        </View>
      )}
      {mode === "paused" && (
        <View style={{ gap: 10 }}>
          <Button title="Resume" icon="play" theme={theme} onPress={resume} />
          <Button title="Stop & Save" icon="stop" theme={theme} onPress={stop} />
        </View>
      )}

      {mode !== "idle" && (
        <Pressable onPress={reset} style={{ alignItems: "center", marginTop: 16 }}>
          <Text style={{ color: theme.red, fontWeight: "800" }}>Reset Timer</Text>
        </Pressable>
      )}

      <Text style={{ color: theme.muted, textAlign: "center", marginTop: 20, lineHeight: 20 }}>
        Your timer start timestamp is saved locally. If you close or remove the app from recent apps, reopening the app recalculates the elapsed time from that timestamp.
      </Text>
    </Screen>
  );
}
