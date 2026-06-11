import { Tabs } from "expo-router";
import { Feather } from "@expo/vector-icons";
import React from "react";
import { Platform, StyleSheet, View } from "react-native";
import { useColors } from "@/hooks/useColors";
import { AppBar } from "@/components/AppBar";
import { Footer } from "@/components/Footer";

export default function TabLayout() {
  const colors = useColors();
  const isWeb = Platform.OS === "web";

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <AppBar />
      <View style={styles.content}>
        <Tabs
          screenOptions={{
            tabBarActiveTintColor: colors.primary,
            tabBarInactiveTintColor: colors.mutedForeground,
            headerShown: false,
            tabBarStyle: {
              backgroundColor: colors.background,
              borderTopWidth: 1,
              borderTopColor: colors.border,
              height: isWeb ? 100 : 86,
              paddingBottom: isWeb ? 10 : 8,
              paddingTop: 8,
              elevation: 0,
              shadowOpacity: 0,
            },
            tabBarItemStyle: {
              height: 48,
            },
            tabBarLabelStyle: {
              fontSize: 10,
              fontFamily: "Inter_600SemiBold",
              marginTop: 0,
            },
            tabBarIconStyle: {
              marginBottom: -2,
            },
          }}
        >
          <Tabs.Screen name="index" options={{ href: null }} />
          <Tabs.Screen
            name="explore"
            options={{
              title: "Explore",
              tabBarIcon: ({ color, size }) => (
                <Feather name="search" size={size - 2} color={color} />
              ),
            }}
          />
          <Tabs.Screen
            name="create"
            options={{
              title: "Create",
              tabBarIcon: ({ color, size }) => (
                <Feather name="plus-circle" size={size - 2} color={color} />
              ),
            }}
          />
          <Tabs.Screen
            name="matches"
            options={{
              title: "Matches",
              tabBarIcon: ({ color, size }) => (
                <Feather name="calendar" size={size - 2} color={color} />
              ),
            }}
          />
          <Tabs.Screen
            name="inbox"
            options={{
              title: "Inbox",
              tabBarIcon: ({ color, size }) => (
                <Feather name="message-circle" size={size - 2} color={color} />
              ),
            }}
          />
          <Tabs.Screen
            name="profile"
            options={{
              title: "Profile",
              tabBarIcon: ({ color, size }) => (
                <Feather name="user" size={size - 2} color={color} />
              ),
            }}
          />
        </Tabs>
      </View>
      {/* {isWeb &&  />} */}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
});
