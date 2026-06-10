import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useAuth } from "@/context/AuthContext";
import { useColors } from "@/hooks/useColors";

function SettingsRow({
  icon,
  label,
  subtitle,
  onPress,
  danger,
  rightNode,
}: {
  icon: keyof typeof Feather.glyphMap;
  label: string;
  subtitle?: string;
  onPress: () => void;
  danger?: boolean;
  rightNode?: React.ReactNode;
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
      {rightNode ?? (!danger && <Feather name="chevron-right" size={18} color={colors.mutedForeground} />)}
    </Pressable>
  );
}

function SectionHeader({ label }: { label: string }) {
  const colors = useColors();
  return (
    <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>{label}</Text>
  );
}

export default function SettingsScreen() {
  const colors = useColors();
  const { currentUser, signOut } = useAuth();
  const [subPlan, setSubPlan] = useState<"monthly" | "yearly">("monthly");

  const isElevated = currentUser?.role === "coach" || currentUser?.role === "pro";

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

  const handleSubscription = (plan: "monthly" | "yearly") => {
    Alert.alert(
      `${plan === "monthly" ? "Monthly" : "Yearly"} Subscription`,
      `Subscribe to maintain your ${currentUser?.role} status on Play Connect?\n\n${plan === "monthly" ? "$9.99/month" : "$89.99/year (save 25%)"}\n\nPayment processing coming soon.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Subscribe",
          onPress: () => {
            setSubPlan(plan);
            Alert.alert(
              "Coming Soon",
              "Subscription payments will be available in the next release."
            );
          },
        },
      ]
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: 12 }]}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Feather name="arrow-left" size={22} color={colors.foreground} />
        </Pressable>
        <Text style={[styles.title, { color: colors.foreground }]}>Settings</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 60 }}>
        <View style={[styles.section, { borderColor: colors.border }]}>
          <SectionHeader label="Account" />
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
                : "Verified ✓"
            }
            onPress={() => router.push("/(tabs)/profile/verify")}
          />
        </View>

        {isElevated && (
          <View style={[styles.section, { borderColor: colors.border }]}>
            <SectionHeader label={`${currentUser?.role === "pro" ? "Pro" : "Coach"} Subscription`} />

            <View style={[styles.subCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={styles.subHeader}>
                <View style={[styles.subIcon, { backgroundColor: currentUser?.role === "pro" ? "#F9731618" : "#8B5CF618" }]}>
                  <Feather
                    name={currentUser?.role === "pro" ? "star" : "award"}
                    size={20}
                    color={currentUser?.role === "pro" ? "#F97316" : "#8B5CF6"}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.subTitle, { color: colors.foreground }]}>
                    {currentUser?.role === "pro" ? "Pro" : "Coach"} Status
                  </Text>
                  <Text style={[styles.subSubtitle, { color: colors.mutedForeground }]}>
                    Active · Renews monthly
                  </Text>
                </View>
                <View style={[styles.activeBadge, { backgroundColor: "#F0FDF4" }]}>
                  <Text style={{ color: "#16A34A", fontSize: 11, fontFamily: "Inter_600SemiBold" }}>
                    Active
                  </Text>
                </View>
              </View>

              <View style={[styles.planRow, { borderColor: colors.border }]}>
                <Pressable
                  onPress={() => handleSubscription("monthly")}
                  style={[
                    styles.planOption,
                    {
                      backgroundColor: subPlan === "monthly" ? "#16A34A18" : colors.muted,
                      borderColor: subPlan === "monthly" ? "#16A34A" : "transparent",
                      borderWidth: 1.5,
                    },
                  ]}
                >
                  <Text style={[styles.planPrice, { color: subPlan === "monthly" ? "#16A34A" : colors.foreground }]}>
                    $9.99
                  </Text>
                  <Text style={[styles.planPeriod, { color: colors.mutedForeground }]}>/ month</Text>
                </Pressable>
                <Pressable
                  onPress={() => handleSubscription("yearly")}
                  style={[
                    styles.planOption,
                    {
                      backgroundColor: subPlan === "yearly" ? "#16A34A18" : colors.muted,
                      borderColor: subPlan === "yearly" ? "#16A34A" : "transparent",
                      borderWidth: 1.5,
                    },
                  ]}
                >
                  <Text style={[styles.planPrice, { color: subPlan === "yearly" ? "#16A34A" : colors.foreground }]}>
                    $89.99
                  </Text>
                  <Text style={[styles.planPeriod, { color: colors.mutedForeground }]}>/ year</Text>
                  <View style={[styles.saveBadge, { backgroundColor: "#16A34A" }]}>
                    <Text style={{ color: "#fff", fontSize: 9, fontFamily: "Inter_700Bold" }}>
                      SAVE 25%
                    </Text>
                  </View>
                </Pressable>
              </View>
            </View>
          </View>
        )}

        {!isElevated && (
          <View style={[styles.section, { borderColor: colors.border }]}>
            <SectionHeader label="Upgrade" />
            <SettingsRow
              icon="award"
              label="Apply for Coach or Pro"
              subtitle="Unlock lessons and premium features"
              onPress={() => router.push("/(tabs)/profile/verify")}
            />
          </View>
        )}

        <View style={[styles.section, { borderColor: colors.border }]}>
          <SectionHeader label="Role" />
          <SettingsRow
            icon="star"
            label="Current Role"
            subtitle={`You are a ${currentUser?.role ?? "player"}`}
            onPress={() => {}}
            rightNode={
              <View style={[styles.roleBadge, {
                backgroundColor:
                  currentUser?.role === "pro"
                    ? "#F9731618"
                    : currentUser?.role === "coach"
                    ? "#8B5CF618"
                    : colors.muted,
              }]}>
                <Text style={{
                  color:
                    currentUser?.role === "pro"
                      ? "#F97316"
                      : currentUser?.role === "coach"
                      ? "#8B5CF6"
                      : colors.mutedForeground,
                  fontSize: 12,
                  fontFamily: "Inter_600SemiBold",
                  textTransform: "capitalize",
                }}>
                  {currentUser?.role ?? "Player"}
                </Text>
              </View>
            }
          />
        </View>

        <View style={[styles.section, { borderColor: colors.border }]}>
          <SectionHeader label="About" />
          <SettingsRow icon="info" label="Version" subtitle="1.0.0" onPress={() => {}} rightNode={<View />} />
          <SettingsRow icon="file-text" label="Terms of Service" onPress={() => {}} />
          <SettingsRow icon="lock" label="Privacy Policy" onPress={() => {}} />
        </View>

        <View style={[styles.section, { borderColor: colors.border }]}>
          <SettingsRow icon="log-out" label="Sign Out" onPress={handleSignOut} danger />
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
  subCard: {
    marginHorizontal: 20,
    borderRadius: 16,
    borderWidth: 1,
    overflow: "hidden",
    marginTop: 4,
  },
  subHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 16,
  },
  subIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  subTitle: { fontSize: 16, fontFamily: "Inter_600SemiBold" },
  subSubtitle: { fontSize: 13, fontFamily: "Inter_400Regular", marginTop: 2 },
  activeBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  planRow: {
    flexDirection: "row",
    gap: 10,
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  planOption: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    borderRadius: 12,
    position: "relative",
  },
  planPrice: { fontSize: 18, fontFamily: "Inter_700Bold" },
  planPeriod: { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 2 },
  saveBadge: {
    position: "absolute",
    top: -8,
    right: -4,
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 8,
  },
  roleBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
});
