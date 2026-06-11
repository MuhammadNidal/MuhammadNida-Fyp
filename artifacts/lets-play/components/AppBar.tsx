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
            <Feather name="zap" size={18} color="#fff" />
          </View>
          <Text style={[styles.brandText, { color: colors.foreground }]}>
            Playground
          </Text>
        </Pressable>

        <View style={styles.actions}>
          {currentUser && (
            <Pressable
              onPress={() => router.push("/(tabs)/profile")}
              style={({ pressed }) => [
                styles.userBtn, 
                { 
                  backgroundColor: colors.muted,
                  opacity: pressed ? 0.8 : 1,
                }
              ]}
            >
              <Avatar
                name={currentUser.name}
                avatarUrl={currentUser.avatarUrl}
                role={currentUser.role}
                size={28}
              />
              <Text
                style={[styles.userName, { color: colors.foreground }]}
                numberOfLines={1}
              >
                {currentUser.name.split(' ')[0]}
              </Text>
              <Feather name="chevron-down" size={14} color={colors.mutedForeground} />
            </Pressable>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    borderBottomWidth: 1,
  },
  inner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    height: 64,
    paddingHorizontal: 16,
  },
  brand: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  logo: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  brandText: {
    fontSize: 20,
    fontFamily: "Inter_700Bold",
    letterSpacing: -0.5,
  },
  actions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  userBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 12,
  },
  userName: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
    maxWidth: 80,
  },
});
