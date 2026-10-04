// import React, { useCallback, useState } from "react";
// import { Text, View } from "react-native";
// import { useFocusEffect } from "@react-navigation/native";
// import API from "../api";
// import { useApp } from "../context/AppContext";
// import { light, dark } from "../theme";
// import { Card, Screen, SectionTitle } from "../components/UI";
// import { formatMinutes } from "../utils/time";

// export default function AnalyticsScreen() {
//   const { dark: isDark, user } = useApp();
//   const theme = isDark ? dark : light;
//   const [data, setData] = useState(null);

//   useFocusEffect(useCallback(() => {
//     API.get("/sessions/dashboard").then((response) => setData(response.data)).catch(() => {});
//   }, []));

//   if (!data) {
//     return <Screen theme={theme}><Text style={{ color: theme.muted }}>Loading analytics...</Text></Screen>;
//   }

//   const entries = Object.entries(data.subjectMonth).sort((a, b) => b[1] - a[1]);
//   const max = Math.max(...Object.values(data.dailyMap), 1);
//   const totalDays = Object.keys(data.dailyMap).length;
//   const average = totalDays ? Math.round(data.monthMinutes / totalDays) : 0;
//   const goal = user?.dailyGoalMinutes || 360;


//  // const monthlyGoal = goal * new Date().getDate();


//   const goalPercent = Math.min(Math.round((data.monthMinutes / Math.max(monthlyGoal, 1)) * 100), 100);

//   return (
//     <Screen theme={theme} scroll>
//       <SectionTitle title="Analytics" theme={theme} />

//       <Card theme={theme}>
//         <Text style={{ color: theme.muted }}>This Month</Text>
//         <Text style={{ color: theme.text, fontSize: 30, fontWeight: "900", marginTop: 5 }}>
//           {formatMinutes(data.monthMinutes)}
//         </Text>
//         <Text style={{ color: theme.muted, marginTop: 4 }}>
//           Average: {formatMinutes(average)} / study day
//         </Text>
//       </Card>

//       <Card theme={theme}>
//         <Text style={{ color: theme.text, fontWeight: "900", fontSize: 17 }}>
//           Goal vs Actual
//         </Text>
//         <Text style={{ color: theme.muted, marginTop: 6 }}>
//           Monthly goal: {formatMinutes(monthlyGoal)}
//         </Text>

//         <View style={{ height: 12, borderRadius: 10, backgroundColor: theme.border, overflow: "hidden", marginTop: 15 }}>
//           <View style={{ width: `${goalPercent}%`, height: "100%", backgroundColor: theme.primary }} />
//         </View>
//         <Text style={{ color: theme.primary, fontWeight: "900", marginTop: 7 }}>{goalPercent}%</Text>
//       </Card>

//       <Card theme={theme}>
//         <Text style={{ color: theme.text, fontWeight: "900", fontSize: 17, marginBottom: 18 }}>
//           Study by Day
//         </Text>

//         <View style={{ flexDirection: "row", alignItems: "flex-end", height: 150, gap: 6 }}>
//           {Object.entries(data.dailyMap).slice(-14).map(([day, minutes]) => (
//             <View key={day} style={{ flex: 1, alignItems: "center", justifyContent: "flex-end" }}>
//               <View style={{
//                 width: "70%",
//                 height: Math.max(8, (minutes / max) * 105),
//                 borderRadius: 8,
//                 backgroundColor: theme.primary
//               }} />
//               <Text style={{ color: theme.muted, fontSize: 8, marginTop: 6 }}>
//                 {day.slice(8)}
//               </Text>
//             </View>
//           ))}
//         </View>
//       </Card>

//       <Card theme={theme}>
//         <Text style={{ color: theme.text, fontWeight: "900", fontSize: 17, marginBottom: 10 }}>
//           Subject-wise Study Time
//         </Text>

//         {entries.map(([name, minutes], index) => (
//           <View key={name} style={{ marginBottom: 14 }}>
//             <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
//               <Text style={{ color: theme.text, fontWeight: "700" }}>{name}</Text>
//               <Text style={{ color: theme.muted }}>{formatMinutes(minutes)}</Text>
//             </View>
//             <View style={{ height: 8, borderRadius: 8, backgroundColor: theme.border, overflow: "hidden", marginTop: 7 }}>
//               <View style={{
//                 width: `${Math.round((minutes / Math.max(data.monthMinutes, 1)) * 100)}%`,
//                 height: "100%",
//                 backgroundColor: [theme.purple, theme.orange, theme.green, theme.primary, theme.red][index % 5]
//               }} />
//             </View>
//           </View>
//         ))}
//       </Card>

