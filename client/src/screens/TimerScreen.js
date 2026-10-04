// import React, { useCallback, useEffect, useState } from "react";
// import { Alert, AppState, Pressable, Text, View } from "react-native";
// import AsyncStorage from "@react-native-async-storage/async-storage";
// import { Ionicons } from "@expo/vector-icons";
// import { useFocusEffect } from "@react-navigation/native";
// import API from "../api";
// import { useApp } from "../context/AppContext";
// import { light, dark } from "../theme";
// import { Button, Card, Input, Screen } from "../components/UI";
// import { formatClock } from "../utils/time";

// export default function TimerScreen({ navigation }) {
//   const { dark: isDark } = useApp();
//   const theme = isDark ? dark : light;
//   const [subjects, setSubjects] = useState([]);
//   const [subject, setSubject] = useState(null);
//   const [topic, setTopic] = useState("");
//   const [notes, setNotes] = useState("");
//   const [mode, setMode] = useState("idle");
//   const [startAt, setStartAt] = useState(null);
//   const [pausedSeconds, setPausedSeconds] = useState(0);
//   const [displaySeconds, setDisplaySeconds] = useState(0);

//   const load = async () => {
//     const [subjectResponse, saved] = await Promise.all([
//       API.get("/subjects"),
//       AsyncStorage.getItem("activeTimer")
//     ]);

//     setSubjects(subjectResponse.data);

//     if (subjectResponse.data.length && !subject) {
//       setSubject(subjectResponse.data[0]);
//     }

//     if (saved) {
//       const timer = JSON.parse(saved);
//       setStartAt(timer.startAt);
//       setPausedSeconds(timer.pausedSeconds || 0);
//       setTopic(timer.topic || "");
//       setNotes(timer.notes || "");
//       setMode(timer.mode || "running");
//     }
//   };

//   useFocusEffect(useCallback(() => {
//     load().catch(() => {});
//   }, []));

//   useEffect(() => {
//     const update = () => {
//       if (mode === "running" && startAt) {
//         const seconds = Math.max(
//           0,
//           Math.floor((Date.now() - startAt) / 1000) - pausedSeconds
//         );
//         setDisplaySeconds(seconds);
//       }
//     };

//     update();
//     const interval = setInterval(update, 1000);
//     const subscription = AppState.addEventListener("change", update);

//     return () => {
//       clearInterval(interval);
//       subscription.remove();
//     };
//   }, [mode, startAt, pausedSeconds]);

//   const saveTimer = async (next) => {
//     await AsyncStorage.setItem("activeTimer", JSON.stringify(next));
//   };

//   const start = async () => {
//     if (!subject) {
//       return Alert.alert("Select subject", "Create/select a subject first.");
//     }

//     const timer = {
//       mode: "running",
//       startAt: Date.now(),
//       pausedSeconds: 0,
//       topic,
//       notes,
//       subjectId: subject._id
//     };

//     setStartAt(timer.startAt);
//     setPausedSeconds(0);
//     setDisplaySeconds(0);
//     setMode("running");
//     await saveTimer(timer);
//   };

//   const pause = async () => {
//     if (!startAt) return;

//     const elapsed = Math.max(
//       0,
//       Math.floor((Date.now() - startAt) / 1000) - pausedSeconds
//     );

//     const timer = {
//       mode: "paused",
//       startAt,
//       pausedSeconds: pausedSeconds + elapsed,
//       topic,
//       notes,
//       subjectId: subject?._id
//     };

//     setPausedSeconds(timer.pausedSeconds);
//     setDisplaySeconds(timer.pausedSeconds);
//     setMode("paused");
//     await saveTimer(timer);
//   };

//   const resume = async () => {
//     const timer = {
//       mode: "running",
//       startAt: Date.now(),
//       pausedSeconds: 0,
//       topic,
//       notes,
//       subjectId: subject?._id
//     };

//     setStartAt(timer.startAt);
//     setPausedSeconds(0);
//     setMode("running");
//     await saveTimer(timer);
//   };

//   const reset = async () => {
//     await AsyncStorage.removeItem("activeTimer");
//     setMode("idle");
//     setStartAt(null);
//     setPausedSeconds(0);
//     setDisplaySeconds(0);
//   };

