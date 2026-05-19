import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
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
import { useAuth } from "@/context/AuthContext";
import { useColors } from "@/hooks/useColors";

export default function LoginScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { signIn } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async () => {
    if (!email || !password) {
      setError("Please enter your email and password");
      return;
    }
    setError("");
    setLoading(true);
    try {
      await signIn(email.trim(), password);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.replace("/(tabs)/explore");
    } catch (e: any) {
      setError(e.message ?? "Login failed");
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setLoading(false);
    }
  };

  const handleDemo = async () => {
    setLoading(true);
    try {
      await signIn("demo@letsplay.app", "password123");
      router.replace("/(tabs)/explore");
    } catch {
      await signIn("jordan@example.com", "password123");
      router.replace("/(tabs)/explore");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.background }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={[
          styles.container,
          { paddingTop: insets.top + 48, paddingBottom: insets.bottom + 32 },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.logoArea}>
          <View style={[styles.logoMark, { backgroundColor: "#16A34A" }]}>
            <Feather name="play" size={28} color="#fff" />
          </View>
          <Text style={[styles.appName, { color: colors.foreground }]}>Let's Play</Text>
          <Text style={[styles.tagline, { color: colors.mutedForeground }]}>
            Find your game. Meet your people.
          </Text>
        </View>

        <View style={styles.form}>
          <Text style={[styles.label, { color: colors.foreground }]}>Email</Text>
          <View style={[styles.inputWrap, { borderColor: colors.border, backgroundColor: colors.muted }]}>
            <Feather name="mail" size={18} color={colors.mutedForeground} style={styles.inputIcon} />
            <TextInput
              style={[styles.input, { color: colors.foreground }]}
              placeholder="you@example.com"
              placeholderTextColor={colors.mutedForeground}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
            />
          </View>

          <Text style={[styles.label, { color: colors.foreground }]}>Password</Text>
          <View style={[styles.inputWrap, { borderColor: colors.border, backgroundColor: colors.muted }]}>
            <Feather name="lock" size={18} color={colors.mutedForeground} style={styles.inputIcon} />
            <TextInput
              style={[styles.input, { color: colors.foreground }]}
              placeholder="Your password"
              placeholderTextColor={colors.mutedForeground}
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              autoComplete="password"
            />
            <Pressable onPress={() => setShowPassword(!showPassword)} style={styles.eyeBtn}>
              <Feather name={showPassword ? "eye-off" : "eye"} size={18} color={colors.mutedForeground} />
            </Pressable>
          </View>

          {error ? (
            <View style={[styles.errorBox, { backgroundColor: "#FEF2F2", borderColor: "#FECACA" }]}>
              <Feather name="alert-circle" size={14} color="#DC2626" />
              <Text style={[styles.errorText, { color: "#DC2626" }]}>{error}</Text>
            </View>
          ) : null}

          <Pressable
            onPress={handleLogin}
            disabled={loading}
            style={({ pressed }) => [
              styles.primaryBtn,
              { backgroundColor: "#16A34A", opacity: pressed || loading ? 0.85 : 1 },
            ]}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.primaryBtnText}>Sign In</Text>
            )}
          </Pressable>

          <Pressable
            onPress={handleDemo}
            disabled={loading}
            style={({ pressed }) => [
              styles.secondaryBtn,
              { borderColor: colors.border, backgroundColor: colors.muted, opacity: pressed ? 0.8 : 1 },
            ]}
          >
            <Text style={[styles.secondaryBtnText, { color: colors.mutedForeground }]}>
              Try Demo Account
            </Text>
          </Pressable>
        </View>

        <Pressable
          onPress={() => router.push("/(auth)/register")}
          style={styles.signupLink}
        >
          <Text style={[styles.signupText, { color: colors.mutedForeground }]}>
            Don't have an account?{" "}
            <Text style={{ color: "#16A34A", fontFamily: "Inter_600SemiBold" }}>Sign up</Text>
          </Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    paddingHorizontal: 24,
  },
  logoArea: {
    alignItems: "center",
    marginBottom: 48,
    gap: 10,
  },
  logoMark: {
    width: 72,
    height: 72,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  appName: {
    fontSize: 30,
    fontFamily: "Inter_700Bold",
  },
  tagline: {
    fontSize: 15,
    fontFamily: "Inter_400Regular",
  },
  form: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontFamily: "Inter_500Medium",
    marginTop: 12,
    marginBottom: 4,
  },
  inputWrap: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1.5,
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 52,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 15,
    fontFamily: "Inter_400Regular",
  },
  eyeBtn: {
    padding: 4,
  },
  errorBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginTop: 4,
  },
  errorText: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
  },
  primaryBtn: {
    height: 54,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 20,
  },
  primaryBtnText: {
    color: "#fff",
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
  },
  secondaryBtn: {
    height: 52,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    marginTop: 10,
  },
  secondaryBtnText: {
    fontSize: 15,
    fontFamily: "Inter_500Medium",
  },
  signupLink: {
    alignItems: "center",
    marginTop: 32,
  },
  signupText: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
  },
});