//       <Card theme={theme}>
//         <Text style={{ color: theme.text, fontWeight: "900", fontSize: 17 }}>
//           Streak
//         </Text>
//         <View style={{ flexDirection: "row", marginTop: 15 }}>
//           <View style={{ flex: 1 }}>
//             <Text style={{ color: theme.muted }}>Current</Text>
//             <Text style={{ color: theme.text, fontSize: 24, fontWeight: "900" }}>{data.currentStreak} days</Text>
//           </View>
//           <View style={{ flex: 1 }}>
//             <Text style={{ color: theme.muted }}>Best</Text>
//             <Text style={{ color: theme.text, fontSize: 24, fontWeight: "900" }}>{data.bestStreak} days</Text>
//           </View>
//         </View>
//       </Card>
//     </Screen>
//   );
// }


import React, { useCallback, useState } from "react";
import { Text, View } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import API from "../api";
import { useApp } from "../context/AppContext";
import { light, dark } from "../theme";
import { Card, Screen, SectionTitle } from "../components/UI";
import { formatMinutes } from "../utils/time";

export default function AnalyticsScreen() {
  const { dark: isDark, user } = useApp();
  const theme = isDark ? dark : light;

  const [data, setData] = useState(null);

  useFocusEffect(
    useCallback(() => {
      API.get("/sessions/dashboard")
        .then((response) => {
          setData(response.data);
        })
        .catch((error) => {
          console.error("Analytics error:", error);
        });
    }, [])
  );

  if (!data) {
    return (
      <Screen theme={theme}>
        <Text style={{ color: theme.muted }}>
          Loading analytics...
        </Text>
      </Screen>
    );
  }

  const entries = Object.entries(data.subjectMonth || {}).sort(
    (a, b) => b[1] - a[1]
  );

  const dailyValues = Object.values(data.dailyMap || {});

  const max = Math.max(...dailyValues, 1);

  const totalDays = Object.keys(data.dailyMap || {}).length;

  const average = totalDays
    ? Math.round(data.monthMinutes / totalDays)
    : 0;

  // Daily goal in minutes
  const goal = user?.dailyGoalMinutes || 360;

  // Get current month information
  const today = new Date();

  const year = today.getFullYear();
  const month = today.getMonth();

  // Number of days in current month
  const daysInMonth = new Date(
    year,
    month + 1,
    0
  ).getDate();

  // Monthly goal = Daily goal × Days in current month
  const monthlyGoal = goal * daysInMonth;

  // Monthly progress percentage
  const goalPercent = Math.min(
    Math.round(
      (data.monthMinutes / Math.max(monthlyGoal, 1)) * 100
    ),
    100
  );

  return (
    <Screen theme={theme} scroll>
      <SectionTitle
        title="Analytics"
        theme={theme}
      />

      {/* THIS MONTH */}
      <Card theme={theme}>
        <Text
          style={{
            color: theme.muted
          }}
        >
          This Month
        </Text>

        <Text
          style={{
            color: theme.text,
            fontSize: 30,
            fontWeight: "900",
            marginTop: 5
          }}
        >
          {formatMinutes(data.monthMinutes)}
        </Text>

        <Text
          style={{
            color: theme.muted,
            marginTop: 4
          }}
        >
          Average: {formatMinutes(average)} / study day
        </Text>
      </Card>

      {/* GOAL VS ACTUAL */}
      <Card theme={theme}>
        <Text
          style={{
            color: theme.text,
            fontWeight: "900",
            fontSize: 17
          }}
        >
          Goal vs Actual
        </Text>

        <Text
          style={{
            color: theme.muted,
            marginTop: 6
          }}
        >
          Daily goal: {formatMinutes(goal)}
        </Text>

        <Text
          style={{
            color: theme.muted,
            marginTop: 4
          }}
        >
          Monthly goal: {formatMinutes(monthlyGoal)}
        </Text>

        <Text
          style={{
            color: theme.muted,
            marginTop: 4
          }}
        >
          Actual: {formatMinutes(data.monthMinutes)}
        </Text>

        {/* Progress bar */}
        <View
          style={{
            height: 12,
            borderRadius: 10,
            backgroundColor: theme.border,
            overflow: "hidden",
            marginTop: 15
          }}
        >
          <View
            style={{
              width: `${goalPercent}%`,
              height: "100%",
              backgroundColor: theme.primary
            }}
          />
        </View>

        <Text
          style={{
            color: theme.primary,
            fontWeight: "900",
            marginTop: 7
          }}
        >
          {goalPercent}%
        </Text>
      </Card>

      {/* STUDY BY DAY */}
      <Card theme={theme}>
        <Text
          style={{
            color: theme.text,
            fontWeight: "900",
            fontSize: 17,
            marginBottom: 18
          }}
        >
          Study by Day
        </Text>

        <View
          style={{
            flexDirection: "row",
            alignItems: "flex-end",
            height: 150,
            gap: 6
          }}
        >
          {Object.entries(data.dailyMap || {})
            .slice(-14)
            .map(([day, minutes]) => (
              <View
                key={day}
                style={{
                  flex: 1,
                  alignItems: "center",
                  justifyContent: "flex-end"
                }}
              >
                <View
                  style={{
                    width: "70%",
                    height: Math.max(
                      8,
                      (minutes / max) * 105
                    ),
                    borderRadius: 8,
                    backgroundColor: theme.primary
                  }}
                />

                <Text
                  style={{
                    color: theme.muted,
                    fontSize: 8,
                    marginTop: 6
                  }}
                >
                  {day.slice(8)}
                </Text>
              </View>
            ))}
        </View>
      </Card>

      {/* SUBJECT WISE STUDY */}
      <Card theme={theme}>
        <Text
          style={{
            color: theme.text,
            fontWeight: "900",
            fontSize: 17,
            marginBottom: 10
          }}
        >
          Subject-wise Study Time
        </Text>

        {entries.length === 0 ? (
          <Text
            style={{
              color: theme.muted
            }}
          >
            No study data available yet.
          </Text>
        ) : (
          entries.map(([name, minutes], index) => (
            <View
              key={name}
              style={{
                marginBottom: 14
              }}
            >
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between"
                }}
              >
                <Text
                  style={{
                    color: theme.text,
                    fontWeight: "700"
                  }}
                >
                  {name}
                </Text>

                <Text
                  style={{
                    color: theme.muted
                  }}
                >
                  {formatMinutes(minutes)}
                </Text>
              </View>

              <View
                style={{
                  height: 8,
                  borderRadius: 8,
                  backgroundColor: theme.border,
                  overflow: "hidden",
                  marginTop: 7
                }}
              >
                <View
                  style={{
                    width: `${Math.round(
                      (minutes /
                        Math.max(
                          data.monthMinutes,
                          1
                        )) *
                        100
                    )}%`,
                    height: "100%",
                    backgroundColor:
                      [
                        theme.purple,
                        theme.orange,
                        theme.green,
                        theme.primary,
                        theme.red
                      ][index % 5]
                  }}
                />
              </View>
            </View>
          ))
        )}
      </Card>

      {/* STREAK */}
      <Card theme={theme}>
        <Text
          style={{
            color: theme.text,
            fontWeight: "900",
            fontSize: 17
          }}
        >
          Streak
        </Text>

        <View
          style={{
            flexDirection: "row",
            marginTop: 15
          }}
        >
          <View
            style={{
              flex: 1
            }}
          >
            <Text
              style={{
                color: theme.muted
              }}
            >
              Current
            </Text>

            <Text
              style={{
                color: theme.text,
                fontSize: 24,
                fontWeight: "900"
              }}
            >
              {data.currentStreak} days
            </Text>
          </View>

          <View
            style={{
              flex: 1
            }}
          >
            <Text
              style={{
                color: theme.muted
              }}
            >
              Best
            </Text>

            <Text
              style={{
                color: theme.text,
                fontSize: 24,
                fontWeight: "900"
              }}
            >
              {data.bestStreak} days
            </Text>
          </View>
        </View>
      </Card>
    </Screen>
  );
}