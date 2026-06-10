import { Feather } from "@expo/vector-icons";
import React from "react";
import { Platform, Pressable, StyleSheet, Text, View } from "react-native";
import { useColors } from "@/hooks/useColors";

const links = [
  { label: "About", icon: "info" as const },
  { label: "Terms", icon: "file-text" as const },
  { label: "Privacy", icon: "lock" as const },
  { label: "Contact", icon: "mail" as const },
];

export function Footer() {
  const colors = useColors();
  if (Platform.OS !== "web") return null;

  return (
    <View style={[styles.footer, { backgroundColor: colors.card, borderTopColor: colors.border }]}>
      <View style={styles.inner}>
        <View style={styles.brand}>
          <View style={[styles.logo, { backgroundColor: colors.primary }]}>
            <Feather name="play" size={12} color="#fff" />
          </View>
          <Text style={[styles.brandText, { color: colors.mutedForeground }]}>
            Play Connect
          </Text>
        </View>
        <View style={styles.links}>
          {links.map((link) => (
            <Pressable key={link.label} style={styles.linkBtn}>
              <Feather name={link.icon} size={12} color={colors.mutedForeground} />
              <Text style={[styles.linkText, { color: colors.mutedForeground }]}>
                {link.label}
              </Text>
            </Pressable>
          ))}
        </View>
        <Text style={[styles.copy, { color: colors.mutedForeground }]}>
          © {new Date().getFullYear()} Play Connect. All rights reserved.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  footer: {
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingVertical: 24,
    paddingHorizontal: 20,
  },
  inner: {
    alignItems: "center",
    gap: 16,
  },
  brand: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  logo: {
    width: 24,
    height: 24,
    borderRadius: 7,
    alignItems: "center",
    justifyContent: "center",
  },
  brandText: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
  },
  links: {
    flexDirection: "row",
    gap: 24,
  },
  linkBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  linkText: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
  },
  copy: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
  },
});
