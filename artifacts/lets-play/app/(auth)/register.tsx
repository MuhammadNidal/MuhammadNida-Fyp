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

export default function RegisterScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { signUp } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleRegister = async () => {
    if (!name.trim() || !email.trim() || !password) {
      setError("Please fill in all fields");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    setError("");
    setLoading(true);
    try {
      await signUp(email.trim(), password, name.trim());
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.replace("/(auth)/onboarding");
    } catch (e: any) {
      setError(e.message ?? "Registration failed");
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
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
          { paddingTop: insets.top + 24, paddingBottom: insets.bottom + 32 },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Feather name="arrow-left" size={22} color={colors.foreground} />
        </Pressable>

        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.foreground }]}>Create account</Text>
          <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
            Join the community and find your next game
          </Text>
        </View>

        <View style={styles.form}>
          {[
            { label: "Full Name", value: name, onChange: setName, placeholder: "Your name", icon: "user" as const, type: "default" as const, auto: "name" as const },
            { label: "Email", value: email, onChange: setEmail, placeholder: "you@example.com", icon: "mail" as const, type: "email-address" as const, auto: "email" as const },
          ].map(({ label, value, onChange, placeholder, icon, type, auto }) => (
            <View key={label}>
              <Text style={[styles.label, { color: colors.foreground }]}>{label}</Text>
              <View style={[styles.inputWrap, { borderColor: colors.border, backgroundColor: colors.muted }]}>
                <Feather name={icon} size={18} color={colors.mutedForeground} style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, { color: colors.foreground }]}
                  placeholder={placeholder}
                  placeholderTextColor={colors.mutedForeground}
                  value={value}
                  onChangeText={onChange}
                  keyboardType={type}
                  autoCapitalize={type === "email-address" ? "none" : "words"}
                  autoComplete={auto}
                />
              </View>
            </View>
          ))}

          <Text style={[styles.label, { color: colors.foreground }]}>Password</Text>
          <View style={[styles.inputWrap, { borderColor: colors.border, backgroundColor: colors.muted }]}>
            <Feather name="lock" size={18} color={colors.mutedForeground} style={styles.inputIcon} />
            <TextInput
              style={[styles.input, { color: colors.foreground }]}
              placeholder="At least 6 characters"
              placeholderTextColor={colors.mutedForeground}
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              autoComplete="new-password"
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
            onPress={handleRegister}
            disabled={loading}
            style={({ pressed }) => [
              styles.primaryBtn,
              { backgroundColor: "#16A34A", opacity: pressed || loading ? 0.85 : 1 },
            ]}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.primaryBtnText}>Create Account</Text>
            )}
          </Pressable>
        </View>

        <Text style={[styles.terms, { color: colors.mutedForeground }]}>
          By creating an account, you agree to our Terms of Service and Privacy Policy.
        </Text>

        <Pressable onPress={() => router.back()} style={styles.loginLink}>
          <Text style={[styles.loginText, { color: colors.mutedForeground }]}>
            Already have an account?{" "}
            <Text style={{ color: "#16A34A", fontFamily: "Inter_600SemiBold" }}>Sign in</Text>
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
  backBtn: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  header: {
    marginBottom: 32,
    gap: 8,
  },
  title: {
    fontSize: 28,
    fontFamily: "Inter_700Bold",
  },
  subtitle: {
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
  terms: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
    marginTop: 20,
    lineHeight: 18,
  },
  loginLink: {
    alignItems: "center",
    marginTop: 16,
  },
  loginText: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
  },
});
