import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "@/context/AuthContext";
import { useColors } from "@/hooks/useColors";
import { SPORTS } from "@/constants/sports";

export default function EditProfileScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { currentUser, updateProfile } = useAuth();
  const [name, setName] = useState(currentUser?.name ?? "");
  const [username, setUsername] = useState(currentUser?.username ?? "");
  const [bio, setBio] = useState(currentUser?.bio ?? "");
  const [location, setLocation] = useState(currentUser?.location ?? "");
  const [selectedSports, setSelectedSports] = useState<string[]>(currentUser?.sports ?? []);
  const [loading, setLoading] = useState(false);

  const toggleSport = (id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedSports((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      await updateProfile({ name, username, bio, location, sports: selectedSports });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.back();
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <Pressable onPress={() => router.back()} style={styles.cancelBtn}>
          <Text style={[styles.cancelText, { color: colors.mutedForeground }]}>Cancel</Text>
        </Pressable>
        <Text style={[styles.title, { color: colors.foreground }]}>Edit Profile</Text>
        <Pressable onPress={handleSave} disabled={loading} style={styles.saveBtn}>
          {loading ? (
            <ActivityIndicator size="small" color="#16A34A" />
          ) : (
            <Text style={[styles.saveText, { color: "#16A34A" }]}>Save</Text>
          )}
        </Pressable>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 40 }]}
        keyboardShouldPersistTaps="handled"
      >
        {[
          { label: "Full Name", value: name, onChange: setName, placeholder: "Your name" },
          { label: "Username", value: username, onChange: setUsername, placeholder: "username" },
          { label: "Location", value: location, onChange: setLocation, placeholder: "e.g. Chelsea, Manhattan" },
        ].map(({ label, value, onChange, placeholder }) => (
          <View key={label} style={styles.field}>
            <Text style={[styles.label, { color: colors.foreground }]}>{label}</Text>
            <TextInput
              style={[styles.input, { color: colors.foreground, borderColor: colors.border, backgroundColor: colors.muted }]}
              placeholder={placeholder}
              placeholderTextColor={colors.mutedForeground}
              value={value}
              onChangeText={onChange}
              autoCapitalize={label === "Username" ? "none" : "words"}
            />
          </View>
        ))}

        <View style={styles.field}>
          <Text style={[styles.label, { color: colors.foreground }]}>Bio</Text>
          <TextInput
            style={[
              styles.input,
              styles.bioInput,
              { color: colors.foreground, borderColor: colors.border, backgroundColor: colors.muted },
            ]}
            placeholder="Tell others about yourself..."
            placeholderTextColor={colors.mutedForeground}
            value={bio}
            onChangeText={setBio}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>

        <View style={styles.field}>
          <Text style={[styles.label, { color: colors.foreground }]}>Sports & Games</Text>
          <View style={styles.sportsGrid}>
            {SPORTS.map((sport) => {
              const sel = selectedSports.includes(sport.id);
              return (
                <Pressable
                  key={sport.id}
                  onPress={() => toggleSport(sport.id)}
                  style={[
                    styles.sportChip,
                    {
                      backgroundColor: sel ? sport.color + "18" : colors.muted,
                      borderColor: sel ? sport.color : "transparent",
                      borderWidth: 1.5,
                    },
                  ]}
                >
                  <Text style={[styles.sportChipText, { color: sel ? sport.color : colors.mutedForeground }]}>
                    {sport.name}
                  </Text>
                  {sel && <Feather name="check" size={14} color={sport.color} />}
                </Pressable>
              );
            })}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  cancelBtn: { padding: 4 },
  cancelText: { fontSize: 16, fontFamily: "Inter_400Regular" },
  title: { fontSize: 17, fontFamily: "Inter_600SemiBold" },
  saveBtn: { padding: 4 },
  saveText: { fontSize: 16, fontFamily: "Inter_600SemiBold" },
  content: { paddingHorizontal: 20, paddingTop: 20, gap: 4 },
  field: { marginBottom: 16 },
  label: { fontSize: 14, fontFamily: "Inter_500Medium", marginBottom: 8 },
  input: {
    height: 48,
    borderWidth: 1.5,
    borderRadius: 12,
    paddingHorizontal: 14,
    fontSize: 15,
    fontFamily: "Inter_400Regular",
  },
  bioInput: {
    height: 110,
    paddingTop: 12,
  },
  sportsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  sportChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 20,
  },
  sportChipText: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
});
