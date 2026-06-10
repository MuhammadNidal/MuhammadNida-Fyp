import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
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

type VerifyType = "player" | "coach" | "pro";

export default function VerifyScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { currentUser, updateProfile } = useAuth();
  const [type, setType] = useState<VerifyType>("player");
  const [sport, setSport] = useState("");
  const [summary, setSummary] = useState("");
  const [credentials, setCredentials] = useState("");
  const [link, setLink] = useState("");
  const [loading, setLoading] = useState(false);

  if (currentUser?.verificationStatus === "pending") {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={[styles.header, { paddingTop: 12 }]}>
          <Pressable onPress={() => router.back()} style={styles.backBtn}>
            <Feather name="arrow-left" size={22} color={colors.foreground} />
          </Pressable>
          <Text style={[styles.title, { color: colors.foreground }]}>Verification</Text>
        </View>
        <View style={styles.pendingState}>
          <View style={[styles.pendingIcon, { backgroundColor: "#FFFBEB" }]}>
            <Feather name="clock" size={32} color="#D97706" />
          </View>
          <Text style={[styles.pendingTitle, { color: colors.foreground }]}>Application Under Review</Text>
          <Text style={[styles.pendingText, { color: colors.mutedForeground }]}>
            Your verification application has been submitted and is being reviewed by the Play Connect team. We'll notify you once a decision has been made.
          </Text>
        </View>
      </View>
    );
  }

  if (currentUser?.verificationStatus === "verified") {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={[styles.header, { paddingTop: 12 }]}>
          <Pressable onPress={() => router.back()} style={styles.backBtn}>
            <Feather name="arrow-left" size={22} color={colors.foreground} />
          </Pressable>
          <Text style={[styles.title, { color: colors.foreground }]}>Verification</Text>
        </View>
        <View style={styles.pendingState}>
          <View style={[styles.pendingIcon, { backgroundColor: "#F0FDF4" }]}>
            <Feather name="check-circle" size={32} color="#16A34A" />
          </View>
          <Text style={[styles.pendingTitle, { color: colors.foreground }]}>You're Verified</Text>
          <Text style={[styles.pendingText, { color: colors.mutedForeground }]}>
            Your account has been verified. Your profile shows a verification badge.
          </Text>
        </View>
      </View>
    );
  }

  const handleSubmit = async () => {
    if (!sport.trim() || !summary.trim()) {
      Alert.alert("Required Fields", "Please fill in the sport and experience summary.");
      return;
    }
    setLoading(true);
    try {
      await updateProfile({ verificationStatus: "pending" });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert(
        "Application Submitted",
        "Your verification application has been submitted. The Play Connect team will review it and get back to you.",
        [{ text: "OK", onPress: () => router.back() }]
      );
    } finally {
      setLoading(false);
    }
  };

  const typeOptions: { id: VerifyType; label: string; desc: string; icon: keyof typeof Feather.glyphMap }[] = [
    { id: "player", label: "Player Verification", desc: "Confirm you are a real person on the platform", icon: "user" },
    { id: "coach", label: "Coach Verification", desc: "Confirm you are qualified to give lessons", icon: "award" },
    { id: "pro", label: "Pro Verification", desc: "Confirm you have professional-level experience", icon: "star" },
  ];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: 12 }]}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Feather name="arrow-left" size={22} color={colors.foreground} />
        </Pressable>
        <Text style={[styles.title, { color: colors.foreground }]}>Apply for Verification</Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 60 }]}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={[styles.intro, { color: colors.mutedForeground }]}>
          Verification helps build trust on the platform. Choose the verification level that applies to you.
        </Text>

        <View style={styles.field}>
          <Text style={[styles.label, { color: colors.foreground }]}>Verification Type</Text>
          {typeOptions.map((opt) => (
            <Pressable
              key={opt.id}
              onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setType(opt.id); }}
              style={[
                styles.typeCard,
                {
                  backgroundColor: type === opt.id ? "#16A34A18" : colors.muted,
                  borderColor: type === opt.id ? "#16A34A" : "transparent",
                  borderWidth: 2,
                },
              ]}
            >
              <View style={[styles.typeIcon, { backgroundColor: type === opt.id ? "#16A34A" : colors.border }]}>
                <Feather name={opt.icon} size={16} color={type === opt.id ? "#fff" : colors.mutedForeground} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.typeTitle, { color: type === opt.id ? "#16A34A" : colors.foreground }]}>
                  {opt.label}
                </Text>
                <Text style={[styles.typeDesc, { color: colors.mutedForeground }]}>{opt.desc}</Text>
              </View>
              {type === opt.id && <Feather name="check-circle" size={18} color="#16A34A" />}
            </Pressable>
          ))}
        </View>

        {[
          { label: "Sport or Game", value: sport, onChange: setSport, placeholder: "e.g. Basketball", required: true },
          { label: type === "player" ? "About You" : "Experience Summary", value: summary, onChange: setSummary, placeholder: type === "player" ? "Brief introduction..." : "Coaching/playing history...", required: true },
          { label: "Certifications or Affiliations", value: credentials, onChange: setCredentials, placeholder: "e.g. USTA certified, NYC Parks League", required: false },
          { label: "Public Profile or Link", value: link, onChange: setLink, placeholder: "e.g. Instagram, LinkedIn, or league page", required: false },
        ].map(({ label, value, onChange, placeholder, required }) => (
          <View key={label} style={styles.field}>
            <Text style={[styles.label, { color: colors.foreground }]}>
              {label} {required ? "" : <Text style={{ color: colors.mutedForeground }}>(optional)</Text>}
            </Text>
            <TextInput
              style={[
                styles.input,
                { color: colors.foreground, borderColor: colors.border, backgroundColor: colors.muted, height: required && label.includes("Summary") ? 100 : 48, textAlignVertical: required && label.includes("Summary") ? "top" : "center", paddingTop: required && label.includes("Summary") ? 12 : 0 },
              ]}
              placeholder={placeholder}
              placeholderTextColor={colors.mutedForeground}
              value={value}
              onChangeText={onChange}
              multiline={required && label.includes("Summary")}
            />
          </View>
        ))}

        <View style={[styles.notice, { backgroundColor: "#F0FDF4", borderColor: "#BBF7D0" }]}>
          <Feather name="info" size={14} color="#16A34A" />
          <Text style={[styles.noticeText, { color: "#15803D" }]}>
            Applications are manually reviewed by the Play Connect team. We'll contact you once a decision has been made.
          </Text>
        </View>

        <Pressable
          onPress={handleSubmit}
          disabled={loading}
          style={({ pressed }) => [
            styles.submitBtn,
            { backgroundColor: "#16A34A", opacity: pressed || loading ? 0.85 : 1 },
          ]}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.submitBtnText}>Submit Application</Text>
          )}
        </Pressable>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingBottom: 16,
    gap: 12,
  },
  backBtn: { width: 38, height: 38, alignItems: "center", justifyContent: "center" },
  title: { fontSize: 20, fontFamily: "Inter_700Bold", flex: 1 },
  content: { paddingHorizontal: 20, gap: 4 },
  intro: { fontSize: 15, fontFamily: "Inter_400Regular", lineHeight: 22, marginBottom: 20 },
  field: { marginBottom: 16 },
  label: { fontSize: 14, fontFamily: "Inter_500Medium", marginBottom: 8 },
  input: {
    borderWidth: 1.5,
    borderRadius: 12,
    paddingHorizontal: 14,
    fontSize: 15,
    fontFamily: "Inter_400Regular",
  },
  typeCard: { borderRadius: 14, padding: 14, marginBottom: 8, flexDirection: "row", alignItems: "center", gap: 12 },
  typeIcon: { width: 34, height: 34, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  typeTitle: { fontSize: 15, fontFamily: "Inter_600SemiBold" },
  typeDesc: { fontSize: 13, fontFamily: "Inter_400Regular", marginTop: 2 },
  notice: {
    flexDirection: "row",
    gap: 10,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 16,
    alignItems: "flex-start",
  },
  noticeText: { flex: 1, fontSize: 13, fontFamily: "Inter_400Regular", lineHeight: 18 },
  submitBtn: {
    height: 54,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  submitBtnText: { color: "#fff", fontSize: 16, fontFamily: "Inter_600SemiBold" },
  pendingState: { flex: 1, alignItems: "center", justifyContent: "center", padding: 40, gap: 16 },
  pendingIcon: { width: 80, height: 80, borderRadius: 40, alignItems: "center", justifyContent: "center" },
  pendingTitle: { fontSize: 22, fontFamily: "Inter_700Bold", textAlign: "center" },
  pendingText: { fontSize: 15, fontFamily: "Inter_400Regular", textAlign: "center", lineHeight: 22 },
});