//   const stop = async () => {
//     const minutes = Math.max(1, Math.round(displaySeconds / 60));

//     if (!subject) {
//       return Alert.alert("Select subject", "Select a subject first.");
//     }

//     try {
//       await API.post("/sessions", {
//         subject: subject._id,
//         topic,
//         notes,
//         durationMinutes: minutes,
//         date: new Date().toISOString()
//       });

//       await AsyncStorage.removeItem("activeTimer");
//       setMode("idle");
//       setStartAt(null);
//       setPausedSeconds(0);
//       setDisplaySeconds(0);
//       Alert.alert("Saved", `${minutes} minute study session saved.`);
//       navigation.goBack();
//     } catch (error) {
//       Alert.alert("Could not save", error.response?.data?.message || "Try again");
//     }
//   };

//   const chooseSubject = (item) => {
//     setSubject(item);
//   };

//   return (
//     <Screen theme={theme} scroll>
//       <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 18 }}>
//         <Pressable onPress={() => navigation.goBack()} style={{ marginRight: 8 }}>
//           <Ionicons name="chevron-back" size={25} color={theme.text} />
//         </Pressable>
//         <Text style={{ color: theme.text, fontSize: 22, fontWeight: "900" }}>Study Timer</Text>
//       </View>

//       <Text style={{ color: theme.muted, marginBottom: 8 }}>Subject</Text>

//       <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 16 }}>
//         {subjects.map((item) => (
//           <Pressable
//             key={item._id}
//             onPress={() => chooseSubject(item)}
//             style={{
//               paddingVertical: 10,
//               paddingHorizontal: 15,
//               borderRadius: 12,
//               backgroundColor: subject?._id === item._id ? theme.primary : theme.primarySoft
//             }}
//           >
//             <Text style={{ color: subject?._id === item._id ? "#fff" : theme.primary, fontWeight: "800" }}>
//               {item.name}
//             </Text>
//           </Pressable>
//         ))}
//       </View>

//       <Input label="Topic (Optional)" theme={theme} value={topic} onChangeText={setTopic} placeholder="Dynamic Programming" />
//       <Input label="Notes (Optional)" theme={theme} value={notes} onChangeText={setNotes} placeholder="What did you learn?" multiline />

//       <Card theme={theme} style={{ alignItems: "center", paddingVertical: 28 }}>
//         <View style={{
//           width: 245,
//           height: 245,
//           borderRadius: 123,
//           borderWidth: 16,
//           borderColor: theme.primarySoft,
//           alignItems: "center",
//           justifyContent: "center"
//         }}>
//           <Text style={{ color: theme.text, fontSize: 34, fontWeight: "900" }}>
//             {formatClock(displaySeconds)}
//           </Text>
//           <Text style={{ color: theme.muted, marginTop: 5 }}>
//             {mode === "running" ? "Studying..." : mode === "paused" ? "Paused" : "Ready"}
//           </Text>
//         </View>
//       </Card>

//       {mode === "idle" && <Button title="Start Study" icon="play" theme={theme} onPress={start} />}
//       {mode === "running" && (
//         <View style={{ gap: 10 }}>
//           <Button title="Pause" icon="pause" theme={theme} secondary onPress={pause} />
//           <Button title="Stop & Save" icon="stop" theme={theme} onPress={stop} />
//         </View>
//       )}
//       {mode === "paused" && (
//         <View style={{ gap: 10 }}>
//           <Button title="Resume" icon="play" theme={theme} onPress={resume} />
//           <Button title="Stop & Save" icon="stop" theme={theme} onPress={stop} />
//         </View>
//       )}

//       {mode !== "idle" && (
//         <Pressable onPress={reset} style={{ alignItems: "center", marginTop: 16 }}>
//           <Text style={{ color: theme.red, fontWeight: "800" }}>Reset Timer</Text>
//         </Pressable>
//       )}

