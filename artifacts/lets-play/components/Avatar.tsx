import React from "react";
import { Image, StyleSheet, Text, View } from "react-native";
import { useColors } from "@/hooks/useColors";

interface AvatarProps {
  name: string;
  avatarUrl?: string;
  size?: number;
  role?: "player" | "coach" | "pro";
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

const DEFAULT_AVATAR = "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop&crop=face";

export function Avatar({ name, avatarUrl, size = 44, role }: AvatarProps) {
  const colors = useColors();
  const fontSize = Math.max(12, Math.floor(size * 0.38));
  const roleColor = role === "pro" ? "#F97316" : role === "coach" ? "#8B5CF6" : colors.primary;

  const displayUrl = avatarUrl || DEFAULT_AVATAR;

  return (
    <View style={[styles.wrapper, { width: size, height: size, borderRadius: size / 2 }]}>
      <Image
        source={{ uri: displayUrl }}
        style={{ width: size, height: size, borderRadius: size / 2 }}
      />
      {role && role !== "player" && (
        <View
          style={[
            styles.badge,
            { backgroundColor: roleColor, right: -2, bottom: -2 },
          ]}
        >
          <Text style={styles.badgeText}>{role === "pro" ? "P" : "C"}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: "relative",
  },
  placeholder: {
    alignItems: "center",
    justifyContent: "center",
  },
  initials: {
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 0.5,
  },
  badge: {
    position: "absolute",
    width: 16,
    height: 16,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  badgeText: {
    color: "#fff",
    fontSize: 9,
    fontFamily: "Inter_700Bold",
  },
});
