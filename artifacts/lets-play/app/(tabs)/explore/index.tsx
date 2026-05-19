import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  FlatList,
  Platform,
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
  const { games, getAllUsers } = useData();

  const [tab, setTab] = useState(0);
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS);
  const [filterVisible, setFilterVisible] = useState(false);
  const [allUsers, setAllUsers] = useState<User[]>([]);

  useEffect(() => {
    getAllUsers().then((u) =>
      setAllUsers(u.filter((user) => user.id !== currentUser?.id))
    );
  }, [getAllUsers, currentUser?.id]);

  const filteredGames = useMemo(() => {
    return games
      .filter((g) => g.status === "active")
      .filter((g) => {
        if (search && !g.title.toLowerCase().includes(search.toLowerCase()) &&
          !g.sport.toLowerCase().includes(search.toLowerCase()) &&
          !g.city.toLowerCase().includes(search.toLowerCase())) return false;
        if (filters.sport !== "all" && g.sport !== filters.sport) return false;
        if (filters.skillLevel !== "all" && g.skillLevel !== filters.skillLevel) return false;
        if (filters.ageGroup !== "all" && g.ageGroup !== filters.ageGroup) return false;
        if (filters.participationGroup !== "all" && g.participationGroup !== filters.participationGroup) return false;
        if (filters.type !== "all" && g.type !== filters.type) return false;
        if (filters.paid === "free" && g.isPaid) return false;
        if (filters.paid === "paid" && !g.isPaid) return false;
        return true;
      });
  }, [games, search, filters]);

  const filteredPlayers = useMemo(() => {
    return allUsers.filter((u) => {
      if (search &&
        !u.name.toLowerCase().includes(search.toLowerCase()) &&
        !u.username.toLowerCase().includes(search.toLowerCase()) &&
        !u.sports.some((s) => s.toLowerCase().includes(search.toLowerCase()))) return false;
      if (filters.sport !== "all" && !u.sports.includes(filters.sport)) return false;
      return true;
    });
  }, [allUsers, search, filters]);

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

  const topPad = insets.top + (Platform.OS === "web" ? 67 : 0);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: topPad + 16 }]}>
        <Text style={[styles.title, { color: colors.foreground }]}>Explore</Text>
        <View style={styles.searchRow}>
          <View style={[styles.searchBox, { backgroundColor: colors.muted, borderColor: colors.border }]}>
            <Feather name="search" size={16} color={colors.mutedForeground} />
            <TextInput
              style={[styles.searchInput, { color: colors.foreground }]}
              placeholder={tab === 0 ? "Search games, sports, locations..." : "Search players..."}
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
          <Pressable
            onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setFilterVisible(true); }}
            style={[
              styles.filterBtn,
              { backgroundColor: activeFilterCount > 0 ? "#16A34A" : colors.muted, borderColor: colors.border },
            ]}
          >
            <Feather name="sliders" size={18} color={activeFilterCount > 0 ? "#fff" : colors.mutedForeground} />
            {activeFilterCount > 0 && (
              <View style={styles.filterBadge}>
                <Text style={styles.filterBadgeText}>{activeFilterCount}</Text>
              </View>
            )}
          </Pressable>
        </View>
        <SegmentedControl
          options={["Games", "Players"]}
          selectedIndex={tab}
          onChange={(i) => { setTab(i); setSearch(""); }}
        />
      </View>

      {tab === 0 ? (
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
      ) : (
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
    paddingBottom: 100,
    paddingTop: 4,
  },
});
