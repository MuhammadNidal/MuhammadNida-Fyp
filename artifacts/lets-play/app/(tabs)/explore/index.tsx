import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { FilterSheet, Filters } from "@/components/FilterSheet";
import { GameCard } from "@/components/GameCard";
import { PlayerCard } from "@/components/PlayerCard";
import { SegmentedControl } from "@/components/SegmentedControl";
import { EmptyState } from "@/components/EmptyState";
import { Avatar } from "@/components/Avatar";
import { SportBadge } from "@/components/SportBadge";
import { useAuth } from "@/context/AuthContext";
import { useData } from "@/context/DataContext";
import { useColors } from "@/hooks/useColors";
import { User } from "@/types";

const DEFAULT_FILTERS: Filters = {
  sport: "all",
  skillLevel: "all",
  ageGroup: "all",
  participationGroup: "all",
  type: "all",
  paid: "all",
};

export default function ExploreScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { currentUser, followUser, unfollowUser } = useAuth();
  const { games, getAllUsers, isLoading: dataLoading } = useData();

  const [tab, setTab] = useState(0);
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS);
  const [filterVisible, setFilterVisible] = useState(false);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);

  useEffect(() => {
    setUsersLoading(true);
    getAllUsers()
      .then((u) => setAllUsers(u.filter((user) => user.id !== currentUser?.id)))
      .finally(() => setUsersLoading(false));
  }, [getAllUsers, currentUser?.id]);

  const filteredGames = useMemo(() => {
    return games
      .filter((g) => g.status === "active")
      .filter((g) => {
        if (
          search &&
          !g.title.toLowerCase().includes(search.toLowerCase()) &&
          !g.sport.toLowerCase().includes(search.toLowerCase()) &&
          !g.city.toLowerCase().includes(search.toLowerCase())
        )
          return false;
        if (filters.sport !== "all" && g.sport !== filters.sport) return false;
        if (filters.skillLevel !== "all" && g.skillLevel !== filters.skillLevel) return false;
        if (filters.ageGroup !== "all" && g.ageGroup !== filters.ageGroup) return false;
        if (
          filters.participationGroup !== "all" &&
          g.participationGroup !== filters.participationGroup
        )
          return false;
        if (filters.type !== "all" && g.type !== filters.type) return false;
        if (filters.paid === "free" && g.isPaid) return false;
        if (filters.paid === "paid" && !g.isPaid) return false;
        return true;
      });
  }, [games, search, filters]);

  const filteredPlayers = useMemo(() => {
    return allUsers.filter((u) => {
      if (
        search &&
        !u.name.toLowerCase().includes(search.toLowerCase()) &&
        !u.username.toLowerCase().includes(search.toLowerCase()) &&
        !u.sports.some((s) => s.toLowerCase().includes(search.toLowerCase()))
      )
        return false;
      if (filters.sport !== "all" && !u.sports.includes(filters.sport)) return false;
      return true;
    });
  }, [allUsers, search, filters]);

  const rosterUsers = useMemo(() => {
    if (!currentUser) return [];
    return allUsers.filter((u) => currentUser.followingIds.includes(u.id));
  }, [allUsers, currentUser]);

  const activeFilterCount = Object.values(filters).filter((v) => v !== "all").length;

  const handleFollow = useCallback(
    async (userId: string) => {
      if (!currentUser) return;
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      if (currentUser.followingIds.includes(userId)) {
        await unfollowUser(userId);
      } else {
        await followUser(userId);
      }
    },
    [currentUser, followUser, unfollowUser]
  );

  const isLoading = dataLoading || usersLoading;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <Text style={[styles.title, { color: colors.foreground }]}>Explore</Text>
        <View style={styles.searchRow}>
          <View
            style={[
              styles.searchBox,
              { backgroundColor: colors.muted, borderColor: colors.border },
            ]}
          >
            <Feather name="search" size={16} color={colors.mutedForeground} />
            <TextInput
              style={[styles.searchInput, { color: colors.foreground }]}
              placeholder={
                tab === 0
                  ? "Search games, sports, locations..."
                  : tab === 1
                  ? "Search players..."
                  : "Search your roster..."
              }
              placeholderTextColor={colors.mutedForeground}
              value={search}
              onChangeText={setSearch}
            />
            {search.length > 0 && (
              <Pressable onPress={() => setSearch("")}>
                <Feather name="x" size={16} color={colors.mutedForeground} />
              </Pressable>
            )}
          </View>
          {tab !== 2 && (
            <Pressable
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setFilterVisible(true);
              }}
              style={[
                styles.filterBtn,
                {
                  backgroundColor: activeFilterCount > 0 ? "#16A34A" : colors.muted,
                  borderColor: colors.border,
                },
              ]}
            >
              <Feather
                name="sliders"
                size={18}
                color={activeFilterCount > 0 ? "#fff" : colors.mutedForeground}
              />
              {activeFilterCount > 0 && (
                <View style={styles.filterBadge}>
                  <Text style={styles.filterBadgeText}>{activeFilterCount}</Text>
                </View>
              )}
            </Pressable>
          )}
        </View>
        <SegmentedControl
          options={["Games", "Players", "Roster"]}
          selectedIndex={tab}
          onChange={(i) => {
            setTab(i);
            setSearch("");
          }}
        />
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#16A34A" />
          <Text style={[styles.loadingText, { color: colors.mutedForeground }]}>
            Loading...
          </Text>
        </View>
      ) : tab === 0 ? (
        <FlatList
          data={filteredGames}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => <GameCard game={item} />}
          ListEmptyComponent={
            <EmptyState
              icon="calendar"
              title="No games found"
              subtitle="Try adjusting your search or filters to find more games"
            />
          }
        />
      ) : tab === 1 ? (
        <FlatList
          data={filteredPlayers}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <PlayerCard
              user={item}
              onFollow={() => handleFollow(item.id)}
              isFollowing={currentUser?.followingIds.includes(item.id)}
            />
          )}
          ListEmptyComponent={
            <EmptyState
              icon="users"
              title="No players found"
              subtitle="Try adjusting your search or sport filter"
            />
          }
        />
      ) : (
        <FlatList
          data={rosterUsers.filter((u) =>
            search
              ? u.name.toLowerCase().includes(search.toLowerCase()) ||
                u.username.toLowerCase().includes(search.toLowerCase())
              : true
          )}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => <RosterCard user={item} colors={colors} onUnfollow={() => handleFollow(item.id)} />}
          ListEmptyComponent={
            <EmptyState
              icon="users"
              title="Your roster is empty"
              subtitle="Follow players to add them to your roster. Visit the Players tab to discover people to play with."
            />
          }
        />
      )}

      <FilterSheet
        visible={filterVisible}
        onClose={() => setFilterVisible(false)}
        filters={filters}
        onApply={setFilters}
      />
    </View>
  );
}

