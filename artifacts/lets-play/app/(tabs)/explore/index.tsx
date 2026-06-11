import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router, useLocalSearchParams } from "expo-router";
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
import { SPORTS } from "@/constants/sports";

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
  const { filter, tab: initialTab } = useLocalSearchParams<{ filter?: string, tab?: string }>();

  const [tab, setTab] = useState(initialTab ? parseInt(initialTab) : 0);
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS);
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  const [filterVisible, setFilterVisible] = useState(false);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);

  useEffect(() => {
    setUsersLoading(true);
    getAllUsers()
      .then((u) => setAllUsers(u.filter((user) => user.id !== currentUser?.id)))
      .finally(() => setUsersLoading(false));
  }, [getAllUsers, currentUser?.id]);

  useEffect(() => {
    if (filter) {
      setCategoryFilter(filter);
      // If it's a sport, set the sport filter
      if (SPORTS.some(s => s.id === filter)) {
        setFilters(prev => ({ ...prev, sport: filter }));
      }
    } else {
       setCategoryFilter(null);
       setFilters(DEFAULT_FILTERS);
    }
  }, [filter]);

  useEffect(() => {
    if (initialTab !== undefined) {
       setTab(parseInt(initialTab));
    }
  }, [initialTab]);

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

      // Player category filter logic
      if (categoryFilter && tab === 1) {
        if (categoryFilter === 'coaches' && u.role !== 'coach') return false;
        if (categoryFilter === 'pros' && u.role !== 'pro') return false;
        if (categoryFilter === 'verified' && u.verificationStatus !== 'verified') return false;
        if (categoryFilter === 'legends' && u.gamesPlayed < 10) return false;
        if (categoryFilter === 'multisport' && u.sports.length < 3) return false;
        if (categoryFilter === 'rising' && u.rating < 4.5) return false;
        if (categoryFilter === 'active' && u.gamesPlayed < 5) return false;
        if (categoryFilter === 'consistency' && u.gamesPlayed < 8) return false;
        if (categoryFilter === 'friendly' && u.role !== 'player') return false;
      }

      return true;
    });
  }, [allUsers, search, filters, categoryFilter, tab]);

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
      <View style={[styles.header, { paddingTop: 12 }]}>
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
                  ? "Search games, sports..."
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
            setCategoryFilter(null);
            setFilters(DEFAULT_FILTERS);
          }}
        />
      </View>

      {(categoryFilter || activeFilterCount > 0) && !search && (
         <View style={styles.activeFilters}>
            <View style={[styles.filterChip, { backgroundColor: colors.primary + '15', borderColor: colors.primary }]}>
               <Text style={[styles.filterChipText, { color: colors.primary }]}>
                  {categoryFilter ? (SPORTS.find(s => s.id === categoryFilter)?.name || categoryFilter.charAt(0).toUpperCase() + categoryFilter.slice(1)) : `${activeFilterCount} Filters`}
               </Text>
               <Pressable onPress={() => { setCategoryFilter(null); setFilters(DEFAULT_FILTERS); router.setParams({ filter: undefined }); }}>
                  <Feather name="x" size={14} color={colors.primary} />
               </Pressable>
            </View>
         </View>
      )}

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#16A34A" />
          <Text style={[styles.loadingText, { color: colors.mutedForeground }]}>
            Loading...
          </Text>
        </View>
      ) : (
        <FlatList
          data={
            tab === 0 
              ? filteredGames 
              : tab === 1 
                ? filteredPlayers 
                : rosterUsers.filter(u => search ? u.name.toLowerCase().includes(search.toLowerCase()) || u.username.toLowerCase().includes(search.toLowerCase()) : true)
          }
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            tab !== 2 && !search && activeFilterCount === 0 && !categoryFilter ? (
              <View style={styles.sectionHeader}>
                <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
                  {tab === 0 ? "Popular Games" : "Featured Players"}
                </Text>
                <Pressable onPress={() => router.push({ pathname: "/(tabs)/explore/categories", params: { type: tab === 0 ? 'games' : 'players' } })}>
                  <Text style={[styles.viewAll, { color: colors.primary }]}>View All</Text>
                </Pressable>
              </View>
            ) : null
          }
          renderItem={({ item }) => {
            if (tab === 0) return <GameCard game={item as any} />;
            if (tab === 1) return (
              <PlayerCard
                user={item as User}
                onFollow={() => handleFollow(item.id)}
                isFollowing={currentUser?.followingIds.includes(item.id)}
              />
            );
            return <RosterCard user={item as User} colors={colors} onUnfollow={() => handleFollow(item.id)} />;
          }}
          ListEmptyComponent={
            <EmptyState
              icon={tab === 0 ? "calendar" : "users"}
              title={tab === 0 ? "No games found" : tab === 1 ? "No players found" : "Your roster is empty"}
              subtitle={tab === 2 ? "Follow players to add them to your roster." : "Try adjusting your search or filters"}
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
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Inter_700Bold',
  },
  viewAll: {
    fontSize: 14,
    fontFamily: 'Inter_600SemiBold',
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
  activeFilters: {
     paddingHorizontal: 20,
     paddingBottom: 12,
     flexDirection: 'row',
  },
  filterChip: {
     flexDirection: 'row',
     alignItems: 'center',
     gap: 8,
     paddingHorizontal: 12,
     paddingVertical: 6,
     borderRadius: 20,
     borderWidth: 1,
  },
  filterChipText: {
     fontSize: 13,
     fontFamily: 'Inter_600SemiBold',
  }
});