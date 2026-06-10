import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import { Platform, Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { Avatar } from "./Avatar";
import { useAuth } from "@/context/AuthContext";

export function AppBar() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { currentUser } = useAuth();
  const isWeb = Platform.OS === "web";

  return (
    <View
      style={[
        styles.bar,
        {
          backgroundColor: colors.background,
          borderBottomColor: colors.border,
          paddingTop: isWeb ? 0 : insets.top,
        },
      ]}
    >
      <View style={styles.inner}>
        <Pressable
          onPress={() => router.push("/(tabs)/explore")}
          style={styles.brand}
        >
          <View style={[styles.logo, { backgroundColor: colors.primary }]}>
            <Feather name="play" size={16} color="#fff" />
          </View>
          <Text style={[styles.brandText, { color: colors.foreground }]}>
            Play Connect
          </Text>
        </Pressable>

        <View style={styles.actions}>
          <Pressable
            onPress={() => router.push("/(tabs)/inbox")}
            style={[styles.actionBtn, { backgroundColor: colors.muted }]}
          >
            <Feather name="message-circle" size={18} color={colors.foreground} />
          </Pressable>
          {currentUser && (
            <Pressable
              onPress={() => router.push("/(tabs)/profile")}
              style={[styles.userBtn, { backgroundColor: colors.muted }]}
            >
              <Avatar
                name={currentUser.name}
                avatarUrl={currentUser.avatarUrl}
                role={currentUser.role}
                size={26}
              />
              <Text
                style={[styles.userName, { color: colors.foreground }]}
                numberOfLines={1}
              >
                {currentUser.name}
              </Text>
            </Pressable>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  inner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    height: 52,
    paddingHorizontal: 20,
  },
  brand: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  logo: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  brandText: {
    fontSize: 18,
    fontFamily: "Inter_700Bold",
  },
  actions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  actionBtn: {
    width: 36,
    height: 36,
    borderRadius: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  userBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingLeft: 6,
    paddingRight: 12,
    paddingVertical: 4,
    borderRadius: 20,
  },
  userName: {
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
    maxWidth: 100,
  },
});
