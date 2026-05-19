import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { getSport } from "@/constants/sports";

interface SportBadgeProps {
  sport: string;
  small?: boolean;
  type?: "game" | "lesson" | "pro_game";
}

export function SportBadge({ sport, small, type }: SportBadgeProps) {
  const s = getSport(sport);
  const color = s?.color ?? "#6B7280";
  const bg = s?.bgColor ?? "#F9FAFB";
  const name = s?.name ?? sport;

  const typeLabel = type === "lesson" ? "Lesson" : type === "pro_game" ? "Pro Game" : null;
  const typeColor = type === "lesson" ? "#8B5CF6" : "#F97316";

  return (
    <View style={styles.row}>
      <View style={[styles.badge, { backgroundColor: bg }, small && styles.badgeSmall]}>
        <Text style={[styles.text, { color }, small && styles.textSmall]}>{name}</Text>
      </View>
      {typeLabel && (
        <View style={[styles.badge, { backgroundColor: typeColor + "18" }, small && styles.badgeSmall]}>
          <Text style={[styles.text, { color: typeColor }, small && styles.textSmall]}>{typeLabel}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    gap: 6,
    flexWrap: "wrap",
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  badgeSmall: {
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  text: {
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
  },
  textSmall: {
    fontSize: 11,
  },
});
