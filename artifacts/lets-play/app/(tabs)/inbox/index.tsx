import React, { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import { ConversationItem } from "@/components/ConversationItem";
import { EmptyState } from "@/components/EmptyState";
import { SegmentedControl } from "@/components/SegmentedControl";
import { useAuth } from "@/context/AuthContext";
import { useData } from "@/context/DataContext";
import { useColors } from "@/hooks/useColors";
import { User, Conversation } from "@/types";

type TopTab = "messages" | "requests";
type MessageFilter = "all" | "direct" | "group";

export default function InboxScreen() {
  const colors = useColors();
  const { currentUser } = useAuth();
  const { conversations, getAllUsers, isLoading } = useData();
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [topTab, setTopTab] = useState<TopTab>("messages");
  const [msgFilter, setMsgFilter] = useState<number>(0); // 0: All, 1: Direct, 2: Group

  useEffect(() => {
    getAllUsers().then(setAllUsers);
  }, [getAllUsers]);

  const filteredConvos = useMemo(() => {
    if (!currentUser) return [];
    let base = conversations.filter((c) => c.participantIds.includes(currentUser.id));
    
    if (msgFilter === 1) base = base.filter(c => c.type === "direct");
    if (msgFilter === 2) base = base.filter(c => c.type === "group");

    return base.sort(
      (a, b) =>
        new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime()
    );
  }, [conversations, currentUser, msgFilter]);

  if (!currentUser) return null;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <View style={styles.topRow}>
          <Text style={[styles.title, { color: colors.foreground }]}>Inbox</Text>
        </View>
        
        <View style={styles.topTabs}>
          {(["messages", "requests"] as const).map((tab) => (
            <Pressable
              key={tab}
              onPress={() => setTopTab(tab)}
              style={[
                styles.topTab,
                topTab === tab && { borderBottomColor: colors.primary }
              ]}
            >
              <Text style={[
                styles.topTabText, 
                { color: topTab === tab ? colors.foreground : colors.mutedForeground }
              ]}>
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </Text>
            </Pressable>
          ))}
        </View>

        {topTab === "messages" && (
          <View style={styles.filterRow}>
            <SegmentedControl
              options={["All", "Direct", "Group"]}
              selectedIndex={msgFilter}
              onChange={setMsgFilter}
            />
          </View>
        )}
      </View>

      {isLoading ? (
        <View style={styles.loading}>
          <ActivityIndicator size="large" color="#16A34A" />
          <Text style={[styles.loadingText, { color: colors.mutedForeground }]}>Loading...</Text>
        </View>
      ) : topTab === "messages" ? (
        <FlatList
          data={filteredConvos}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => {
            const otherId = item.participantIds.find((id) => id !== currentUser.id);
            const otherUser = allUsers.find((u) => u.id === otherId);
            return (
              <ConversationItem
                conversation={item}
                otherUser={otherUser}
                currentUserId={currentUser.id}
                onPress={() => router.push(`/(tabs)/inbox/${item.id}`)}
              />
            );
          }}
          ListEmptyComponent={
            <EmptyState
              icon="message-circle"
              title="No messages found"
              subtitle={msgFilter === 0 ? "Start a conversation to see it here" : "No chats matching this filter"}
            />
          }
          contentContainerStyle={{ paddingBottom: 110, flexGrow: 1 }}
        />
      ) : (
        <View style={styles.requestsContainer}>
          <EmptyState
            icon="user-plus"
            title="No requests"
            subtitle="Game join requests and invitations will appear here"
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingHorizontal: 20,
    paddingTop: 12,
    gap: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: { fontSize: 28, fontFamily: "Inter_700Bold" },
  topTabs: {
    flexDirection: 'row',
    gap: 24,
  },
  topTab: {
    paddingBottom: 8,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  topTabText: {
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
  },
  filterRow: {
    paddingBottom: 12,
  },
  loading: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
  },
  requestsContainer: {
    flex: 1,
    padding: 20,
  }
});
