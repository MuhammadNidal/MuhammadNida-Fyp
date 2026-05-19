import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "@/context/AuthContext";
import { useColors } from "@/hooks/useColors";

function SettingsRow({
  icon,
  label,
  subtitle,
  onPress,
  danger,
}: {
  icon: keyof typeof Feather.glyphMap;
  label: string;
  subtitle?: string;
  onPress: () => void;
  danger?: boolean;
}) {
  const colors = useColors();
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.row,
        { borderBottomColor: colors.border, opacity: pressed ? 0.75 : 1 },
      ]}
    >
      <View style={[styles.rowIcon, { backgroundColor: danger ? "#FEF2F2" : colors.muted }]}>
        <Feather name={icon} size={18} color={danger ? "#DC2626" : colors.mutedForeground} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={[styles.rowLabel, { color: danger ? "#DC2626" : colors.foreground }]}>
          {label}
        </Text>
        {subtitle && (
          <Text style={[styles.rowSub, { color: colors.mutedForeground }]}>{subtitle}</Text>
        )}
      </View>
      {!danger && <Feather name="chevron-right" size={18} color={colors.mutedForeground} />}
    </Pressable>
  );
}

export default function SettingsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { currentUser, signOut } = useAuth();

  const handleSignOut = () => {
    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign Out",
        style: "destructive",
        onPress: async () => {
          await signOut();
          router.replace("/(auth)/login");
        },
      },
    ]);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Feather name="arrow-left" size={22} color={colors.foreground} />
        </Pressable>
        <Text style={[styles.title, { color: colors.foreground }]}>Settings</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 60 }}>
        <View style={[styles.section, { borderColor: colors.border }]}>
          <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>Account</Text>
          <SettingsRow
            icon="user"
            label="Edit Profile"
            subtitle="Update your name, bio, and sports"
            onPress={() => router.push("/(tabs)/profile/edit")}
          />
          <SettingsRow
            icon="shield"
            label="Verification"
            subtitle={
              currentUser?.verificationStatus === "none"
                ? "Apply for verification"
                : currentUser?.verificationStatus === "pending"
                ? "Application under review"
                : "Verified"
            }
            onPress={() => router.push("/(tabs)/profile/verify")}
          />
        </View>

        <View style={[styles.section, { borderColor: colors.border }]}>
          <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>Role</Text>
          <SettingsRow
            icon="star"
            label="Current Role"
            subtitle={`You are a ${currentUser?.role ?? "player"}`}
            onPress={() => {}}
          />
          {(currentUser?.role === "player") && (
            <SettingsRow
              icon="award"
              label="Apply for Coach or Pro"
              subtitle="Unlock lessons and premium features"
              onPress={() => router.push("/(tabs)/profile/verify")}
            />
          )}
        </View>

        <View style={[styles.section, { borderColor: colors.border }]}>
          <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>About</Text>
          <SettingsRow icon="info" label="Version" subtitle="1.0.0" onPress={() => {}} />
          <SettingsRow icon="file-text" label="Terms of Service" onPress={() => {}} />
          <SettingsRow icon="lock" label="Privacy Policy" onPress={() => {}} />
        </View>

        <View style={[styles.section, { borderColor: colors.border }]}>
          <SettingsRow
            icon="log-out"
            label="Sign Out"
            onPress={handleSignOut}
            danger
          />
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
    paddingHorizontal: 20,
    paddingBottom: 16,
    gap: 12,
  },
  backBtn: { width: 38, height: 38, alignItems: "center", justifyContent: "center" },
  title: { fontSize: 22, fontFamily: "Inter_700Bold" },
  section: {
    borderTopWidth: StyleSheet.hairlineWidth,
    marginTop: 24,
  },
  sectionLabel: {
    fontSize: 12,
    fontFamily: "Inter_500Medium",
    textTransform: "uppercase",
    letterSpacing: 0.8,
    paddingHorizontal: 20,
    paddingVertical: 8,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  rowIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  rowLabel: { fontSize: 15, fontFamily: "Inter_500Medium" },
  rowSub: { fontSize: 13, fontFamily: "Inter_400Regular", marginTop: 2 },
});
