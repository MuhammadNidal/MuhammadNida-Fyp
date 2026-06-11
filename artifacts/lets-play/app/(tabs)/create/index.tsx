import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "@/context/AuthContext";
import { useData } from "@/context/DataContext";
import { useColors } from "@/hooks/useColors";
import { SPORTS, SKILL_LEVELS, AGE_GROUPS, PARTICIPATION_GROUPS } from "@/constants/sports";

// Success Modal Component
function SuccessOverlay({ 
  visible, 
  onClose, 
  gameData 
}: { 
  visible: boolean; 
  onClose: () => void; 
  gameData: any 
}) {
  const colors = useColors();
  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.modalContainer}>
        <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
          <View style={styles.successIcon}>
             <Feather name="check-circle" size={60} color="#16A34A" />
          </View>
          <Text style={[styles.successTitle, { color: colors.foreground }]}>Congratulations!</Text>
          <Text style={[styles.successSubtitle, { color: colors.mutedForeground }]}>
            Your event has been published successfully.
          </Text>

          <View style={[styles.summaryCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
             <Text style={[styles.summaryTitle, { color: colors.foreground }]}>{gameData?.title}</Text>
             <View style={styles.summaryRow}>
                <Feather name="calendar" size={14} color={colors.mutedForeground} />
                <Text style={[styles.summaryText, { color: colors.mutedForeground }]}>{gameData?.date || 'Today'}</Text>
             </View>
             <View style={styles.summaryRow}>
                <Feather name="map-pin" size={14} color={colors.mutedForeground} />
                <Text style={[styles.summaryText, { color: colors.mutedForeground }]}>{gameData?.city}</Text>
             </View>
          </View>

          <View style={styles.modalActions}>
             <Pressable 
              onPress={() => { onClose(); router.push('/(tabs)/explore/players'); }}
              style={[styles.modalBtn, { backgroundColor: '#16A34A' }]}
             >
                <Feather name="user-plus" size={18} color="#fff" />
                <Text style={styles.modalBtnText}>Invite Players</Text>
             </Pressable>
             <Pressable 
              onPress={onClose}
              style={[styles.modalBtn, { backgroundColor: colors.muted }]}
             >
                <Text style={[styles.modalBtnText, { color: colors.foreground }]}>View My Matches</Text>
             </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

function SelectRow<T extends string>({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: { id: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
}) {
  const colors = useColors();
  return (
    <View style={styles.field}>
      <Text style={[styles.label, { color: colors.foreground }]}>{label}</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.chipRow}>
          {options.map((opt) => (
            <Pressable
              key={opt.id}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                onChange(opt.id);
              }}
              style={[
                styles.chip,
                {
                  backgroundColor: value === opt.id ? "#16A34A18" : colors.muted,
                  borderColor: value === opt.id ? "#16A34A" : "transparent",
                  borderWidth: 1.5,
                },
              ]}
            >
              <Text
                style={[
                  styles.chipText,
                  { color: value === opt.id ? "#16A34A" : colors.mutedForeground },
                ]}
              >
                {opt.label}
              </Text>
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

function FieldInput({
  label,
  value,
  onChange,
  placeholder,
  multiline,
  keyboardType,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  multiline?: boolean;
  keyboardType?: "default" | "decimal-pad" | "number-pad";
}) {
  const colors = useColors();
  return (
    <View style={styles.field}>
      <Text style={[styles.label, { color: colors.foreground }]}>{label}</Text>
      <TextInput
        style={[
          styles.input,
          {
            color: colors.foreground,
            borderColor: colors.border,
            backgroundColor: colors.muted,
            height: multiline ? 90 : 48,
            textAlignVertical: multiline ? "top" : "center",
            paddingTop: multiline ? 12 : 0,
          },
        ]}
        placeholder={placeholder}
        placeholderTextColor={colors.mutedForeground}
        value={value}
        onChangeText={onChange}
        multiline={multiline}
        keyboardType={keyboardType ?? "default"}
      />
    </View>
  );
}

type GameType = "game" | "lesson" | "pro_game";

export default function CreateScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { currentUser } = useAuth();
  const { createGame } = useData();

  const [gameType, setGameType] = useState<GameType>("game");
  const [sport, setSport] = useState("basketball");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [locationName, setLocationName] = useState("");
  const [city, setCity] = useState("");
  const [maxPlayers, setMaxPlayers] = useState("10");
  const [skillLevel, setSkillLevel] =
    useState<"beginner" | "intermediate" | "advanced" | "all">("all");
  const [ageGroup, setAgeGroup] =
    useState<"young_adult" | "adult" | "senior" | "all">("all");
  const [participationGroup, setParticipationGroup] =
    useState<"male" | "female" | "all">("all");
  const [isPaid, setIsPaid] = useState(false);
  const [price, setPrice] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);

  const canCreateLesson = currentUser?.role === "coach" || currentUser?.role === "pro";
  const canCreateProGame = currentUser?.role === "pro";

  const availableTypes: { id: GameType; label: string; desc: string; icon: keyof typeof Feather.glyphMap }[] = [
    { id: "game", label: "Game", desc: "Standard pickup game open to all players", icon: "activity" },
    ...(canCreateLesson
      ? [{ id: "lesson" as GameType, label: "Lesson", desc: "Structured lesson you host as a coach or pro", icon: "award" as const }]
      : []),
    ...(canCreateProGame
      ? [{ id: "pro_game" as GameType, label: "Pro Game", desc: "Play with a pro — exclusive experience", icon: "star" as const }]
      : []),
  ];

  const handleCreate = async () => {
    if (!currentUser) return;
    if (!title.trim()) { setError("Title is required"); return; }
    if (!locationName.trim()) { setError("Location name is required"); return; }
    if (!city.trim()) { setError("City / neighborhood is required"); return; }
    setError("");
    setLoading(true);
    try {
      const gameData = {
        createdBy: currentUser.id,
        organizerId: currentUser.id,
        sport,
        title: title.trim(),
        description: description.trim(),
        date: date ? new Date(date).toISOString() : new Date().toISOString(),
        startTime: startTime || "TBD",
        endTime: endTime || "TBD",
        locationName: locationName.trim(),
        city: city.trim(),
        ageGroup,
        participationGroup,
        skillLevel,
        maxPlayers: parseInt(maxPlayers) || 10,
        type: gameType,
        isPaid: isPaid && gameType !== "game",
        price: isPaid && price ? parseFloat(price) : undefined,
        imageUrl: imageUrl || undefined,
      };
      await createGame(gameData);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setShowSuccess(true);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <SuccessOverlay 
        visible={showSuccess} 
        onClose={() => { setShowSuccess(false); router.replace("/(tabs)/matches"); }}
        gameData={{ title, date, city }}
      />
      <View style={[styles.header, { paddingTop: 12 }]}>
        <Text style={[styles.title, { color: colors.foreground }]}>Create</Text>
        <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
          {gameType === "game"
            ? "Set up a pickup game"
            : gameType === "lesson"
            ? "Host a lesson"
            : "Host a pro experience"}
        </Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 110 }]}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.field}>
          <Text style={[styles.label, { color: colors.foreground }]}>Activity Type</Text>
          {availableTypes.map((t) => (
            <Pressable
              key={t.id}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setGameType(t.id);
              }}
              style={[
                styles.typeCard,
                {
                  backgroundColor: gameType === t.id ? "#16A34A18" : colors.muted,
                  borderColor: gameType === t.id ? "#16A34A" : "transparent",
                  borderWidth: 2,
                },
              ]}
            >
              <View
                style={[
                  styles.typeIcon,
                  { backgroundColor: gameType === t.id ? "#16A34A" : colors.border },
                ]}
              >
                <Feather
                  name={t.icon}
                  size={16}
                  color={gameType === t.id ? "#fff" : colors.mutedForeground}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text
                  style={[
                    styles.typeCardTitle,
                    { color: gameType === t.id ? "#16A34A" : colors.foreground },
                  ]}
                >
                  {t.label}
                </Text>
                <Text style={[styles.typeCardDesc, { color: colors.mutedForeground }]}>
                  {t.desc}
                </Text>
              </View>
              {gameType === t.id && <Feather name="check-circle" size={20} color="#16A34A" />}
            </Pressable>
          ))}
        </View>

        <View style={styles.field}>
          <Text style={[styles.label, { color: colors.foreground }]}>Sport</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.chipRow}>
              {SPORTS.map((s) => (
                <Pressable
                  key={s.id}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setSport(s.id);
                  }}
                  style={[
                    styles.chip,
                    {
                      backgroundColor: sport === s.id ? s.color + "18" : colors.muted,
                      borderColor: sport === s.id ? s.color : "transparent",
                      borderWidth: 1.5,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.chipText,
                      { color: sport === s.id ? s.color : colors.mutedForeground },
                    ]}
                  >
                    {s.name}
                  </Text>
                </Pressable>
              ))}
            </View>
          </ScrollView>
        </View>

        <View style={styles.field}>
          <Text style={[styles.label, { color: colors.foreground }]}>Event Image</Text>
          <Pressable 
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              setImageUrl("https://images.unsplash.com/photo-1546519638-68e109498ffc?w=800&q=80");
            }}
            style={[styles.imageUpload, { backgroundColor: colors.muted, borderColor: colors.border }]}
          >
            {imageUrl ? (
               <Image source={{ uri: imageUrl }} style={styles.uploadedImage} />
            ) : (
               <>
                <Feather name="image" size={32} color={colors.mutedForeground} />
                <Text style={[styles.uploadText, { color: colors.mutedForeground }]}>Tap to upload event image</Text>
               </>
            )}
            {imageUrl && (
               <Pressable onPress={(e) => { e.stopPropagation(); setImageUrl(""); }} style={styles.removeImg}>
                  <Feather name="x" size={16} color="#fff" />
               </Pressable>
            )}
          </Pressable>
        </View>

        <FieldInput
          label="Title"
          value={title}
          onChange={setTitle}
          placeholder="e.g. Friday Night Hoops"
        />
        <FieldInput
          label="Description"
          value={description}
          onChange={setDescription}
          placeholder="Tell players what to expect..."
          multiline
        />
        <FieldInput
          label="Date"
          value={date}
          onChange={setDate}
          placeholder="e.g. 2025-12-20"
        />
        <FieldInput
          label="Start Time"
          value={startTime}
          onChange={setStartTime}
          placeholder="e.g. 7:00 PM"
        />
        <FieldInput
          label="End Time"
          value={endTime}
          onChange={setEndTime}
          placeholder="e.g. 9:00 PM"
        />
        <FieldInput
          label="Venue / Location"
          value={locationName}
          onChange={setLocationName}
          placeholder="e.g. Chelsea Recreation Center"
        />
        <FieldInput
          label="City / Neighborhood"
          value={city}
          onChange={setCity}
          placeholder="e.g. Chelsea, Manhattan"
        />
        <FieldInput
          label="Max Players"
          value={maxPlayers}
          onChange={setMaxPlayers}
          placeholder="e.g. 10"
          keyboardType="number-pad"
        />

        <SelectRow
          label="Skill Level"
          options={SKILL_LEVELS as any}
          value={skillLevel}
          onChange={setSkillLevel as any}
        />
        <SelectRow
          label="Age Group"
          options={AGE_GROUPS as any}
          value={ageGroup}
          onChange={setAgeGroup as any}
        />
        <SelectRow
          label="Participation Group"
          options={PARTICIPATION_GROUPS as any}
          value={participationGroup}
          onChange={setParticipationGroup as any}
        />

        {(gameType === "lesson" || gameType === "pro_game") && (
          <View style={styles.field}>
            <Text style={[styles.label, { color: colors.foreground }]}>Pricing</Text>
            <View style={styles.paidRow}>
              <Pressable
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setIsPaid(false);
                }}
                style={[
                  styles.paidOption,
                  {
                    backgroundColor: !isPaid ? "#16A34A18" : colors.muted,
                    borderColor: !isPaid ? "#16A34A" : "transparent",
                    borderWidth: 1.5,
                  },
                ]}
              >
                <Feather name="gift" size={14} color={!isPaid ? "#16A34A" : colors.mutedForeground} />
                <Text
                  style={[
                    styles.paidOptionText,
                    { color: !isPaid ? "#16A34A" : colors.mutedForeground },
                  ]}
                >
                  Free
                </Text>
              </Pressable>
              <Pressable
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setIsPaid(true);
                }}
                style={[
                  styles.paidOption,
                  {
                    backgroundColor: isPaid ? "#16A34A18" : colors.muted,
                    borderColor: isPaid ? "#16A34A" : "transparent",
                    borderWidth: 1.5,
                  },
                ]}
              >
                <Feather name="dollar-sign" size={14} color={isPaid ? "#16A34A" : colors.mutedForeground} />
                <Text
                  style={[
                    styles.paidOptionText,
                    { color: isPaid ? "#16A34A" : colors.mutedForeground },
                  ]}
                >
                  Paid
                </Text>
              </Pressable>
            </View>
            {isPaid && (
              <TextInput
                style={[
                  styles.input,
                  {
                    color: colors.foreground,
                    borderColor: colors.border,
                    backgroundColor: colors.muted,
                    height: 48,
                    marginTop: 10,
                  },
                ]}
                placeholder="Price in USD (e.g. 25)"
                placeholderTextColor={colors.mutedForeground}
                value={price}
                onChangeText={setPrice}
                keyboardType="decimal-pad"
              />
            )}
          </View>
        )}

        {error ? (
          <View
            style={[styles.errorBox, { backgroundColor: "#FEF2F2", borderColor: "#FECACA" }]}
          >
            <Feather name="alert-circle" size={14} color="#DC2626" />
            <Text style={{ color: "#DC2626", fontSize: 13, fontFamily: "Inter_400Regular", flex: 1 }}>
              {error}
            </Text>
          </View>
        ) : null}

        <Pressable
          onPress={handleCreate}
          disabled={loading}
          style={({ pressed }) => [
            styles.createBtn,
            { backgroundColor: "#16A34A", opacity: pressed || loading ? 0.85 : 1 },
          ]}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.createBtnText}>
              Publish{" "}
              {gameType === "game" ? "Game" : gameType === "lesson" ? "Lesson" : "Pro Game"}
            </Text>
          )}
        </Pressable>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 20, paddingBottom: 8, gap: 2 },
  title: { fontSize: 28, fontFamily: "Inter_700Bold" },
  subtitle: { fontSize: 14, fontFamily: "Inter_400Regular" },
  content: { paddingHorizontal: 20, gap: 4 },
  field: { marginBottom: 16 },
  label: { fontSize: 14, fontFamily: "Inter_500Medium", marginBottom: 8 },
  input: {
    borderWidth: 1.5,
    borderRadius: 12,
    paddingHorizontal: 14,
    fontSize: 15,
    fontFamily: "Inter_400Regular",
  },
  chipRow: { flexDirection: "row", gap: 8, paddingBottom: 2 },
  chip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20 },
  chipText: { fontSize: 13, fontFamily: "Inter_500Medium" },
  typeCard: {
    borderRadius: 14,
    padding: 14,
    marginBottom: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  typeIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  typeCardTitle: { fontSize: 15, fontFamily: "Inter_600SemiBold" },
  typeCardDesc: { fontSize: 13, fontFamily: "Inter_400Regular", marginTop: 2 },
  paidRow: { flexDirection: "row", gap: 10 },
  paidOption: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 6,
  },
  paidOptionText: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  errorBox: {
    flexDirection: "row",
    gap: 8,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    alignItems: "center",
    marginBottom: 8,
  },
  createBtn: {
    height: 54,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
  },
  createBtnText: { color: "#fff", fontSize: 16, fontFamily: "Inter_600SemiBold" },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    padding: 30,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    alignItems: 'center',
    gap: 20,
  },
  successIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#16A34A15',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  successTitle: {
    fontSize: 24,
    fontFamily: 'Inter_700Bold',
  },
  successSubtitle: {
    fontSize: 15,
    fontFamily: 'Inter_400Regular',
    textAlign: 'center',
    marginBottom: 10,
  },
  summaryCard: {
    width: '100%',
    padding: 20,
    borderRadius: 20,
    borderWidth: 1,
    gap: 8,
  },
  summaryTitle: {
    fontSize: 18,
    fontFamily: 'Inter_700Bold',
    marginBottom: 4,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  summaryText: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
  },
  modalActions: {
    width: '100%',
    gap: 12,
    marginTop: 10,
  },
  modalBtn: {
    height: 54,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  modalBtnText: {
    fontSize: 16,
    fontFamily: 'Inter_600SemiBold',
    color: '#fff',
  },
  imageUpload: {
    height: 180,
    borderRadius: 16,
    borderWidth: 2,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    position: 'relative',
  },
  uploadedImage: {
    width: '100%',
    height: '100%',
  },
  uploadText: {
    marginTop: 12,
    fontSize: 14,
    fontFamily: 'Inter_500Medium',
  },
  removeImg: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(0,0,0,0.5)',
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
