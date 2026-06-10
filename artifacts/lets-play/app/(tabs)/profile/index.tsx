import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Avatar } from "@/components/Avatar";
import { SportBadge } from "@/components/SportBadge";
import { GameCard } from "@/components/GameCard";
import { EmptyState } from "@/components/EmptyState";
import { useAuth } from "@/context/AuthContext";
import { useData } from "@/context/DataContext";
import { useColors } from "@/hooks/useColors";

export default function ProfileScreen() {
  const colors = useColors();
  const { currentUser } = useAuth();
  const { games, isLoading } = useData();

  if (!currentUser) return null;

  const myGames = games
    .filter((g) => g.participants.includes(currentUser.id) && g.status === "active")
    .slice(0, 3);

  const roleBadge =
    currentUser.role === "pro" ? "Pro" : currentUser.role === "coach" ? "Coach" : null;
  const roleBadgeColor = currentUser.role === "pro" ? "#F97316" : "#8B5CF6";

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.topBar, { paddingTop: 8 }]}>
        <Text style={[styles.title, { color: colors.foreground }]}>Profile</Text>
        <Pressable
          onPress={() => router.push("/(tabs)/profile/settings")}
          style={styles.iconBtn}
        >
          <Feather name="settings" size={22} color={colors.foreground} />
        </Pressable>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 110 }}>
        <View style={styles.profileHeader}>
          <Avatar
            name={currentUser.name}
            avatarUrl={currentUser.avatarUrl}
            role={currentUser.role}
            size={80}
          />
          <View style={styles.nameBlock}>
            <View style={styles.nameRow}>
              <Text style={[styles.name, { color: colors.foreground }]}>{currentUser.name}</Text>
              {currentUser.verificationStatus === "verified" && (
                <Feather name="check-circle" size={16} color="#16A34A" />
              )}
            </View>
            <Text style={[styles.username, { color: colors.mutedForeground }]}>
              @{currentUser.username}
            </Text>
            <View style={styles.locationRow}>
              <Feather name="map-pin" size={12} color={colors.mutedForeground} />
              <Text style={[styles.location, { color: colors.mutedForeground }]}>
                {currentUser.location || "No location set"}
              </Text>
            </View>
            {roleBadge && (
              <View style={[styles.rolePill, { backgroundColor: roleBadgeColor + "18" }]}>
                <Text style={[styles.roleText, { color: roleBadgeColor }]}>{roleBadge}</Text>
              </View>
            )}
          </View>
        </View>

        <View style={[styles.statsBar, { backgroundColor: colors.card, borderColor: colors.border }]}>
          {[
            { label: "Games", value: currentUser.gamesPlayed },
            { label: "Rating", value: currentUser.rating > 0 ? currentUser.rating.toFixed(1) : "—" },
            { label: "Following", value: currentUser.followingIds.length },
          ].map(({ label, value }) => (
            <View key={label} style={styles.statItem}>
              <Text style={[styles.statValue, { color: colors.foreground }]}>{value}</Text>
              <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>{label}</Text>
            </View>
          ))}
        </View>

        {currentUser.bio ? (
          <View style={[styles.section, { marginTop: 4 }]}>
            <Text style={[styles.bio, { color: colors.mutedForeground }]}>{currentUser.bio}</Text>
          </View>
        ) : null}

        <Pressable
          onPress={() => router.push("/(tabs)/profile/edit")}
          style={[styles.editBtn, { borderColor: colors.border }]}
        >
          <Feather name="edit-2" size={15} color={colors.foreground} />
          <Text style={[styles.editBtnText, { color: colors.foreground }]}>Edit Profile</Text>
        </Pressable>

        {currentUser.sports.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Sports & Games</Text>
            <View style={styles.sportsRow}>
              {currentUser.sports.map((s) => (
                <SportBadge key={s} sport={s} />
              ))}
            </View>
          </View>
        )}

        {currentUser.verificationStatus === "none" && (
          <Pressable
            onPress={() => router.push("/(tabs)/profile/verify")}
            style={[styles.verifyBanner, { backgroundColor: "#F0FDF4", borderColor: "#BBF7D0" }]}
          >
            <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
              <View style={[styles.verifyIcon, { backgroundColor: "#DCFCE7" }]}>
                <Feather name="shield" size={18} color="#16A34A" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.verifyTitle, { color: "#15803D" }]}>Get Verified</Text>
                <Text style={[styles.verifySubtitle, { color: "#16A34A" }]}>
                  Apply for player, coach, or pro verification
                </Text>
              </View>
              <Feather name="chevron-right" size={18} color="#16A34A" />
            </View>
          </Pressable>
        )}

        {currentUser.verificationStatus === "pending" && (
          <View
            style={[styles.verifyBanner, { backgroundColor: "#FFFBEB", borderColor: "#FDE68A" }]}
          >
            <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
              <View style={[styles.verifyIcon, { backgroundColor: "#FEF3C7" }]}>
                <Feather name="clock" size={18} color="#D97706" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.verifyTitle, { color: "#92400E" }]}>
                  Verification Pending
                </Text>
                <Text style={[styles.verifySubtitle, { color: "#D97706" }]}>
                  Your application is under review
                </Text>
              </View>
            </View>
          </View>
        )}

        {currentUser.verificationStatus === "verified" && (
          <View
            style={[styles.verifyBanner, { backgroundColor: "#F0FDF4", borderColor: "#BBF7D0" }]}
          >
            <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
              <View style={[styles.verifyIcon, { backgroundColor: "#DCFCE7" }]}>
                <Feather name="check-circle" size={18} color="#16A34A" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.verifyTitle, { color: "#15803D" }]}>Verified Account</Text>
                <Text style={[styles.verifySubtitle, { color: "#16A34A" }]}>
                  Your profile shows a verification badge
                </Text>
              </View>
            </View>
          </View>
        )}

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Active Games</Text>
          {isLoading ? (
            <View style={{ padding: 24, alignItems: "center" }}>
              <ActivityIndicator color="#16A34A" />
            </View>
          ) : myGames.length === 0 ? (
            <EmptyState
              icon="calendar"
              title="No active games"
              subtitle="Join or create a game to get started"
            />
          ) : (
            myGames.map((g) => <GameCard key={g.id} game={g} />)
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingBottom: 8,
  },
  title: { fontSize: 28, fontFamily: "Inter_700Bold" },
  iconBtn: { width: 40, height: 40, alignItems: "center", justifyContent: "center" },
  profileHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 16,
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  nameBlock: { flex: 1, gap: 4 },
  nameRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  name: { fontSize: 22, fontFamily: "Inter_700Bold" },
  username: { fontSize: 14, fontFamily: "Inter_400Regular" },
  locationRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  location: { fontSize: 13, fontFamily: "Inter_400Regular" },
  rolePill: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 10,
    alignSelf: "flex-start",
    marginTop: 4,
  },
  roleText: { fontSize: 12, fontFamily: "Inter_600SemiBold" },
  statsBar: {
    flexDirection: "row",
    marginHorizontal: 20,
    borderRadius: 16,
    borderWidth: 1,
    paddingVertical: 16,
    marginBottom: 8,
  },
  statItem: { flex: 1, alignItems: "center", gap: 2 },
  statValue: { fontSize: 20, fontFamily: "Inter_700Bold" },
  statLabel: { fontSize: 12, fontFamily: "Inter_400Regular" },
  section: { paddingHorizontal: 20, marginBottom: 20, gap: 10 },
  bio: { fontSize: 15, fontFamily: "Inter_400Regular", lineHeight: 22 },
  editBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginHorizontal: 20,
    height: 44,
    borderRadius: 12,
    borderWidth: 1.5,
    marginBottom: 20,
  },
  editBtnText: { fontSize: 15, fontFamily: "Inter_600SemiBold" },
  sectionTitle: { fontSize: 17, fontFamily: "Inter_600SemiBold" },
  sportsRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  verifyBanner: {
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
  },
  verifyIcon: {
    width: 38,
    height: 38,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  verifyTitle: { fontSize: 15, fontFamily: "Inter_600SemiBold" },
  verifySubtitle: { fontSize: 13, fontFamily: "Inter_400Regular", marginTop: 2 },
});
