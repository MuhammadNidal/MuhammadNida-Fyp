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

const STEPS = ["Sports", "Location", "About You"];

export default function OnboardingScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { completeOnboarding } = useAuth();

  const [step, setStep] = useState(0);
  const [selectedSports, setSelectedSports] = useState<string[]>([]);
  const [location, setLocation] = useState("");
  const [bio, setBio] = useState("");
  const [loading, setLoading] = useState(false);

  const toggleSport = (id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedSports((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  };

  const canProceed = () => {
    if (step === 0) return selectedSports.length > 0;
    if (step === 1) return location.trim().length > 0;
    return true;
  };

  const handleNext = async () => {
    if (step < STEPS.length - 1) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setStep((s) => s + 1);
    } else {
      setLoading(true);
      try {
        await completeOnboarding({ sports: selectedSports, location, bio });
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        router.replace("/(tabs)/explore");
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.topBar, { paddingTop: insets.top + 20 }]}>
        <View style={styles.progressRow}>
          {STEPS.map((_, i) => (
            <View
              key={i}
              style={[
                styles.progressDot,
                { backgroundColor: i <= step ? "#16A34A" : colors.border },
                i < step && styles.progressDotDone,
              ]}
            />
          ))}
        </View>
        <Text style={[styles.stepLabel, { color: colors.mutedForeground }]}>
          Step {step + 1} of {STEPS.length}
        </Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {step === 0 && (
          <View style={styles.stepContent}>
            <Text style={[styles.stepTitle, { color: colors.foreground }]}>
              What do you love to play?
            </Text>
            <Text style={[styles.stepSubtitle, { color: colors.mutedForeground }]}>
              Select all sports and games you're interested in
            </Text>
            <View style={styles.sportsGrid}>
              {SPORTS.map((sport) => {
                const selected = selectedSports.includes(sport.id);
                return (
                  <Pressable
                    key={sport.id}
                    onPress={() => toggleSport(sport.id)}
                    style={({ pressed }) => [
                      styles.sportCard,
                      {
                        backgroundColor: selected ? sport.color + "18" : colors.muted,
                        borderColor: selected ? sport.color : "transparent",
                        borderWidth: 2,
                        opacity: pressed ? 0.85 : 1,
                      },
                    ]}
                  >
                    <Text style={[styles.sportName, { color: selected ? sport.color : colors.mutedForeground }]}>
                      {sport.name}
                    </Text>
                    {selected && (
                      <View style={[styles.checkMark, { backgroundColor: sport.color }]}>
                        <Text style={{ color: "#fff", fontSize: 10, fontFamily: "Inter_700Bold" }}>✓</Text>
                      </View>
                    )}
                  </Pressable>
                );
              })}
            </View>
          </View>
        )}

        {step === 1 && (
          <View style={styles.stepContent}>
            <Text style={[styles.stepTitle, { color: colors.foreground }]}>Where are you based?</Text>
            <Text style={[styles.stepSubtitle, { color: colors.mutedForeground }]}>
              We'll show you games and players nearby
            </Text>
            <TextInput
              style={[
                styles.textInput,
                {
                  color: colors.foreground,
                  borderColor: colors.border,
                  backgroundColor: colors.muted,
                },
              ]}
              placeholder="e.g. Chelsea, Manhattan"
              placeholderTextColor={colors.mutedForeground}
              value={location}
              onChangeText={setLocation}
              autoCapitalize="words"
            />
          </View>
        )}

        {step === 2 && (
          <View style={styles.stepContent}>
            <Text style={[styles.stepTitle, { color: colors.foreground }]}>Tell us about yourself</Text>
            <Text style={[styles.stepSubtitle, { color: colors.mutedForeground }]}>
              A short bio helps others know who they're playing with
            </Text>
            <TextInput
              style={[
                styles.bioInput,
                {
                  color: colors.foreground,
                  borderColor: colors.border,
                  backgroundColor: colors.muted,
                },
              ]}
              placeholder="e.g. Weekend basketball player, love pickup games and meeting new people."
              placeholderTextColor={colors.mutedForeground}
              value={bio}
              onChangeText={setBio}
              multiline
              numberOfLines={5}
              textAlignVertical="top"
            />
            <Text style={[styles.optionalNote, { color: colors.mutedForeground }]}>
              This is optional — you can always update it later.
            </Text>
          </View>
        )}
      </ScrollView>

      <View
        style={[
          styles.footer,
          { paddingBottom: insets.bottom + 16, borderTopColor: colors.border },
        ]}
      >
        {step > 0 && (
          <Pressable
            onPress={() => setStep((s) => s - 1)}
            style={[styles.backBtn, { borderColor: colors.border }]}
          >
            <Text style={[styles.backBtnText, { color: colors.mutedForeground }]}>Back</Text>
          </Pressable>
        )}
        <Pressable
          onPress={handleNext}
          disabled={!canProceed() || loading}
          style={({ pressed }) => [
            styles.nextBtn,
            {
              backgroundColor: canProceed() ? "#16A34A" : colors.muted,
              flex: step > 0 ? 1 : undefined,
              opacity: pressed || loading ? 0.85 : 1,
            },
          ]}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text
              style={[
                styles.nextBtnText,
                { color: canProceed() ? "#fff" : colors.mutedForeground },
              ]}
            >
              {step === STEPS.length - 1 ? "Get Started" : "Continue"}
            </Text>
          )}
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  topBar: {
    paddingHorizontal: 24,
    paddingBottom: 8,
    gap: 12,
  },
  progressRow: {
    flexDirection: "row",
    gap: 6,
  },
  progressDot: {
    height: 4,
    flex: 1,
    borderRadius: 2,
  },
  progressDotDone: {
    backgroundColor: "#16A34A",
  },
  stepLabel: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
  },
  content: {
    paddingHorizontal: 24,
    paddingBottom: 24,
    flexGrow: 1,
  },
  stepContent: {
    paddingTop: 24,
    gap: 16,
  },
  stepTitle: {
    fontSize: 26,
    fontFamily: "Inter_700Bold",
    lineHeight: 32,
  },
  stepSubtitle: {
    fontSize: 15,
    fontFamily: "Inter_400Regular",
    lineHeight: 22,
  },
  sportsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginTop: 8,
  },
  sportCard: {
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 14,
    position: "relative",
    minWidth: "44%",
    flex: 1,
    alignItems: "center",
  },
  sportName: {
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
  },
  checkMark: {
    position: "absolute",
    top: 6,
    right: 6,
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
  },
  textInput: {
    height: 52,
    borderWidth: 1.5,
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 15,
    fontFamily: "Inter_400Regular",
  },
  bioInput: {
    height: 140,
    borderWidth: 1.5,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    fontFamily: "Inter_400Regular",
    lineHeight: 22,
  },
  optionalNote: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
  },
  footer: {
    flexDirection: "row",
    paddingHorizontal: 24,
    paddingTop: 16,
    borderTopWidth: StyleSheet.hairlineWidth,
    gap: 10,
  },
  backBtn: {
    height: 54,
    paddingHorizontal: 20,
    borderRadius: 14,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
  },
  backBtnText: {
    fontSize: 15,
    fontFamily: "Inter_500Medium",
  },
  nextBtn: {
    height: 54,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
  },
  nextBtnText: {
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
  },
});
