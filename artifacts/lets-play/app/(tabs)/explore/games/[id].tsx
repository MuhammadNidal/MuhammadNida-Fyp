import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Share,
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
      <View style={[iStyles.iconWrap, { backgroundColor: colors.muted }]}>
        <Feather name={icon} size={15} color={colors.mutedForeground} />
      </View>
      <Text style={[iStyles.infoText, { color: colors.foreground }]}>{text}</Text>
    </View>
  );
}

const iStyles = StyleSheet.create({
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 13,
  },
  iconWrap: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  infoText: { fontSize: 14, fontFamily: "Inter_400Regular", flex: 1 },
});

export default function GameDetailScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { currentUser } = useAuth();
  const { getGameById, joinGame, leaveGame, sendGameMessage, getAllUsers, refreshGames } =
    useData();

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
      <View
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: colors.background,
        }}
      >
        <Text style={{ color: colors.mutedForeground, fontFamily: "Inter_400Regular" }}>
          Game not found
        </Text>
      </View>
    );
  }

  const isParticipant = currentUser ? game.participants.includes(currentUser.id) : false;
  const isOrganizer = currentUser?.id === game.organizerId;
  const isFull = game.participants.length >= game.maxPlayers;
  const host = allUsers.find((u) => u.id === game.organizerId);
  const participants = allUsers.filter((u) => game.participants.includes(u.id));
  const visibleMessages = game.messages.filter((m) => !m.isHidden);

  const handleShare = async () => {
    try {
      await Share.share({
        title: game.title,
        message: `Join me for "${game.title}" — ${game.sport} at ${game.locationName}, ${game.city} on ${formatDate(game.date)}. Find it on Play Connect!`,
      });
    } catch {
      // share dismissed
    }
  };

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
    male: "Male only",
    female: "Female only",
    all: "All genders",
  };

  const spotsLeft = game.maxPlayers - game.participants.length;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.topBar, { paddingTop: 8 }]}>
        <Pressable onPress={() => router.back()} style={styles.iconBtn}>
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
        <Pressable onPress={handleShare} style={styles.iconBtn}>
          <Feather name="share-2" size={20} color={colors.foreground} />
        </Pressable>
      </View>

      {activeTab === "details" ? (
        <ScrollView
          contentContainerStyle={styles.detailContent}
          showsVerticalScrollIndicator={false}
        >
          {game.imageUrl && (
            <View style={styles.heroContainer}>
              <Image source={{ uri: game.imageUrl }} style={styles.heroImage} />
              <View style={styles.heroOverlay} />
            </View>
          )}

          <View style={styles.contentPadding}>
            <View style={styles.badgeRow}>
              <SportBadge sport={game.sport} type={game.type} />
              {game.type === "lesson" && (
                <View style={[styles.typePill, { backgroundColor: "#8B5CF618" }]}>
                  <Feather name="award" size={12} color="#8B5CF6" />
                  <Text style={[styles.typePillText, { color: "#8B5CF6" }]}>Lesson</Text>
                </View>
              )}
              {game.type === "pro_game" && (
                <View style={[styles.typePill, { backgroundColor: "#F9731618" }]}>
                  <Feather name="star" size={12} color="#F97316" />
                  <Text style={[styles.typePillText, { color: "#F97316" }]}>Pro Game</Text>
                </View>
              )}
            </View>

            <Text style={[styles.gameTitle, { color: colors.foreground }]}>{game.title}</Text>

            <View style={styles.spotsRow}>
              <View style={[styles.spotsPill, { backgroundColor: spotsLeft > 0 ? "#F0FDF4" : "#FEF2F2" }]}>
                <Feather name="users" size={13} color={spotsLeft > 0 ? "#16A34A" : "#DC2626"} />
                <Text style={[styles.spotsText, { color: spotsLeft > 0 ? "#16A34A" : "#DC2626" }]}>
                  {spotsLeft > 0 ? `${spotsLeft} spot${spotsLeft !== 1 ? "s" : ""} left` : "Full"}
                </Text>
              </View>
              {game.isPaid && (
                <View style={[styles.spotsPill, { backgroundColor: "#F0FDF4" }]}>
                  <Feather name="dollar-sign" size={13} color="#16A34A" />
                  <Text style={[styles.spotsText, { color: "#16A34A" }]}>${game.price} to join</Text>
                </View>
              )}
            </View>

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
                  <Avatar
                    name={host.name}
                    avatarUrl={host.avatarUrl}
                    role={host.role}
                    size={44}
                  />
                  <View style={{ flex: 1 }}>
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                      <Text style={[styles.hostName, { color: colors.foreground }]}>{host.name}</Text>
                      {host.verificationStatus === "verified" && (
                        <Feather name="check-circle" size={13} color="#16A34A" />
                      )}
                    </View>
                    <Text style={[styles.hostSub, { color: colors.mutedForeground }]}>
                      @{host.username} ·{" "}
                      {host.role === "coach" ? "Coach" : host.role === "pro" ? "Pro" : "Player"}
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
              <View
                style={[styles.participantsCard, { backgroundColor: colors.card, borderColor: colors.border }]}
              >
                {participants.map((p, idx) => (
                  <View key={p.id}>
                    <Pressable
                      onPress={() => router.push(`/(tabs)/explore/players/${p.id}`)}
                      style={styles.participantRow}
                    >
                      <Avatar name={p.name} avatarUrl={p.avatarUrl} role={p.role} size={40} />
                      <View style={{ flex: 1 }}>
                        <Text style={[styles.participantName, { color: colors.foreground }]}>{p.name}</Text>
                        <Text style={{ color: colors.mutedForeground, fontSize: 12 }}>@{p.username}</Text>
                      </View>
                      {p.id === game.organizerId && (
                        <View style={[styles.organizerBadge, { backgroundColor: "#16A34A18" }]}>
                          <Text style={{ color: "#16A34A", fontSize: 11, fontFamily: "Inter_600SemiBold" }}>
                            Organizer
                          </Text>
                        </View>
                      )}
                      <Feather name="chevron-right" size={14} color={colors.mutedForeground} />
                    </Pressable>
                    {idx < participants.length - 1 && (
                      <View style={[styles.divider, { backgroundColor: colors.border, marginLeft: 66 }]} />
                    )}
                  </View>
                ))}
              </View>
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
                    <Feather name="message-circle" size={32} color={colors.border} />
                    <Text style={[styles.emptyMessagesText, { color: colors.mutedForeground }]}>
                      No messages yet. Be the first to say something!
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
                    {
                      backgroundColor: colors.muted,
                      color: colors.foreground,
                      borderColor: colors.border,
                    },
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
                  <Feather
                    name="send"
                    size={18}
                    color={messageText.trim() ? "#fff" : colors.mutedForeground}
                  />
                </Pressable>
              </View>
            </>
          ) : (
            <View style={{ flex: 1, alignItems: "center", justifyContent: "center", padding: 32 }}>
              <View style={[styles.lockCircle, { backgroundColor: colors.muted }]}>
                <Feather name="lock" size={28} color={colors.mutedForeground} />
              </View>
              <Text style={[styles.lockedTitle, { color: colors.foreground }]}>
                Join to see messages
              </Text>
              <Text style={[styles.lockedText, { color: colors.mutedForeground }]}>
                Game messages are only visible to participants. Join the game to read and post messages.
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
            style={[
              styles.actionBtn,
              { backgroundColor: "#FEF2F2", borderColor: "#FECACA", borderWidth: 1 },
            ]}
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
              <Text
                style={[
                  styles.actionBtnText,
                  { color: isFull ? colors.mutedForeground : "#fff" },
                ]}
              >
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
    paddingHorizontal: 12,
    paddingBottom: 12,
    gap: 8,
    zIndex: 10,
  },
  iconBtn: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.8)",
    borderRadius: 20,
  },
  tabPills: {
    flexDirection: "row",
    gap: 6,
    flex: 1,
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
    paddingTop: 0,
  },
  heroContainer: {
    height: 250,
    width: "100%",
    position: "relative",
  },
  heroImage: {
    width: "100%",
    height: "100%",
  },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.1)",
  },
  contentPadding: {
    paddingHorizontal: 20,
    paddingTop: 20,
    gap: 16,
  },
  badgeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flexWrap: "wrap",
  },
  typePill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },
  typePillText: {
    fontSize: 12,
    fontFamily: "Inter_600SemiBold",
  },
  gameTitle: {
    fontSize: 24,
    fontFamily: "Inter_700Bold",
    lineHeight: 30,
  },
  spotsRow: {
    flexDirection: "row",
    gap: 8,
    flexWrap: "wrap",
  },
  spotsPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
  },
  spotsText: {
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
  },
  infoCard: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: "hidden",
  },
  divider: { height: StyleSheet.hairlineWidth },
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
  participantsCard: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: "hidden",
  },
  participantRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
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
    padding: 40,
    gap: 12,
  },
  emptyMessagesText: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
    lineHeight: 20,
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
  lockCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  lockedTitle: {
    fontSize: 18,
    fontFamily: "Inter_600SemiBold",
    marginBottom: 8,
  },
  lockedText: {
    fontSize: 15,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
    lineHeight: 22,
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
