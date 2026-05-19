import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import { FlatList, Platform, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { GameCard } from "@/components/GameCard";
import { EmptyState } from "@/components/EmptyState";
import { SegmentedControl } from "@/components/SegmentedControl";
import { useAuth } from "@/context/AuthContext";
import { useData } from "@/context/DataContext";
import { useColors } from "@/hooks/useColors";

export default function MatchesScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { currentUser } = useAuth();
  const { games } = useData();
  const [tab, setTab] = useState(0);

  if (!currentUser) return null;

  const now = new Date();

  const upcoming = games.filter(
    (g) =>
      g.participants.includes(currentUser.id) &&
      g.createdBy !== currentUser.id &&
      g.status === "active" &&
      new Date(g.date) >= now
  );

  const past = games.filter(
    (g) =>
      g.participants.includes(currentUser.id) &&
      new Date(g.date) < now
  );

  const created = games.filter((g) => g.createdBy === currentUser.id);

  const lists = [upcoming, past, created];
  const emptyTitles = ["No upcoming games", "No past games", "No games created"];
  const emptySubtitles = [
    "Explore games and join one to see it here",
    "Your past games will appear here",
    "Create your first game from the Create tab",
  ];
  const emptyIcons: Array<"calendar" | "clock" | "plus-circle"> = ["calendar", "clock", "plus-circle"];

  const topPad = insets.top + (Platform.OS === "web" ? 67 : 0);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: topPad + 16 }]}>
        <Text style={[styles.title, { color: colors.foreground }]}>Matches</Text>
        <SegmentedControl
          options={[`Upcoming (${upcoming.length})`, `Past`, `Created (${created.length})`]}
          selectedIndex={tab}
          onChange={setTab}
        />
      </View>

      <FlatList
        data={lists[tab]}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => <GameCard game={item} />}
        ListEmptyComponent={
          <EmptyState
            icon={emptyIcons[tab]}
            title={emptyTitles[tab]}
            subtitle={emptySubtitles[tab]}
          />
        }
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
  title: { fontSize: 28, fontFamily: "Inter_700Bold" },
  list: {
    paddingHorizontal: 20,
    paddingBottom: 100,
    paddingTop: 4,
  },
});
