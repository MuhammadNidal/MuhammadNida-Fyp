import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { useColors } from "@/hooks/useColors";

interface MessageBubbleProps {
  content: string;
  isMine: boolean;
  senderName?: string;
  createdAt: string;
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
}

export function MessageBubble({ content, isMine, senderName, createdAt }: MessageBubbleProps) {
  const colors = useColors();

  return (
    <View style={[styles.wrapper, isMine ? styles.wrapperMine : styles.wrapperTheirs]}>
      {!isMine && senderName && (
        <Text style={[styles.sender, { color: colors.mutedForeground }]}>{senderName}</Text>
      )}
      <View
        style={[
          styles.bubble,
          isMine
            ? { backgroundColor: colors.primary }
            : { backgroundColor: colors.muted, borderColor: colors.border, borderWidth: 1 },
        ]}
      >
        <Text style={[styles.text, { color: isMine ? colors.primaryForeground : colors.foreground }]}> 
          {content}
        </Text>
      </View>
      <Text style={[styles.time, { color: colors.mutedForeground }]}>{formatTime(createdAt)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginVertical: 3,
    maxWidth: "78%",
    gap: 3,
  },
  wrapperMine: {
    alignSelf: "flex-end",
    alignItems: "flex-end",
  },
  wrapperTheirs: {
    alignSelf: "flex-start",
    alignItems: "flex-start",
  },
  sender: {
    fontSize: 11,
    fontFamily: "Inter_500Medium",
    marginLeft: 4,
  },
  bubble: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 18,
  },
  text: {
    fontSize: 15,
    fontFamily: "Inter_400Regular",
    lineHeight: 20,
  },
  time: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
    marginHorizontal: 4,
  },
});
