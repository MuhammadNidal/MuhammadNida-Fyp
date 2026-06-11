import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  FlatList,
  Image,
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
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        <View style={styles.heroSection}>
          {user.avatarUrl ? (
             <Image source={{ uri: user.avatarUrl }} style={styles.heroImage} />
          ) : (
            <View style={[styles.heroImage, { backgroundColor: colors.muted, alignItems: 'center', justifyContent: 'center' }]}>
               <Feather name="user" size={60} color={colors.mutedForeground} />
            </View>
          )}
          <View style={styles.heroOverlay} />
          <View style={[styles.topBar, { paddingTop: insets.top + 8 }]}>
            <Pressable onPress={() => router.back()} style={styles.backBtn}>
              <Feather name="arrow-left" size={22} color="#fff" />
            </Pressable>
          </View>
          
          <View style={styles.heroContent}>
            <View style={styles.nameRow}>
              <Text style={styles.heroName}>{user.name}</Text>
              {user.verificationStatus === "verified" && (
                <Feather name="check-circle" size={18} color="#10B981" />
              )}
            </View>
            <Text style={styles.heroUsername}>@{user.username}</Text>
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
                  backgroundColor: isFollowing ? colors.muted : colors.primary,
                  borderColor: isFollowing ? colors.border : colors.primary,
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
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Role & Location</Text>
          <View style={{ flexDirection: 'row', gap: 10, alignItems: 'center' }}>
            {roleBadge && (
                <View style={[styles.rolePill, { backgroundColor: roleBadgeColor + "18" }]}>
                  <Text style={[styles.roleText, { color: roleBadgeColor }]}>{roleBadge}</Text>
                </View>
              )}
            <View style={styles.locationRow}>
              <Feather name="map-pin" size={14} color={colors.mutedForeground} />
              <Text style={[styles.locationText, { color: colors.mutedForeground }]}>{user.location}</Text>
            </View>
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
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    zIndex: 10,
  },
  backBtn: {
    width: 38,
    height: 38,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.3)",
    borderRadius: 19,
  },
  heroSection: {
    height: 350,
    width: "100%",
    position: "relative",
  },
  heroImage: {
    width: "100%",
    height: "100%",
  },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.3)",
  },
  heroContent: {
    position: "absolute",
    bottom: 24,
    left: 20,
    right: 20,
  },
  heroName: {
    fontSize: 28,
    fontFamily: "Inter_700Bold",
    color: "#fff",
  },
  heroUsername: {
    fontSize: 16,
    fontFamily: "Inter_400Regular",
    color: "rgba(255,255,255,0.8)",
    marginTop: 2,
  },
  nameRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  rolePill: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 },
  roleText: { fontSize: 12, fontFamily: "Inter_600SemiBold" },
  statsRow: {
    flexDirection: "row",
    marginHorizontal: 20,
    borderRadius: 16,
    paddingVertical: 20,
    marginBottom: 8,
    gap: 0,
  },
  statItem: { flex: 1, alignItems: "center", gap: 2 },
  statValue: { fontSize: 20, fontFamily: "Inter_700Bold" },
  statLabel: { fontSize: 12, fontFamily: "Inter_400Regular" },
  actionRow: {
    flexDirection: "row",
    gap: 12,
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  actionBtn: {
    flex: 1,
    height: 48,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    flexDirection: "row",
    gap: 8,
  },
  outlineBtn: { backgroundColor: "transparent" },
  actionBtnText: { fontSize: 15, fontFamily: "Inter_600SemiBold" },
  section: { paddingHorizontal: 20, marginBottom: 24, gap: 12 },
  sectionTitle: { fontSize: 18, fontFamily: "Inter_600SemiBold" },
  locationRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  locationText: { fontSize: 15, fontFamily: "Inter_400Regular" },
  bio: { fontSize: 15, fontFamily: "Inter_400Regular", lineHeight: 24 },
  sportsRow: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
});
