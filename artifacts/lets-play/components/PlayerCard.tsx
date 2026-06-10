import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Avatar } from "./Avatar";
import { SportBadge } from "./SportBadge";
import { useColors } from "@/hooks/useColors";
import { User } from "@/types";

interface PlayerCardProps {
  user: User;
  onFollow?: () => void;
  isFollowing?: boolean;
}

export function PlayerCard({ user, onFollow, isFollowing }: PlayerCardProps) {
  const colors = useColors();

  const roleBadge =
    user.role === "pro" ? "Pro" : user.role === "coach" ? "Coach" : null;
  const roleBadgeColor = user.role === "pro" ? "#F97316" : "#8B5CF6";

  return (
    <Pressable
      onPress={() => router.push(`/(tabs)/explore/players/${user.id}`)}
      style={({ pressed }) => [
        styles.card,
        {
          backgroundColor: colors.card,
          borderColor: colors.border,
          opacity: pressed ? 0.93 : 1,
        },
      ]}
    >
      <View style={styles.row}>
        <Avatar name={user.name} avatarUrl={user.avatarUrl} role={user.role} size={52} />
        <View style={styles.info}>
          <View style={styles.nameRow}>
            <Text style={[styles.name, { color: colors.foreground }]}>{user.name}</Text>
            {user.verificationStatus === "verified" && (
              <Feather name="check-circle" size={14} color={colors.primary} />
            )}
            {roleBadge && (
              <View style={[styles.rolePill, { backgroundColor: roleBadgeColor + "18" }]}>
                <Text style={[styles.roleText, { color: roleBadgeColor }]}>{roleBadge}</Text>
              </View>
            )}
          </View>
          <Text style={[styles.username, { color: colors.mutedForeground }]}>
            @{user.username}
          </Text>
          <Text style={[styles.location, { color: colors.mutedForeground }]} numberOfLines={1}>
            <Feather name="map-pin" size={11} color={colors.mutedForeground} /> {user.location}
          </Text>
        </View>
        {onFollow && (
            <Pressable
            onPress={onFollow}
            style={[
              styles.followBtn,
              {
                backgroundColor: isFollowing ? colors.muted : colors.primary,
                borderColor: isFollowing ? colors.border : colors.primary,
              },
            ]}
          >
            <Text
              style={[
                styles.followText,
                { color: isFollowing ? colors.mutedForeground : colors.primaryForeground },
              ]}
            >
              {isFollowing ? "Following" : "Follow"}
            </Text>
          </Pressable>
        )}
      </View>

      {user.sports.length > 0 && (
        <View style={styles.sports}>
          {user.sports.slice(0, 3).map((s) => (
            <SportBadge key={s} sport={s} small />
          ))}
        </View>
      )}

      {user.rating > 0 && (
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Feather name="star" size={12} color="#EAB308" />
            <Text style={[styles.statText, { color: colors.mutedForeground }]}>
              {user.rating.toFixed(1)}
            </Text>
          </View>
          <Text style={[styles.statDot, { color: colors.border }]}>·</Text>
          <Text style={[styles.statText, { color: colors.mutedForeground }]}>
            {user.gamesPlayed} games
          </Text>
        </View>
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
    gap: 12,
  },
  row: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  info: {
    flex: 1,
    gap: 2,
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    flexWrap: "wrap",
  },
  name: {
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
  },
  username: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
  },
  location: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    marginTop: 2,
  },
  rolePill: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 10,
  },
  roleText: {
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
  },
  followBtn: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
    alignSelf: "flex-start",
  },
  followText: {
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
  },
  sports: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  statsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  statItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
  },
  statText: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
  },
  statDot: {
    fontSize: 12,
  },
});
