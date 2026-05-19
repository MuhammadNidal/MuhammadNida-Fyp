import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useColors } from "@/hooks/useColors";

interface SegmentedControlProps {
  options: string[];
  selectedIndex: number;
  onChange: (index: number) => void;
}

export function SegmentedControl({ options, selectedIndex, onChange }: SegmentedControlProps) {
  const colors = useColors();

  return (
    <View style={[styles.container, { backgroundColor: colors.muted }]}>
      {options.map((opt, i) => (
        <Pressable
          key={opt}
          onPress={() => onChange(i)}
          style={[
            styles.tab,
            selectedIndex === i && [
              styles.activeTab,
              { backgroundColor: colors.background, shadowColor: colors.foreground },
            ],
          ]}
        >
          <Text
            style={[
              styles.label,
              { color: selectedIndex === i ? colors.foreground : colors.mutedForeground },
            ]}
          >
            {opt}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    borderRadius: 10,
    padding: 3,
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: "center",
  },
  activeTab: {
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  label: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
  },
});
