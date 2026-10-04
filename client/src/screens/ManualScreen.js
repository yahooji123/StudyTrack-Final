import React, { useCallback, useState } from "react";
import { Alert, Pressable, Text, View } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import API from "../api";
import { useApp } from "../context/AppContext";
import { light, dark } from "../theme";
import { Button, Input, Screen } from "../components/UI";
import { todayISO } from "../utils/time";

export default function ManualScreen({ navigation }) {
  const { dark: isDark } = useApp();
  const theme = isDark ? dark : light;
  const [subjects, setSubjects] = useState([]);
  const [subject, setSubject] = useState(null);
  const [topic, setTopic] = useState("");
  const [notes, setNotes] = useState("");
  const [duration, setDuration] = useState("");
  const [date, setDate] = useState(todayISO());

  useFocusEffect(useCallback(() => {
    API.get("/subjects").then((response) => {
      setSubjects(response.data);
      if (response.data.length && !subject) setSubject(response.data[0]);
    }).catch(() => {});
  }, []));

  const save = async () => {
    if (!subject || !duration) {
      return Alert.alert("Missing details", "Select a subject and enter duration.");
    }

    try {
      await API.post("/sessions", {
        subject: subject._id,
        topic,
        notes,
        durationMinutes: Number(duration),
        date: new Date(`${date}T12:00:00`).toISOString()
      });

      Alert.alert("Saved", "Study session added.");
      navigation.goBack();
    } catch (error) {
      Alert.alert("Error", error.response?.data?.message || "Could not save session");
    }
  };

  return (
    <Screen theme={theme} scroll>
      <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 22 }}>
        <Pressable onPress={() => navigation.goBack()} style={{ marginRight: 8 }}>
          <Text style={{ color: theme.primary, fontSize: 25 }}>‹</Text>
        </Pressable>
        <Text style={{ color: theme.text, fontSize: 22, fontWeight: "900" }}>Add Study Session</Text>
      </View>

      <Text style={{ color: theme.text, fontWeight: "800", marginBottom: 8 }}>Subject</Text>
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 15 }}>
        {subjects.map((item) => (
          <Pressable
            key={item._id}
            onPress={() => setSubject(item)}
            style={{
              padding: 12,
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
      <Input label="Date" theme={theme} value={date} onChangeText={setDate} placeholder="YYYY-MM-DD" />
      <Input label="Duration (minutes)" theme={theme} value={duration} onChangeText={setDuration} placeholder="90" keyboardType="numeric" />
      <Input label="Notes (Optional)" theme={theme} value={notes} onChangeText={setNotes} placeholder="What did you study?" multiline />

      <Button title="Save Session" theme={theme} onPress={save} />
    </Screen>
  );
}
