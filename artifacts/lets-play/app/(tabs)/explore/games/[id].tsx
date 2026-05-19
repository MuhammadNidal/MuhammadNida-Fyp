import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Avatar } from "@/components/Avatar";
import { SportBadge } from "@/components/SportBadge";
import { MessageBubble } from "@/components/MessageBubble";
import { useAuth } from "@/context/AuthContext";
import { useData } from "@/context/DataContext";
import { useColors } from "@/hooks/useColors";
import { User } from "@/types";

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}

function InfoRow({ icon, text }: { icon: keyof typeof Feather.glyphMap; text: string }) {
  const colors = useColors();
  return (
    <View style={iStyles.infoRow}>
      <Feather name={icon} size={16} color={colors.mutedForeground} />
      <Text style={[iStyles.infoText, { color: colors.mutedForeground }]}>{text}</Text>
    </View>
  );
}

const iStyles = StyleSheet.create({
  infoRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  infoText: { fontSize: 14, fontFamily: "Inter_400Regular", flex: 1 },
});

export default function GameDetailScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { currentUser } = useAuth();
  const { getGameById, joinGame, leaveGame, sendGameMessage, getAllUsers, refreshGames } = useData();

  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [messageText, setMessageText] = useState("");
  const [joining, setJoining] = useState(false);
  const [activeTab, setActiveTab] = useState<"details" | "messages">("details");

  const game = getGameById(id ?? "");

  useEffect(() => {
    getAllUsers().then(setAllUsers);
  }, [getAllUsers]);

  if (!game) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.background }}>
        <Text style={{ color: colors.mutedForeground, fontFamily: "Inter_400Regular" }}>Game not found</Text>
      </View>
    );
  }

  const isParticipant = currentUser ? game.participants.includes(currentUser.id) : false;
  const isOrganizer = currentUser?.id === game.organizerId;
  const isFull = game.participants.length >= game.maxPlayers;
  const host = allUsers.find((u) => u.id === game.organizerId);
  const participants = allUsers.filter((u) => game.participants.includes(u.id));
  const visibleMessages = game.messages.filter((m) => !m.isHidden);

  const handleJoin = async () => {
    if (!currentUser) return;
    setJoining(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    try {
      await joinGame(game.id);
      await refreshGames();
    } finally {
      setJoining(false);
    }
  };

  const handleLeave = async () => {
    if (!currentUser) return;
    if (isOrganizer && game.participants.length > 1) {
      Alert.alert(
        "Transfer Organizer",
        "You are the organizer. You must transfer responsibility before leaving.",
        [{ text: "OK" }]
      );
      return;
    }
    Alert.alert("Leave Game", "Are you sure you want to leave this game?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Leave",
        style: "destructive",
        onPress: async () => {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
          await leaveGame(game.id);
          await refreshGames();
        },
      },
    ]);
  };

  const handleSendMessage = async () => {
    const text = messageText.trim();
    if (!text) return;
    setMessageText("");
    await sendGameMessage(game.id, text);
    await refreshGames();
  };

  const skillLabels: Record<string, string> = {
    beginner: "Beginner",
    intermediate: "Intermediate",
    advanced: "Advanced",
    all: "All Levels",
  };
  const ageLabels: Record<string, string> = {
    young_adult: "Young Adult",
    adult: "Adult",
    senior: "Senior",
    all: "All Ages",
  };
  const groupLabels: Record<string, string> = {
    male: "Male",
    female: "Female",
    all: "All",
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.topBar, { paddingTop: insets.top + 8 }]}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Feather name="arrow-left" size={22} color={colors.foreground} />
        </Pressable>
        <View style={styles.tabPills}>
          {(["details", "messages"] as const).map((t) => (
            <Pressable
              key={t}
              onPress={() => setActiveTab(t)}
              style={[
                styles.tabPill,
                { backgroundColor: activeTab === t ? colors.foreground : colors.muted },
              ]}
            >
              <Text
                style={[
                  styles.tabPillText,
                  { color: activeTab === t ? colors.background : colors.mutedForeground },
                ]}
              >
                {t === "details" ? "Details" : `Messages (${visibleMessages.length})`}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      {activeTab === "details" ? (
        <ScrollView contentContainerStyle={styles.detailContent} showsVerticalScrollIndicator={false}>
          <SportBadge sport={game.sport} type={game.type} />

          <Text style={[styles.gameTitle, { color: colors.foreground }]}>{game.title}</Text>

          {game.isPaid && (
            <View style={[styles.priceBox, { backgroundColor: "#F0FDF4", borderColor: "#BBF7D0" }]}>
              <Feather name="dollar-sign" size={16} color="#16A34A" />
              <Text style={[styles.priceText, { color: "#16A34A" }]}>
                ${game.price} to join
              </Text>
            </View>
          )}

          <View style={[styles.infoCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <InfoRow icon="calendar" text={formatDate(game.date)} />
            <View style={[styles.divider, { backgroundColor: colors.border }]} />
            <InfoRow icon="clock" text={`${game.startTime} – ${game.endTime}`} />
            <View style={[styles.divider, { backgroundColor: colors.border }]} />
            <InfoRow icon="map-pin" text={`${game.locationName}, ${game.city}`} />
          </View>

          <View style={[styles.infoCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <InfoRow icon="bar-chart-2" text={skillLabels[game.skillLevel] ?? game.skillLevel} />
            <View style={[styles.divider, { backgroundColor: colors.border }]} />
            <InfoRow icon="users" text={groupLabels[game.participationGroup]} />
            <View style={[styles.divider, { backgroundColor: colors.border }]} />
            <InfoRow icon="user-check" text={ageLabels[game.ageGroup]} />
          </View>

          {game.description ? (
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.foreground }]}>About</Text>
              <Text style={[styles.description, { color: colors.mutedForeground }]}>
                {game.description}
              </Text>
            </View>
          ) : null}

          {host && (
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Host</Text>
              <Pressable
                onPress={() => router.push(`/(tabs)/explore/players/${host.id}`)}
                style={[styles.hostCard, { backgroundColor: colors.card, borderColor: colors.border }]}
              >
                <Avatar name={host.name} avatarUrl={host.avatarUrl} role={host.role} size={44} />
                <View style={{ flex: 1 }}>
                  <Text style={[styles.hostName, { color: colors.foreground }]}>{host.name}</Text>
                  <Text style={[styles.hostSub, { color: colors.mutedForeground }]}>
                    @{host.username} · {host.role}
                    {host.verificationStatus === "verified" ? " · Verified" : ""}
                  </Text>
                </View>
                <Feather name="chevron-right" size={18} color={colors.mutedForeground} />
              </Pressable>
            </View>
          )}

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
              Players ({game.participants.length}/{game.maxPlayers})
            </Text>
            <View style={styles.participantsList}>
              {participants.map((p) => (
                <View key={p.id} style={styles.participantRow}>
                  <Avatar name={p.name} avatarUrl={p.avatarUrl} role={p.role} size={36} />
                  <Text style={[styles.participantName, { color: colors.foreground }]}>{p.name}</Text>
                  {p.id === game.organizerId && (
                    <View style={[styles.organizerBadge, { backgroundColor: "#16A34A18" }]}>
                      <Text style={{ color: "#16A34A", fontSize: 11, fontFamily: "Inter_600SemiBold" }}>
                        Organizer
                      </Text>
                    </View>
                  )}
                </View>
              ))}
            </View>
          </View>

          <View style={{ height: 100 }} />
        </ScrollView>
      ) : (
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          keyboardVerticalOffset={0}
        >
          {isParticipant ? (
            <>
              <FlatList
                data={[...visibleMessages].reverse()}
                keyExtractor={(m) => m.id}
                inverted
                contentContainerStyle={styles.messagesList}
                showsVerticalScrollIndicator={false}
                renderItem={({ item }) => {
                  const sender = allUsers.find((u) => u.id === item.senderId);
                  return (
                    <MessageBubble
                      content={item.body}
                      isMine={item.senderId === currentUser?.id}
                      senderName={sender?.name}
                      createdAt={item.createdAt}
                    />
                  );
                }}
                ListEmptyComponent={
                  <View style={styles.emptyMessages}>
                    <Text style={[styles.emptyMessagesText, { color: colors.mutedForeground }]}>
                      No messages yet. Start the conversation!
                    </Text>
                  </View>
                }
              />
              <View
                style={[
                  styles.messageInput,
                  {
                    backgroundColor: colors.background,
                    borderTopColor: colors.border,
                    paddingBottom: insets.bottom + 8,
                  },
                ]}
              >
                <TextInput
                  style={[
                    styles.msgTextInput,
                    { backgroundColor: colors.muted, color: colors.foreground, borderColor: colors.border },
                  ]}
                  placeholder="Message the group..."
                  placeholderTextColor={colors.mutedForeground}
                  value={messageText}
                  onChangeText={setMessageText}
                  multiline
                />
                <Pressable
                  onPress={handleSendMessage}
                  disabled={!messageText.trim()}
                  style={[
                    styles.sendBtn,
                    { backgroundColor: messageText.trim() ? "#16A34A" : colors.muted },
                  ]}
                >
                  <Feather name="send" size={18} color={messageText.trim() ? "#fff" : colors.mutedForeground} />
                </Pressable>
              </View>
            </>
          ) : (
            <View style={{ flex: 1, alignItems: "center", justifyContent: "center", padding: 32 }}>
              <Feather name="lock" size={28} color={colors.mutedForeground} />
              <Text style={[styles.lockedText, { color: colors.mutedForeground }]}>
                Join the game to see and send messages
              </Text>
            </View>
          )}
        </KeyboardAvoidingView>
      )}

      <View
        style={[
          styles.bottomBar,
          {
            paddingBottom: insets.bottom + 12,
            backgroundColor: colors.background,
            borderTopColor: colors.border,
          },
        ]}
      >
        {isParticipant ? (
          <Pressable
            onPress={handleLeave}
            style={[styles.actionBtn, { backgroundColor: "#FEF2F2", borderColor: "#FECACA", borderWidth: 1 }]}
          >
            <Text style={[styles.actionBtnText, { color: "#DC2626" }]}>Leave Game</Text>
          </Pressable>
        ) : (
          <Pressable
            onPress={handleJoin}
            disabled={isFull || joining}
            style={({ pressed }) => [
              styles.actionBtn,
              {
                backgroundColor: isFull ? colors.muted : "#16A34A",
                opacity: pressed || joining ? 0.85 : 1,
              },
            ]}
          >
            {joining ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={[styles.actionBtnText, { color: isFull ? colors.mutedForeground : "#fff" }]}>
                {isFull ? "Game Full" : game.isPaid ? `Join · $${game.price}` : "Join Game"}
              </Text>
            )}
          </Pressable>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingBottom: 12,
    gap: 12,
  },
  backBtn: {
    width: 38,
    height: 38,
    alignItems: "center",
    justifyContent: "center",
  },
  tabPills: {
    flexDirection: "row",
    gap: 6,
  },
  tabPill: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },
  tabPillText: {
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
  },
  detailContent: {
    paddingHorizontal: 20,
    paddingTop: 8,
    gap: 16,
  },
  gameTitle: {
    fontSize: 24,
    fontFamily: "Inter_700Bold",
    lineHeight: 30,
  },
  priceBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
  },
  priceText: {
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
  },
  infoCard: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: "hidden",
  },
  divider: { height: StyleSheet.hairlineWidth, marginLeft: 42 },
  section: { gap: 12 },
  sectionTitle: {
    fontSize: 17,
    fontFamily: "Inter_600SemiBold",
  },
  description: {
    fontSize: 15,
    fontFamily: "Inter_400Regular",
    lineHeight: 22,
  },
  hostCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
  },
  hostName: {
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
  },
  hostSub: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    marginTop: 2,
  },
  participantsList: { gap: 10 },
  participantRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  participantName: {
    fontSize: 14,
    fontFamily: "Inter_500Medium",
    flex: 1,
  },
  organizerBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  messagesList: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    flexGrow: 1,
    justifyContent: "flex-end",
  },
  emptyMessages: {
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
  },
  emptyMessagesText: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
  },
  messageInput: {
    flexDirection: "row",
    alignItems: "flex-end",
    paddingHorizontal: 16,
    paddingTop: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
    gap: 10,
  },
  msgTextInput: {
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
  lockedText: {
    fontSize: 15,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
    marginTop: 12,
  },
  bottomBar: {
    paddingHorizontal: 20,
    paddingTop: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  actionBtn: {
    height: 54,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  actionBtnText: {
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
  },
});
