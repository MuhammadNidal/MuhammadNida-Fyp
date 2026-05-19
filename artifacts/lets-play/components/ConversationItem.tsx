import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Avatar } from "./Avatar";
import { useColors } from "@/hooks/useColors";
import { Conversation, User } from "@/types";

interface ConversationItemProps {
  conversation: Conversation;
  otherUser: User | undefined;
  currentUserId: string;
  onPress: () => void;
}

function formatTime(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffHours = diffMs / 3600000;
  if (diffHours < 1) return `${Math.floor(diffMs / 60000)}m ago`;
  if (diffHours < 24) return `${Math.floor(diffHours)}h ago`;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function ConversationItem({
  conversation,
  otherUser,
  currentUserId,
  onPress,
}: ConversationItemProps) {
  const colors = useColors();
  const lastMsg = conversation.messages[conversation.messages.length - 1];

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.container,
        { borderBottomColor: colors.border, opacity: pressed ? 0.85 : 1 },
      ]}
    >
      <Avatar
        name={otherUser?.name ?? "Unknown"}
        avatarUrl={otherUser?.avatarUrl}
        role={otherUser?.role}
        size={50}
      />
      <View style={styles.content}>
        <View style={styles.topRow}>
          <Text style={[styles.name, { color: colors.foreground }]}>
            {otherUser?.name ?? "Unknown"}
          </Text>
          {lastMsg && (
            <Text style={[styles.time, { color: colors.mutedForeground }]}>
              {formatTime(lastMsg.createdAt)}
            </Text>
          )}
        </View>
        {lastMsg ? (
          <Text style={[styles.preview, { color: colors.mutedForeground }]} numberOfLines={1}>
            {lastMsg.senderId === currentUserId ? "You: " : ""}
            {lastMsg.content}
          </Text>
        ) : (
          <Text style={[styles.preview, { color: colors.mutedForeground }]}>
            Start a conversation
          </Text>
        )}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  content: {
    flex: 1,
    gap: 4,
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  name: {
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
  },
  time: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
  },
  preview: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
  },
});
