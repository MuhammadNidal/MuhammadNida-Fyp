import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
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
          opacity: pressed ? 0.95 : 1,
        },
      ]}
    >
      <View style={styles.imageContainer}>
        {game.imageUrl ? (
          <Image source={{ uri: game.imageUrl }} style={styles.image} resizeMode="cover" />
        ) : (
          <View style={[styles.imagePlaceholder, { backgroundColor: colors.muted }]}>
            <Feather name="image" size={32} color={colors.mutedForeground} />
          </View>
        )}
        <View style={styles.imageOverlay}>
          <SportBadge sport={game.sport} type={game.type} small />
          {game.isPaid ? (
            <View style={[styles.pricePill, { backgroundColor: "rgba(0,0,0,0.6)" }]}>
              <Text style={styles.priceTextOverlay}>${game.price}</Text>
            </View>
          ) : (
            <View style={[styles.pricePill, { backgroundColor: "#16A34A" }]}>
              <Text style={styles.priceTextOverlay}>Free</Text>
            </View>
          )}
        </View>
      </View>

      <View style={styles.content}>
        <Text style={[styles.title, { color: colors.foreground }]} numberOfLines={1}>
          {game.title}
        </Text>

        <View style={styles.meta}>
          <View style={styles.metaItem}>
            <Feather name="calendar" size={12} color={colors.mutedForeground} />
            <Text style={[styles.metaText, { color: colors.mutedForeground }]}>
              {formatDate(game.date)} · {game.startTime}
            </Text>
          </View>
          <View style={styles.metaItem}>
            <Feather name="map-pin" size={12} color={colors.mutedForeground} />
            <Text style={[styles.metaText, { color: colors.mutedForeground }]} numberOfLines={1}>
              {game.city}
            </Text>
          </View>
        </View>

        <View style={styles.footer}>
          <View style={styles.metaItem}>
            <Feather name="users" size={12} color={colors.mutedForeground} />
            <Text style={[styles.metaText, { color: colors.mutedForeground }]}>
              {game.participants.length}/{game.maxPlayers}
            </Text>
          </View>
          <View
            style={[
              styles.spotsPill,
              { backgroundColor: isFull ? "#EF444415" : colors.primary + "15" },
            ]}
          >
            <Text
              style={[
                styles.spotsText,
                { color: isFull ? "#EF4444" : colors.primary },
              ]}
            >
              {isFull ? "Full" : `${spotsLeft} left`}
            </Text>
          </View>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    borderWidth: 1,
    marginBottom: 16,
    overflow: "hidden",
    height: 280,
  },
  imageContainer: {
    height: "60%",
    width: "100%",
    position: "relative",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  imagePlaceholder: {
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  imageOverlay: {
    position: "absolute",
    top: 12,
    left: 12,
    right: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  content: {
    height: "40%",
    padding: 14,
    justifyContent: "space-between",
  },
  title: {
    fontSize: 17,
    fontFamily: "Inter_700Bold",
  },
  meta: {
    gap: 4,
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
    paddingVertical: 5,
    borderRadius: 12,
  },
  priceTextOverlay: {
    fontSize: 13,
    fontFamily: "Inter_700Bold",
    color: "#fff",
  },
  spotsPill: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  spotsText: {
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
  },
});
