import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
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
          opacity: pressed ? 0.95 : 1,
        },
      ]}
    >
      <View style={styles.imageContainer}>
        {user.avatarUrl ? (
          <Image source={{ uri: user.avatarUrl }} style={styles.image} resizeMode="cover" />
        ) : (
          <View style={[styles.imagePlaceholder, { backgroundColor: colors.muted }]}>
            <Feather name="user" size={40} color={colors.mutedForeground} />
          </View>
        )}
        <View style={styles.imageOverlay}>
          {roleBadge && (
            <View style={[styles.rolePill, { backgroundColor: roleBadgeColor }]}>
              <Text style={styles.roleTextOverlay}>{roleBadge}</Text>
            </View>
          )}
          {onFollow && (
            <Pressable
              onPress={onFollow}
              style={[
                styles.followBtn,
                {
                  backgroundColor: isFollowing ? "rgba(255,255,255,0.2)" : colors.primary,
                  backdropFilter: "blur(10px)",
                },
              ]}
            >
              <Feather 
                name={isFollowing ? "check" : "plus"} 
                size={14} 
                color={isFollowing ? "#fff" : colors.primaryForeground} 
              />
            </Pressable>
          )}
        </View>
        <View style={styles.nameOverlay}>
           <Text style={styles.nameTextOverlay} numberOfLines={1}>{user.name}</Text>
           {user.verificationStatus === "verified" && (
              <Feather name="check-circle" size={14} color="#10B981" />
            )}
        </View>
      </View>

      <View style={styles.content}>
        <View style={styles.infoRow}>
          <Text style={[styles.username, { color: colors.mutedForeground }]}>@{user.username}</Text>
          <View style={styles.ratingBox}>
             <Feather name="star" size={12} color="#EAB308" />
             <Text style={[styles.ratingText, { color: colors.foreground }]}>{user.rating.toFixed(1)}</Text>
          </View>
        </View>

        <View style={styles.sportsRow}>
          {user.sports.slice(0, 2).map((s) => (
            <SportBadge key={s} sport={s} small />
          ))}
          {user.sports.length > 2 && (
             <Text style={[styles.moreText, { color: colors.mutedForeground }]}>+{user.sports.length - 2}</Text>
          )}
        </View>

        <View style={styles.footer}>
          <View style={styles.locationItem}>
            <Feather name="map-pin" size={11} color={colors.mutedForeground} />
            <Text style={[styles.locationText, { color: colors.mutedForeground }]} numberOfLines={1}>
              {user.location}
            </Text>
          </View>
          <Text style={[styles.gamesText, { color: colors.mutedForeground }]}>
            {user.gamesPlayed} games
          </Text>
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
    height: 260,
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
  nameOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 12,
    paddingTop: 30,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(0,0,0,0.3)", // Gradient would be better but simple rgba for now
  },
  nameTextOverlay: {
    color: "#fff",
    fontSize: 18,
    fontFamily: "Inter_700Bold",
  },
  rolePill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  roleTextOverlay: {
    fontSize: 11,
    fontFamily: "Inter_700Bold",
    color: "#fff",
  },
  followBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.3)",
  },
  content: {
    height: "40%",
    padding: 14,
    justifyContent: "space-between",
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  username: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
  },
  ratingBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(234, 179, 8, 0.1)",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  ratingText: {
    fontSize: 12,
    fontFamily: "Inter_600SemiBold",
  },
  sportsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  moreText: {
    fontSize: 11,
    fontFamily: "Inter_500Medium",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  locationItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    flex: 1,
  },
  locationText: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
  },
  gamesText: {
    fontSize: 11,
    fontFamily: "Inter_500Medium",
  },
});
