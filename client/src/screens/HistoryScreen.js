import React, { useCallback, useState } from "react";
import { Text, View } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import API from "../api";
import { useApp } from "../context/AppContext";
import { light, dark } from "../theme";
import { Card, Empty, Screen, SectionTitle } from "../components/UI";
import { dateLabel, formatMinutes } from "../utils/time";

export default function HistoryScreen() {
  const { dark: isDark } = useApp();
  const theme = isDark ? dark : light;
  const [sessions, setSessions] = useState([]);

  useFocusEffect(useCallback(() => {
    API.get("/sessions").then((response) => setSessions(response.data)).catch(() => {});
  }, []));

  return (
    <Screen theme={theme} scroll>
      <SectionTitle title="Study History" theme={theme} />

      {sessions.length === 0 ? (
        <Empty text="Your study history will appear here." theme={theme} />
      ) : (
        sessions.map((item) => (
          <Card key={item._id} theme={theme}>
            <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
              <View style={{ flex: 1 }}>
                <Text style={{ color: theme.text, fontWeight: "900", fontSize: 16 }}>
                  {item.subject?.name}
                </Text>
                <Text style={{ color: theme.muted, marginTop: 4 }}>
                  {item.topic || "Study session"}
                </Text>
                {item.notes ? (
                  <Text style={{ color: theme.muted, marginTop: 5 }} numberOfLines={2}>
                    {item.notes}
                  </Text>
                ) : null}
                <Text style={{ color: theme.muted, marginTop: 7 }}>
                  {dateLabel(item.date)}
                </Text>
              </View>

              <Text style={{ color: theme.text, fontWeight: "900" }}>
                {formatMinutes(item.durationMinutes)}
              </Text>
            </View>
          </Card>
        ))
      )}
    </Screen>
  );
}
