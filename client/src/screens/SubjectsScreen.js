import React, { useCallback, useState } from "react";
import { Alert, Pressable, Text, View } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import API from "../api";
import { useApp } from "../context/AppContext";
import { light, dark } from "../theme";
import { Button, Card, Empty, Input, Screen, SectionTitle } from "../components/UI";

export default function SubjectsScreen() {
  const { dark: isDark } = useApp();
  const theme = isDark ? dark : light;
  const [subjects, setSubjects] = useState([]);
  const [name, setName] = useState("");
  const [editing, setEditing] = useState(null);

  const load = async () => {
    const response = await API.get("/subjects");
    setSubjects(response.data);
  };

  useFocusEffect(useCallback(() => {
    load().catch(() => {});
  }, []));

  const save = async () => {
    if (!name.trim()) return;

    try {
      if (editing) {
        await API.put(`/subjects/${editing._id}`, { name });
      } else {
        await API.post("/subjects", { name });
      }

      setName("");
      setEditing(null);
      load();
    } catch (error) {
      Alert.alert("Error", error.response?.data?.message || "Could not save subject");
    }
  };

  const remove = (item) => {
    Alert.alert("Delete subject", `Delete ${item.name}?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await API.delete(`/subjects/${item._id}`);
            load();
          } catch (error) {
            Alert.alert("Cannot delete", error.response?.data?.message || "This subject is used in history.");
          }
        }
      }
    ]);
  };

  return (
    <Screen theme={theme} scroll>
      <SectionTitle title="My Subjects" theme={theme} />

      <Card theme={theme}>
        <Input
          label={editing ? "Edit subject" : "Add subject"}
          theme={theme}
          value={name}
          onChangeText={setName}
          placeholder="DSA"
        />
        <Button
          title={editing ? "Update Subject" : "Add Subject"}
          theme={theme}
          onPress={save}
        />
        {editing && (
          <Pressable onPress={() => { setEditing(null); setName(""); }} style={{ alignItems: "center", marginTop: 12 }}>
            <Text style={{ color: theme.muted }}>Cancel edit</Text>
          </Pressable>
        )}
      </Card>

      {subjects.length === 0 ? (
        <Empty text="No subjects yet. Add your first subject." theme={theme} />
      ) : (
        subjects.map((item, index) => (
          <Card key={item._id} theme={theme}>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <View style={{
                width: 13,
                height: 13,
                borderRadius: 7,
                backgroundColor: [theme.purple, theme.green, theme.orange, theme.primary, theme.red][index % 5],
                marginRight: 12
              }} />
              <Text style={{ flex: 1, color: theme.text, fontWeight: "800", fontSize: 16 }}>{item.name}</Text>

              <Pressable onPress={() => { setEditing(item); setName(item.name); }} style={{ padding: 8 }}>
                <Ionicons name="create-outline" size={20} color={theme.muted} />
              </Pressable>

              <Pressable onPress={() => remove(item)} style={{ padding: 8 }}>
                <Ionicons name="trash-outline" size={20} color={theme.red} />
              </Pressable>
            </View>
          </Card>
        ))
      )}
    </Screen>
  );
}