function RosterCard({
  user,
  colors,
  onUnfollow,
}: {
  user: User;
  colors: any;
  onUnfollow: () => void;
}) {
  return (
    <Pressable
      onPress={() => router.push(`/(tabs)/explore/players/${user.id}`)}
      style={({ pressed }) => [
        rStyles.card,
        { backgroundColor: colors.card, borderColor: colors.border, opacity: pressed ? 0.9 : 1 },
      ]}
    >
      <Avatar name={user.name} avatarUrl={user.avatarUrl} role={user.role} size={48} />
      <View style={{ flex: 1 }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
          <Text style={[rStyles.name, { color: colors.foreground }]}>{user.name}</Text>
          {user.verificationStatus === "verified" && (
            <Feather name="check-circle" size={13} color="#16A34A" />
          )}
        </View>
        <Text style={[rStyles.username, { color: colors.mutedForeground }]}>@{user.username}</Text>
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 4, marginTop: 4 }}>
          {user.sports.slice(0, 3).map((s) => (
            <SportBadge key={s} sport={s} />
          ))}
        </View>
      </View>
      <Pressable
        onPress={(e) => { e.stopPropagation(); onUnfollow(); }}
        style={[rStyles.unfollowBtn, { borderColor: colors.border }]}
      >
        <Text style={[rStyles.unfollowText, { color: colors.mutedForeground }]}>Following</Text>
      </Pressable>
    </Pressable>
  );
}

const rStyles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 10,
  },
  name: { fontSize: 15, fontFamily: "Inter_600SemiBold" },
  username: { fontSize: 13, fontFamily: "Inter_400Regular", marginTop: 1 },
  unfollowBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1.5,
  },
  unfollowText: { fontSize: 12, fontFamily: "Inter_500Medium" },
});

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 12,
    gap: 12,
  },
  title: {
    fontSize: 28,
    fontFamily: "Inter_700Bold",
  },
  searchRow: {
    flexDirection: "row",
    gap: 10,
    alignItems: "center",
  },
  searchBox: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 14,
    height: 46,
    borderRadius: 12,
    borderWidth: 1,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    fontFamily: "Inter_400Regular",
  },
  filterBtn: {
    width: 46,
    height: 46,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  filterBadge: {
    position: "absolute",
    top: -4,
    right: -4,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: "#F97316",
    alignItems: "center",
    justifyContent: "center",
  },
  filterBadgeText: {
    color: "#fff",
    fontSize: 10,
    fontFamily: "Inter_700Bold",
  },
  list: {
    paddingHorizontal: 20,
    paddingBottom: 110,
    paddingTop: 4,
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
  },
});
