import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  FlatList,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Avatar } from "@/components/Avatar";
import { SportBadge } from "@/components/SportBadge";
import { GameCard } from "@/components/GameCard";
import { EmptyState } from "@/components/EmptyState";
import { useAuth } from "@/context/AuthContext";
import { useData } from "@/context/DataContext";
import { useColors } from "@/hooks/useColors";
import { User } from "@/types";

export default function PlayerProfileScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { currentUser, followUser, unfollowUser } = useAuth();
  const { games, getAllUsers, getOrCreateConversation } = useData();
  const [user, setUser] = useState<User | undefined>();

  useEffect(() => {
    getAllUsers().then((users) => setUser(users.find((u) => u.id === id)));
  }, [id, getAllUsers]);

  if (!user) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background, alignItems: "center", justifyContent: "center" }}>
        <Text style={{ color: colors.mutedForeground, fontFamily: "Inter_400Regular" }}>Loading...</Text>
      </View>
    );
  }

  const isFollowing = currentUser?.followingIds.includes(user.id) ?? false;
  const isOwnProfile = currentUser?.id === user.id;

  const userGames = games.filter(
    (g) => g.participants.includes(user.id) && g.status === "active"
  );

  const handleFollow = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (isFollowing) await unfollowUser(user.id);
    else await followUser(user.id);
  };

  const handleMessage = async () => {
    if (!currentUser) return;
    const convo = await getOrCreateConversation(user.id);
    router.push(`/(tabs)/inbox/${convo.id}`);
  };

  const roleBadge = user.role === "pro" ? "Pro" : user.role === "coach" ? "Coach" : null;
  const roleBadgeColor = user.role === "pro" ? "#F97316" : "#8B5CF6";

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.topBar, { paddingTop: insets.top + 8 }]}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Feather name="arrow-left" size={22} color={colors.foreground} />
        </Pressable>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        <View style={styles.profileHeader}>
          <Avatar name={user.name} avatarUrl={user.avatarUrl} role={user.role} size={80} />
          <View style={styles.nameBlock}>
            <View style={styles.nameRow}>
              <Text style={[styles.name, { color: colors.foreground }]}>{user.name}</Text>
              {user.verificationStatus === "verified" && (
                <Feather name="check-circle" size={16} color="#16A34A" />
              )}
            </View>
            <Text style={[styles.username, { color: colors.mutedForeground }]}>@{user.username}</Text>
            {roleBadge && (
              <View style={[styles.rolePill, { backgroundColor: roleBadgeColor + "18" }]}>
                <Text style={[styles.roleText, { color: roleBadgeColor }]}>{roleBadge}</Text>
              </View>
            )}
          </View>
        </View>

        <View style={styles.statsRow}>
          {[
            { label: "Games", value: user.gamesPlayed },
            { label: "Rating", value: user.rating > 0 ? user.rating.toFixed(1) : "—" },
            { label: "Following", value: user.followingIds.length },
          ].map(({ label, value }) => (
            <View key={label} style={styles.statItem}>
              <Text style={[styles.statValue, { color: colors.foreground }]}>{value}</Text>
              <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>{label}</Text>
            </View>
          ))}
        </View>

        {!isOwnProfile && (
          <View style={styles.actionRow}>
            <Pressable
              onPress={handleFollow}
              style={({ pressed }) => [
                styles.actionBtn,
                {
                  backgroundColor: isFollowing ? colors.muted : "#16A34A",
                  borderColor: isFollowing ? colors.border : "#16A34A",
                  opacity: pressed ? 0.85 : 1,
                },
              ]}
            >
              <Text style={[styles.actionBtnText, { color: isFollowing ? colors.mutedForeground : "#fff" }]}>
                {isFollowing ? "Following" : "Follow"}
              </Text>
            </Pressable>
            <Pressable
              onPress={handleMessage}
              style={({ pressed }) => [
                styles.actionBtn,
                styles.outlineBtn,
                { borderColor: colors.border, opacity: pressed ? 0.85 : 1 },
              ]}
            >
              <Feather name="message-circle" size={16} color={colors.foreground} />
              <Text style={[styles.actionBtnText, { color: colors.foreground }]}>Message</Text>
            </Pressable>
          </View>
        )}

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Location</Text>
          <View style={styles.locationRow}>
            <Feather name="map-pin" size={14} color={colors.mutedForeground} />
            <Text style={[styles.locationText, { color: colors.mutedForeground }]}>{user.location}</Text>
          </View>
        </View>

        {user.bio ? (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>About</Text>
            <Text style={[styles.bio, { color: colors.mutedForeground }]}>{user.bio}</Text>
          </View>
        ) : null}

        {user.sports.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Sports & Games</Text>
            <View style={styles.sportsRow}>
              {user.sports.map((s) => (
                <SportBadge key={s} sport={s} />
              ))}
            </View>
          </View>
        )}

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Active Games</Text>
          {userGames.length === 0 ? (
            <EmptyState icon="calendar" title="No active games" />
          ) : (
            userGames.map((g) => <GameCard key={g.id} game={g} />)
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  topBar: {
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  backBtn: {
    width: 38,
    height: 38,
    alignItems: "center",
    justifyContent: "center",
  },
  profileHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  nameBlock: { flex: 1, gap: 4 },
  nameRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  name: { fontSize: 22, fontFamily: "Inter_700Bold" },
  username: { fontSize: 14, fontFamily: "Inter_400Regular" },
  rolePill: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 10, alignSelf: "flex-start" },
  roleText: { fontSize: 12, fontFamily: "Inter_600SemiBold" },
  statsRow: {
    flexDirection: "row",
    marginHorizontal: 20,
    borderRadius: 16,
    paddingVertical: 16,
    marginBottom: 16,
    gap: 0,
  },
  statItem: { flex: 1, alignItems: "center", gap: 2 },
  statValue: { fontSize: 20, fontFamily: "Inter_700Bold" },
  statLabel: { fontSize: 12, fontFamily: "Inter_400Regular" },
  actionRow: {
    flexDirection: "row",
    gap: 10,
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  actionBtn: {
    flex: 1,
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    flexDirection: "row",
    gap: 6,
  },
  outlineBtn: { backgroundColor: "transparent" },
  actionBtnText: { fontSize: 15, fontFamily: "Inter_600SemiBold" },
  section: { paddingHorizontal: 20, marginBottom: 20, gap: 10 },
  sectionTitle: { fontSize: 17, fontFamily: "Inter_600SemiBold" },
  locationRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  locationText: { fontSize: 14, fontFamily: "Inter_400Regular" },
  bio: { fontSize: 15, fontFamily: "Inter_400Regular", lineHeight: 22 },
  sportsRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
});
