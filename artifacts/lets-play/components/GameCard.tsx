import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { SportBadge } from "./SportBadge";
import { useColors } from "@/hooks/useColors";
import { Game } from "@/types";

interface GameCardProps {
  game: Game;
  showHost?: boolean;
  hostName?: string;
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const diffDays = Math.floor((d.getTime() - now.getTime()) / 86400000);
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Tomorrow";
  return d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
}

export function GameCard({ game, hostName }: GameCardProps) {
  const colors = useColors();
  const spotsLeft = game.maxPlayers - game.participants.length;
  const isFull = spotsLeft <= 0;

  return (
    <Pressable
      onPress={() => router.push(`/(tabs)/explore/games/${game.id}`)}
      style={({ pressed }) => [
        styles.card,
        {
          backgroundColor: colors.card,
          borderColor: colors.border,
          opacity: pressed ? 0.93 : 1,
        },
      ]}
    >
      <View style={styles.top}>
        <SportBadge sport={game.sport} type={game.type} small />
        {game.isPaid && (
          <View style={[styles.pricePill, { backgroundColor: colors.primary + "18" }]}> 
            <Text style={[styles.priceText, { color: colors.primary }]}> 
              ${game.price}
            </Text>
          </View>
        )}
        {!game.isPaid && (
          <View style={[styles.pricePill, { backgroundColor: "#F0FDF4" }]}> 
            <Text style={[styles.priceText, { color: colors.primary }]}>Free</Text>
          </View>
        )}
      </View>

      <Text style={[styles.title, { color: colors.foreground }]} numberOfLines={2}>
        {game.title}
      </Text>

      <View style={styles.meta}>
        <View style={styles.metaItem}>
          <Feather name="calendar" size={13} color={colors.mutedForeground} />
          <Text style={[styles.metaText, { color: colors.mutedForeground }]}>
            {formatDate(game.date)} · {game.startTime}
          </Text>
        </View>
        <View style={styles.metaItem}>
          <Feather name="map-pin" size={13} color={colors.mutedForeground} />
          <Text style={[styles.metaText, { color: colors.mutedForeground }]} numberOfLines={1}>
            {game.city}
          </Text>
        </View>
      </View>

      <View style={styles.footer}>
        <View style={styles.metaItem}>
          <Feather name="users" size={13} color={colors.mutedForeground} />
          <Text style={[styles.metaText, { color: colors.mutedForeground }]}>
            {game.participants.length}/{game.maxPlayers}
          </Text>
        </View>
        <View
          style={[
            styles.spotsPill,
            { backgroundColor: isFull ? "#EF444420" : colors.primary + "18" },
          ]}
        >
          <Text
            style={[
              styles.spotsText,
              { color: isFull ? "#EF4444" : colors.primary },
            ]}
          >
            {isFull ? "Full" : `${spotsLeft} spot${spotsLeft !== 1 ? "s" : ""} left`}
          </Text>
        </View>
      </View>

      {hostName && (
        <Text style={[styles.host, { color: colors.mutedForeground }]}>
          by {hostName}
        </Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    marginBottom: 12,
    gap: 10,
  },
  top: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  title: {
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
    lineHeight: 22,
  },
  meta: {
    gap: 5,
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  metaText: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  pricePill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  priceText: {
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
  },
  spotsPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  spotsText: {
    fontSize: 12,
    fontFamily: "Inter_600SemiBold",
  },
  host: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    marginTop: -4,
  },
});
