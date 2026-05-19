import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Platform,
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
import {
  SPORTS,
  SKILL_LEVELS,
  AGE_GROUPS,
  PARTICIPATION_GROUPS,
} from "@/constants/sports";

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
              onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); onChange(opt.id); }}
              style={[
                styles.chip,
                {
                  backgroundColor: value === opt.id ? "#16A34A18" : colors.muted,
                  borderColor: value === opt.id ? "#16A34A" : "transparent",
                  borderWidth: 1.5,
                },
              ]}
            >
              <Text style={[styles.chipText, { color: value === opt.id ? "#16A34A" : colors.mutedForeground }]}>
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
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  multiline?: boolean;
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
          },
        ]}
        placeholder={placeholder}
        placeholderTextColor={colors.mutedForeground}
        value={value}
        onChangeText={onChange}
        multiline={multiline}
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
  const [skillLevel, setSkillLevel] = useState<"beginner" | "intermediate" | "advanced" | "all">("all");
  const [ageGroup, setAgeGroup] = useState<"young_adult" | "adult" | "senior" | "all">("all");
  const [participationGroup, setParticipationGroup] = useState<"male" | "female" | "all">("all");
  const [isPaid, setIsPaid] = useState(false);
  const [price, setPrice] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const canCreateLesson = currentUser?.role === "coach" || currentUser?.role === "pro";
  const canCreateProGame = currentUser?.role === "pro";

  const availableTypes: { id: GameType; label: string; desc: string }[] = [
    { id: "game", label: "Game", desc: "Standard pickup game for all players" },
    ...(canCreateLesson ? [{ id: "lesson" as GameType, label: "Lesson", desc: "Structured lesson you host as a coach/pro" }] : []),
    ...(canCreateProGame ? [{ id: "pro_game" as GameType, label: "Pro Game", desc: "Play with a pro experience" }] : []),
  ];

  const handleCreate = async () => {
    if (!currentUser) return;
    if (!title.trim()) { setError("Title is required"); return; }
    if (!locationName.trim()) { setError("Location is required"); return; }
    if (!city.trim()) { setError("City is required"); return; }
    setError("");
    setLoading(true);
    try {
      await createGame({
        createdBy: currentUser.id,
        organizerId: currentUser.id,
        sport,
        title: title.trim(),
        description: description.trim(),
        date: new Date().toISOString(),
        startTime: startTime || "TBD",
        endTime: endTime || "TBD",
        locationName: locationName.trim(),
        city: city.trim(),
        ageGroup,
        participationGroup,
        skillLevel,
        maxPlayers: parseInt(maxPlayers) || 10,
        type: gameType,
        isPaid: gameType !== "game" && isPaid,
        price: isPaid && price ? parseFloat(price) : undefined,
      });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.replace("/(tabs)/matches");
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const topPad = insets.top + (Platform.OS === "web" ? 67 : 0);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: topPad + 16 }]}>
        <Text style={[styles.title, { color: colors.foreground }]}>Create</Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 100 }]}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.field}>
          <Text style={[styles.label, { color: colors.foreground }]}>Activity Type</Text>
          {availableTypes.map((t) => (
            <Pressable
              key={t.id}
              onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setGameType(t.id); }}
              style={[
                styles.typeCard,
                {
                  backgroundColor: gameType === t.id ? "#16A34A18" : colors.muted,
                  borderColor: gameType === t.id ? "#16A34A" : "transparent",
                  borderWidth: 2,
                },
              ]}
            >
              <View style={styles.typeCardRow}>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.typeCardTitle, { color: gameType === t.id ? "#16A34A" : colors.foreground }]}>
                    {t.label}
                  </Text>
                  <Text style={[styles.typeCardDesc, { color: colors.mutedForeground }]}>{t.desc}</Text>
                </View>
                {gameType === t.id && <Feather name="check-circle" size={20} color="#16A34A" />}
              </View>
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
                  onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setSport(s.id); }}
                  style={[
                    styles.chip,
                    {
                      backgroundColor: sport === s.id ? s.color + "18" : colors.muted,
                      borderColor: sport === s.id ? s.color : "transparent",
                      borderWidth: 1.5,
                    },
                  ]}
                >
                  <Text style={[styles.chipText, { color: sport === s.id ? s.color : colors.mutedForeground }]}>
                    {s.name}
                  </Text>
                </Pressable>
              ))}
            </View>
          </ScrollView>
        </View>

        <FieldInput label="Title" value={title} onChange={setTitle} placeholder="e.g. Friday Night Hoops" />
        <FieldInput label="Description" value={description} onChange={setDescription} placeholder="Tell players what to expect..." multiline />
        <FieldInput label="Date" value={date} onChange={setDate} placeholder="e.g. Dec 20, 2025" />
        <FieldInput label="Start Time" value={startTime} onChange={setStartTime} placeholder="e.g. 7:00 PM" />
        <FieldInput label="End Time" value={endTime} onChange={setEndTime} placeholder="e.g. 9:00 PM" />
        <FieldInput label="Venue / Location" value={locationName} onChange={setLocationName} placeholder="e.g. Chelsea Recreation Center" />
        <FieldInput label="City / Neighborhood" value={city} onChange={setCity} placeholder="e.g. Chelsea, Manhattan" />
        <FieldInput label="Max Players" value={maxPlayers} onChange={setMaxPlayers} placeholder="e.g. 10" />

        <SelectRow label="Skill Level" options={SKILL_LEVELS as any} value={skillLevel} onChange={setSkillLevel as any} />
        <SelectRow label="Age Group" options={AGE_GROUPS as any} value={ageGroup} onChange={setAgeGroup as any} />
        <SelectRow label="Participation Group" options={PARTICIPATION_GROUPS as any} value={participationGroup} onChange={setParticipationGroup as any} />

        {(gameType === "lesson" || gameType === "pro_game") && (
          <View style={styles.field}>
            <Text style={[styles.label, { color: colors.foreground }]}>Pricing</Text>
            <View style={styles.paidRow}>
              <Pressable
                onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setIsPaid(false); }}
                style={[
                  styles.paidOption,
                  {
                    backgroundColor: !isPaid ? "#16A34A18" : colors.muted,
                    borderColor: !isPaid ? "#16A34A" : "transparent",
                    borderWidth: 1.5,
                  },
                ]}
              >
                <Text style={{ color: !isPaid ? "#16A34A" : colors.mutedForeground, fontFamily: "Inter_600SemiBold" }}>Free</Text>
              </Pressable>
              <Pressable
                onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setIsPaid(true); }}
                style={[
                  styles.paidOption,
                  {
                    backgroundColor: isPaid ? "#16A34A18" : colors.muted,
                    borderColor: isPaid ? "#16A34A" : "transparent",
                    borderWidth: 1.5,
                  },
                ]}
              >
                <Text style={{ color: isPaid ? "#16A34A" : colors.mutedForeground, fontFamily: "Inter_600SemiBold" }}>Paid</Text>
              </Pressable>
            </View>
            {isPaid && (
              <TextInput
                style={[styles.input, { color: colors.foreground, borderColor: colors.border, backgroundColor: colors.muted, height: 48, marginTop: 8 }]}
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
          <View style={[styles.errorBox, { backgroundColor: "#FEF2F2", borderColor: "#FECACA" }]}>
            <Feather name="alert-circle" size={14} color="#DC2626" />
            <Text style={{ color: "#DC2626", fontSize: 13, fontFamily: "Inter_400Regular" }}>{error}</Text>
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
            <Text style={styles.createBtnText}>Publish {gameType === "game" ? "Game" : gameType === "lesson" ? "Lesson" : "Pro Game"}</Text>
          )}
        </Pressable>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 20, paddingBottom: 12 },
  title: { fontSize: 28, fontFamily: "Inter_700Bold" },
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
  chipRow: { flexDirection: "row", gap: 8 },
  chip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20 },
  chipText: { fontSize: 13, fontFamily: "Inter_500Medium" },
  typeCard: { borderRadius: 14, padding: 14, marginBottom: 8 },
  typeCardRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  typeCardTitle: { fontSize: 15, fontFamily: "Inter_600SemiBold" },
  typeCardDesc: { fontSize: 13, fontFamily: "Inter_400Regular", marginTop: 2 },
  paidRow: { flexDirection: "row", gap: 10 },
  paidOption: { flex: 1, height: 44, borderRadius: 12, alignItems: "center", justifyContent: "center" },
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
});
