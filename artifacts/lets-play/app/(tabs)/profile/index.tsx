import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import { ActivityIndicator, Image, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
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

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 110 }}>
        <View style={styles.headerSection}>
          <Image 
            source={{ uri: "https://images.unsplash.com/photo-1541278107931-e006523892df?w=800&q=80" }} 
            style={styles.headerBg} 
          />
          <View style={styles.headerOverlay} />
          <View style={[styles.topBar, { paddingTop: 40 }]}>
            <Text style={[styles.title, { color: "#fff" }]}>Profile</Text>
            <Pressable
              onPress={() => router.push("/(tabs)/profile/settings")}
              style={styles.headerIconBtn}
            >
              <Feather name="settings" size={22} color="#fff" />
            </Pressable>
          </View>
          
          <View style={styles.profileInfo}>
            <Avatar
              name={currentUser.name}
              avatarUrl={currentUser.avatarUrl}
              role={currentUser.role}
              size={90}
            />
            <View style={styles.nameBlock}>
              <View style={styles.nameRow}>
                <Text style={[styles.name, { color: "#fff" }]}>{currentUser.name}</Text>
                {currentUser.verificationStatus === "verified" && (
                  <Feather name="check-circle" size={18} color="#10B981" />
                )}
              </View>
              <Text style={[styles.username, { color: "rgba(255,255,255,0.8)" }]}>
                @{currentUser.username}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.statsContainer}>
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
        </View>

        <View style={styles.mainContent}>
          <View style={styles.section}>
             <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text style={[styles.sectionTitle, { color: colors.foreground }]}>About</Text>
                <Pressable onPress={() => router.push("/(tabs)/profile/edit")}>
                   <Text style={{ color: colors.primary, fontSize: 14, fontFamily: 'Inter_600SemiBold' }}>Edit</Text>
                </Pressable>
             </View>
             {currentUser.bio ? (
                <Text style={[styles.bio, { color: colors.mutedForeground }]}>{currentUser.bio}</Text>
             ) : (
                <Text style={[styles.bio, { color: colors.mutedForeground, fontStyle: 'italic' }]}>No bio added yet.</Text>
             )}
          </View>

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Location</Text>
            <View style={styles.locationRow}>
              <Feather name="map-pin" size={14} color={colors.mutedForeground} />
              <Text style={[styles.location, { color: colors.mutedForeground }]}>
                {currentUser.location || "No location set"}
              </Text>
            </View>
          </View>

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
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  headerSection: {
    height: 280,
    width: "100%",
    position: "relative",
  },
  headerBg: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
  },
  headerOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    zIndex: 10,
  },
  title: { fontSize: 24, fontFamily: "Inter_700Bold" },
  headerIconBtn: { 
    width: 40, 
    height: 40, 
    alignItems: "center", 
    justifyContent: "center",
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 20,
  },
  profileInfo: {
    position: 'absolute',
    bottom: 30,
    left: 20,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  nameBlock: { flex: 1, gap: 2 },
  nameRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  name: { fontSize: 22, fontFamily: "Inter_700Bold" },
  username: { fontSize: 14, fontFamily: "Inter_400Regular" },
  statsContainer: {
    marginTop: -30,
    paddingHorizontal: 20,
    zIndex: 20,
  },
  statsBar: {
    flexDirection: "row",
    borderRadius: 20,
    borderWidth: 1,
    paddingVertical: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  statItem: { flex: 1, alignItems: "center", gap: 2 },
  statValue: { fontSize: 20, fontFamily: "Inter_700Bold" },
  statLabel: { fontSize: 12, fontFamily: "Inter_400Regular" },
  mainContent: {
    paddingTop: 24,
    gap: 24,
  },
  section: { paddingHorizontal: 20, gap: 12 },
  bio: { fontSize: 15, fontFamily: "Inter_400Regular", lineHeight: 24 },
  sectionTitle: { fontSize: 18, fontFamily: "Inter_600SemiBold" },
  locationRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  location: { fontSize: 14, fontFamily: "Inter_400Regular" },
  sportsRow: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  verifyBanner: {
    marginHorizontal: 20,
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
