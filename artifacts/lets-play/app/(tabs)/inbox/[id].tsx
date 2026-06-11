import { Feather } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Avatar } from "@/components/Avatar";
import { MessageBubble } from "@/components/MessageBubble";
import { useAuth } from "@/context/AuthContext";
import { useData } from "@/context/DataContext";
import { useColors } from "@/hooks/useColors";
import { User } from "@/types";

export default function ChatScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { currentUser } = useAuth();
  const { conversations, getAllUsers, sendDirectMessage, refreshConversations } = useData();
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [messageText, setMessageText] = useState("");

  useEffect(() => {
    getAllUsers().then(setAllUsers);
  }, [getAllUsers]);

  const conversation = conversations.find((c) => c.id === id);

  if (!conversation || !currentUser) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background, alignItems: "center", justifyContent: "center" }}>
        <Text style={{ color: colors.mutedForeground, fontFamily: "Inter_400Regular" }}>Conversation not found</Text>
      </View>
    );
  }

  const otherId = conversation.participantIds.find((pid) => pid !== currentUser.id);
  const otherUser = allUsers.find((u) => u.id === otherId);
  const messages = [...conversation.messages].reverse();

  const displayName = conversation.type === "group" 
    ? (conversation.title || "Group Chat") 
    : (otherUser?.name || "Unknown Player");

  const handleSend = async () => {
    const text = messageText.trim();
    if (!text) return;
    setMessageText("");
    await sendDirectMessage(conversation.id, text);
    await refreshConversations();
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: 8, borderBottomColor: colors.border }]}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Feather name="arrow-left" size={22} color={colors.foreground} />
        </Pressable>
        <Pressable
          onPress={() => {
            if (conversation.type === "direct" && otherUser) {
              router.push(`/(tabs)/explore/players/${otherUser.id}`);
            }
          }}
          style={styles.headerUser}
        >
          <Avatar 
            name={displayName} 
            avatarUrl={conversation.type === "direct" ? otherUser?.avatarUrl : undefined} 
            role={conversation.type === "direct" ? otherUser?.role : undefined} 
            size={38} 
          />
          <View>
            <Text style={[styles.headerName, { color: colors.foreground }]}>{displayName}</Text>
            {conversation.type === "direct" && otherUser && (
              <Text style={[styles.headerSub, { color: colors.mutedForeground }]}>@{otherUser.username}</Text>
            )}
            {conversation.type === "group" && (
              <Text style={[styles.headerSub, { color: colors.mutedForeground }]}>
                {conversation.participantIds.length} members
              </Text>
            )}
          </View>
        </Pressable>
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={0}
      >
        <FlatList
          data={messages}
          keyExtractor={(m) => m.id}
          inverted
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.messagesList}
          renderItem={({ item }) => {
            const sender = allUsers.find(u => u.id === item.senderId);
            const showSenderInfo = conversation.type === "group" && item.senderId !== currentUser.id;
            
            return (
              <MessageBubble
                content={item.content}
                isMine={item.senderId === currentUser.id}
                createdAt={item.createdAt}
                senderName={showSenderInfo ? sender?.name : undefined}
                // We'll pass a new prop 'showAvatar' to MessageBubble if we want to show it there, 
                // but the prompt says "direct message there is not need for the image show ni th chat"
                // which implies hiding it in the bubble list.
              />
            );
          }}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
                Start your conversation
              </Text>
            </View>
          }
        />

        <View
          style={[
            styles.inputBar,
            {
              backgroundColor: colors.background,
              borderTopColor: colors.border,
              paddingBottom: insets.bottom + 8,
            },
          ]}
        >
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: colors.muted,
                color: colors.foreground,
                borderColor: colors.border,
              },
            ]}
            placeholder="Message..."
            placeholderTextColor={colors.mutedForeground}
            value={messageText}
            onChangeText={setMessageText}
            multiline
          />
          <Pressable
            onPress={handleSend}
            disabled={!messageText.trim()}
            style={[
              styles.sendBtn,
              { backgroundColor: messageText.trim() ? "#16A34A" : colors.muted },
            ]}
          >
            <Feather name="send" size={18} color={messageText.trim() ? "#fff" : colors.mutedForeground} />
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: 12,
  },
  backBtn: { width: 38, height: 38, alignItems: "center", justifyContent: "center" },
  headerUser: { flexDirection: "row", alignItems: "center", gap: 10 },
  headerName: { fontSize: 15, fontFamily: "Inter_600SemiBold" },
  headerSub: { fontSize: 12, fontFamily: "Inter_400Regular" },
  messagesList: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    flexGrow: 1,
    justifyContent: "flex-end",
  },
  empty: { alignItems: "center", padding: 32 },
  emptyText: { fontSize: 14, fontFamily: "Inter_400Regular" },
  inputBar: {
    flexDirection: "row",
    alignItems: "flex-end",
    paddingHorizontal: 16,
    paddingTop: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
    gap: 10,
  },
  input: {
    flex: 1,
    minHeight: 42,
    maxHeight: 100,
    borderRadius: 22,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 15,
    fontFamily: "Inter_400Regular",
  },
  sendBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
  },
});