//       <Text style={{ color: theme.muted, textAlign: "center", marginTop: 20, lineHeight: 20 }}>
//         Your timer start timestamp is saved locally. If you close or remove the app from recent apps, reopening the app recalculates the elapsed time from that timestamp.
//       </Text>
//     </Screen>
//   );
// }




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

  // Timestamp when the CURRENT running period started
  const [startAt, setStartAt] = useState(null);

  // Total seconds accumulated before current running period
  const [pausedSeconds, setPausedSeconds] = useState(0);

  // What we show on screen
  const [displaySeconds, setDisplaySeconds] = useState(0);

  /*
   * ---------------------------------------------------------
   * LOAD SUBJECTS + RESTORE ACTIVE TIMER
   * ---------------------------------------------------------
   */

  const load = async () => {
    try {
      const [subjectResponse, saved] = await Promise.all([
        API.get("/subjects"),
        AsyncStorage.getItem("activeTimer")
      ]);

      const loadedSubjects = subjectResponse.data || [];

      setSubjects(loadedSubjects);

      /*
       * Restore saved timer
       */
      if (saved) {
        const timer = JSON.parse(saved);

        setStartAt(timer.startAt || null);
        setPausedSeconds(timer.pausedSeconds || 0);

        setTopic(timer.topic || "");
        setNotes(timer.notes || "");

        setMode(timer.mode || "running");

        /*
         * Restore selected subject
         */
        const savedSubject = loadedSubjects.find(
          (item) => item._id === timer.subjectId
        );

        if (savedSubject) {
          setSubject(savedSubject);
        } else if (loadedSubjects.length) {
          setSubject(loadedSubjects[0]);
        }

        /*
         * Calculate the correct time immediately
         */
        if (timer.mode === "running" && timer.startAt) {
          const runningSeconds = Math.max(
            0,
            Math.floor((Date.now() - timer.startAt) / 1000)
          );

          const totalSeconds =
            (timer.pausedSeconds || 0) + runningSeconds;

          setDisplaySeconds(totalSeconds);
        } else {
          setDisplaySeconds(timer.pausedSeconds || 0);
        }

        return;
      }

      /*
       * No active timer
       */
      if (loadedSubjects.length && !subject) {
        setSubject(loadedSubjects[0]);
      }
    } catch (error) {
      console.log("Timer load error:", error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      load();
    }, [])
  );

  /*
   * ---------------------------------------------------------
   * TIMER ENGINE
   * ---------------------------------------------------------
   *
   * IMPORTANT:
   *
   * displaySeconds =
   *
   * previously accumulated time
   * +
   * current running period
   *
   */

  useEffect(() => {
    const updateTimer = () => {
      /*
       * Timer is currently running
       */
      if (mode === "running" && startAt) {
        const currentRunningSeconds = Math.max(
          0,
          Math.floor((Date.now() - startAt) / 1000)
        );

        const totalSeconds =
          pausedSeconds + currentRunningSeconds;

        setDisplaySeconds(totalSeconds);
      }

      /*
       * Timer is paused
       *
       * Don't change the value.
       */
      if (mode === "paused") {
        setDisplaySeconds(pausedSeconds);
      }
    };

    /*
     * Update immediately
     */
    updateTimer();

    /*
     * Update every second
     */
    const interval = setInterval(updateTimer, 1000);

    /*
     * When app goes background / foreground,
     * recalculate immediately.
     */
    const subscription = AppState.addEventListener(
      "change",
      (nextState) => {
        if (
          nextState === "active" ||
          nextState === "background"
        ) {
          updateTimer();
        }
      }
    );

    return () => {
      clearInterval(interval);
      subscription.remove();
    };
  }, [mode, startAt, pausedSeconds]);

  /*
   * ---------------------------------------------------------
   * SAVE TIMER LOCALLY
   * ---------------------------------------------------------
   */

  const saveTimer = async (timer) => {
    try {
      await AsyncStorage.setItem(
        "activeTimer",
        JSON.stringify(timer)
      );
    } catch (error) {
      console.log("Could not save timer:", error);
    }
  };

  /*
   * ---------------------------------------------------------
   * START
   * ---------------------------------------------------------
   */

  const start = async () => {
    if (!subject) {
      return Alert.alert(
        "Select subject",
        "Create/select a subject first."
      );
    }

    const now = Date.now();

    const timer = {
      mode: "running",

      // New timer starts now
      startAt: now,

      // Nothing accumulated yet
      pausedSeconds: 0,

      topic,
      notes,

      subjectId: subject._id
    };

    setStartAt(now);
    setPausedSeconds(0);
    setDisplaySeconds(0);
    setMode("running");

    await saveTimer(timer);
  };

  /*
   * ---------------------------------------------------------
   * PAUSE
   * ---------------------------------------------------------
   *
   * IMPORTANT:
   *
   * We calculate how much time has passed since startAt.
   *
   * Then we ADD that time to pausedSeconds.
   *
   * Example:
   *
   * pausedSeconds = 0
   * running = 20 min
   *
   * pause
   *
   * pausedSeconds = 20 min
   *
   */

  const pause = async () => {
    if (!startAt) return;

    const currentRunningSeconds = Math.max(
      0,
      Math.floor((Date.now() - startAt) / 1000)
    );

    const totalSeconds =
      pausedSeconds + currentRunningSeconds;

    const timer = {
      mode: "paused",

      /*
       * We don't need the old start time anymore
       * while paused.
       */
      startAt: null,

      /*
       * Save complete accumulated time.
       */
      pausedSeconds: totalSeconds,

      topic,
      notes,

      subjectId: subject?._id
    };

    setPausedSeconds(totalSeconds);
    setDisplaySeconds(totalSeconds);

    setStartAt(null);
    setMode("paused");

    await saveTimer(timer);
  };

  /*
   * ---------------------------------------------------------
   * RESUME
   * ---------------------------------------------------------
   *
   * THIS FIXES YOUR BUG.
   *
   * We DO NOT reset pausedSeconds.
   *
   * Example:
   *
   * pausedSeconds = 25 minutes
   *
   * Resume:
   *
   * startAt = NOW
   * pausedSeconds = 25 minutes
   *
   * After 5 minutes:
   *
   * display = 25 + 5 = 30 minutes
   *
   */

  const resume = async () => {
    if (!subject) {
      return Alert.alert(
        "Select subject",
        "Select a subject first."
      );
    }

    const now = Date.now();

    const timer = {
      mode: "running",

      /*
       * Start a NEW running period
       */
      startAt: now,

      /*
       * KEEP previous study time
       */
      pausedSeconds,

      topic,
      notes,

      subjectId: subject._id
    };

    setStartAt(now);

    /*
     * VERY IMPORTANT:
     * Don't reset this to 0.
     */
    setPausedSeconds(pausedSeconds);

    /*
     * Keep the old displayed time.
     */
    setDisplaySeconds(pausedSeconds);

    setMode("running");

    await saveTimer(timer);
  };

  /*
   * ---------------------------------------------------------
   * RESET
   * ---------------------------------------------------------
   *
   * This completely removes the active timer.
   */

  const reset = async () => {
    await AsyncStorage.removeItem("activeTimer");

    setMode("idle");
    setStartAt(null);
    setPausedSeconds(0);
    setDisplaySeconds(0);

    setTopic("");
    setNotes("");
  };

  /*
   * ---------------------------------------------------------
   * STOP & SAVE
   * ---------------------------------------------------------
   */

  const stop = async () => {
    /*
     * Calculate the latest value before saving.
     */
    let totalSeconds = displaySeconds;

    if (mode === "running" && startAt) {
      const currentRunningSeconds = Math.max(
        0,
        Math.floor((Date.now() - startAt) / 1000)
      );

      totalSeconds =
        pausedSeconds + currentRunningSeconds;
    }

    /*
     * Convert seconds to minutes.
     *
     * Minimum = 1 minute
     */
    const minutes = Math.max(
      1,
      Math.round(totalSeconds / 60)
    );

    if (!subject) {
      return Alert.alert(
        "Select subject",
        "Select a subject first."
      );
    }

    try {
      await API.post("/sessions", {
        subject: subject._id,
        topic,
        notes,
        durationMinutes: minutes,
        date: new Date().toISOString()
      });

      /*
       * Delete active timer after successful save
       */
      await AsyncStorage.removeItem("activeTimer");

      setMode("idle");
      setStartAt(null);
      setPausedSeconds(0);
      setDisplaySeconds(0);

      Alert.alert(
        "Saved",
        `${minutes} minute study session saved.`
      );

      navigation.goBack();
    } catch (error) {
      console.log("Save session error:", error);

      Alert.alert(
        "Could not save",
        error.response?.data?.message ||
          "Try again"
      );
    }
  };

  /*
   * ---------------------------------------------------------
   * SELECT SUBJECT
   * ---------------------------------------------------------
   */

  const chooseSubject = (item) => {
    setSubject(item);
  };

  /*
   * ---------------------------------------------------------
   * UI
   * ---------------------------------------------------------
   */

  return (
    <Screen theme={theme} scroll>

      {/* HEADER */}

      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          marginBottom: 18
        }}
      >
        <Pressable
          onPress={() => navigation.goBack()}
          style={{ marginRight: 8 }}
        >
          <Ionicons
            name="chevron-back"
            size={25}
            color={theme.text}
          />
        </Pressable>

        <Text
          style={{
            color: theme.text,
            fontSize: 22,
            fontWeight: "900"
          }}
        >
          Study Timer
        </Text>
      </View>

      {/* SUBJECT */}

      <Text
        style={{
          color: theme.muted,
          marginBottom: 8
        }}
      >
        Subject
      </Text>

      <View
        style={{
          flexDirection: "row",
          flexWrap: "wrap",
          gap: 8,
          marginBottom: 16
        }}
      >
        {subjects.map((item) => (
          <Pressable
            key={item._id}
            onPress={() => chooseSubject(item)}
            style={{
              paddingVertical: 10,
              paddingHorizontal: 15,
              borderRadius: 12,

              backgroundColor:
                subject?._id === item._id
                  ? theme.primary
                  : theme.primarySoft
            }}
          >
            <Text
              style={{
                color:
                  subject?._id === item._id
                    ? "#fff"
                    : theme.primary,

                fontWeight: "800"
              }}
            >
              {item.name}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* TOPIC */}

      <Input
        label="Topic (Optional)"
        theme={theme}
        value={topic}
        onChangeText={setTopic}
        placeholder="Dynamic Programming"
      />

      {/* NOTES */}

      <Input
        label="Notes (Optional)"
        theme={theme}
        value={notes}
        onChangeText={setNotes}
        placeholder="What did you learn?"
        multiline
      />

      {/* TIMER */}

      <Card
        theme={theme}
        style={{
          alignItems: "center",
          paddingVertical: 28
        }}
      >
        <View
          style={{
            width: 245,
            height: 245,
            borderRadius: 123,
            borderWidth: 16,
            borderColor: theme.primarySoft,
            alignItems: "center",
            justifyContent: "center"
          }}
        >
          <Text
            style={{
              color: theme.text,
              fontSize: 34,
              fontWeight: "900"
            }}
          >
            {formatClock(displaySeconds)}
          </Text>

          <Text
            style={{
              color: theme.muted,
              marginTop: 5
            }}
          >
            {mode === "running"
              ? "Studying..."
              : mode === "paused"
              ? "Paused"
              : "Ready"}
          </Text>
        </View>
      </Card>

      {/* START */}

      {mode === "idle" && (
        <Button
          title="Start Study"
          icon="play"
          theme={theme}
          onPress={start}
        />
      )}

      {/* RUNNING */}

      {mode === "running" && (
        <View style={{ gap: 10 }}>
          <Button
            title="Pause"
            icon="pause"
            theme={theme}
            secondary
            onPress={pause}
          />

          <Button
            title="Stop & Save"
            icon="stop"
            theme={theme}
            onPress={stop}
          />
        </View>
      )}

      {/* PAUSED */}

      {mode === "paused" && (
        <View style={{ gap: 10 }}>
          <Button
            title="Resume"
            icon="play"
            theme={theme}
            onPress={resume}
          />

          <Button
            title="Stop & Save"
            icon="stop"
            theme={theme}
            onPress={stop}
          />
        </View>
      )}

      {/* RESET */}

      {mode !== "idle" && (
        <Pressable
          onPress={reset}
          style={{
            alignItems: "center",
            marginTop: 16
          }}
        >
          <Text
            style={{
              color: theme.red,
              fontWeight: "800"
            }}
          >
            Reset Timer
          </Text>
        </Pressable>
      )}

      {/* INFORMATION */}

      <Text
        style={{
          color: theme.muted,
          textAlign: "center",
          marginTop: 20,
          lineHeight: 20
        }}
      >
        Your timer is saved locally. If you close the
        app or remove it from recent apps, reopening
        StudyTrack will restore the timer and calculate
        the correct elapsed time.
      </Text>

    </Screen>
  );
}