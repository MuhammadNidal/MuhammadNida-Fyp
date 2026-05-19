import React, { useEffect, useState } from "react";
import { FlatList, Platform, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import { ConversationItem } from "@/components/ConversationItem";
import { EmptyState } from "@/components/EmptyState";
import { useAuth } from "@/context/AuthContext";
import { useData } from "@/context/DataContext";
import { useColors } from "@/hooks/useColors";
import { User } from "@/types";

export default function InboxScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { currentUser } = useAuth();
  const { conversations, getAllUsers } = useData();
  const [allUsers, setAllUsers] = useState<User[]>([]);

  useEffect(() => {
    getAllUsers().then(setAllUsers);
  }, [getAllUsers]);

  if (!currentUser) return null;

  const userConvos = conversations
    .filter((c) => c.participantIds.includes(currentUser.id))
    .sort((a, b) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime());

  const topPad = insets.top + (Platform.OS === "web" ? 67 : 0);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: topPad + 16 }]}>
        <Text style={[styles.title, { color: colors.foreground }]}>Messages</Text>
      </View>

      <FlatList
        data={userConvos}
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
            title="No messages yet"
            subtitle="Visit a player's profile and tap Message to start a conversation"
          />
        }
        contentContainerStyle={{ paddingBottom: 100, flexGrow: 1 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  title: { fontSize: 28, fontFamily: "Inter_700Bold" },
});
