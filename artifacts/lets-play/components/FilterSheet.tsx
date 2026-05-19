import { Feather } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { SPORTS, SKILL_LEVELS, AGE_GROUPS, PARTICIPATION_GROUPS } from "@/constants/sports";

export interface Filters {
  sport: string;
  skillLevel: string;
  ageGroup: string;
  participationGroup: string;
  type: string;
  paid: string;
}

const DEFAULT_FILTERS: Filters = {
  sport: "all",
  skillLevel: "all",
  ageGroup: "all",
  participationGroup: "all",
  type: "all",
  paid: "all",
};

interface FilterSheetProps {
  visible: boolean;
  onClose: () => void;
  filters: Filters;
  onApply: (f: Filters) => void;
}

function Chip({
  label,
  selected,
  onPress,
  color,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
  color?: string;
}) {
  const colors = useColors();
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.chip,
        {
          backgroundColor: selected ? (color ?? "#16A34A") + "18" : colors.muted,
          borderColor: selected ? (color ?? "#16A34A") : "transparent",
          borderWidth: 1.5,
        },
      ]}
    >
      <Text
        style={[
          styles.chipText,
          { color: selected ? (color ?? "#16A34A") : colors.mutedForeground },
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  const colors = useColors();
  return (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { color: colors.foreground }]}>{title}</Text>
      <View style={styles.chipRow}>{children}</View>
    </View>
  );
}

export function FilterSheet({ visible, onClose, filters, onApply }: FilterSheetProps) {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [local, setLocal] = useState<Filters>(filters);

  const reset = () => setLocal(DEFAULT_FILTERS);
  const apply = () => { onApply(local); onClose(); };

  const set = (key: keyof Filters, val: string) =>
    setLocal((prev) => ({ ...prev, [key]: val }));

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose} />
      <View
        style={[
          styles.sheet,
          { backgroundColor: colors.background, paddingBottom: insets.bottom + 16 },
        ]}
      >
        <View style={styles.handle} />
        <View style={styles.header}>
          <Text style={[styles.headerTitle, { color: colors.foreground }]}>Filters</Text>
          <Pressable onPress={reset}>
            <Text style={{ color: "#16A34A", fontFamily: "Inter_500Medium", fontSize: 14 }}>
              Reset
            </Text>
          </Pressable>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} style={styles.content}>
          <Section title="Sport">
            <Chip
              label="All"
              selected={local.sport === "all"}
              onPress={() => set("sport", "all")}
            />
            {SPORTS.map((s) => (
              <Chip
                key={s.id}
                label={s.name}
                selected={local.sport === s.id}
                onPress={() => set("sport", s.id)}
                color={s.color}
              />
            ))}
          </Section>

          <Section title="Activity Type">
            {[
              { id: "all", label: "All" },
              { id: "game", label: "Game" },
              { id: "lesson", label: "Lesson" },
              { id: "pro_game", label: "Pro Game" },
            ].map((t) => (
              <Chip
                key={t.id}
                label={t.label}
                selected={local.type === t.id}
                onPress={() => set("type", t.id)}
              />
            ))}
          </Section>

          <Section title="Cost">
            {[
              { id: "all", label: "All" },
              { id: "free", label: "Free" },
              { id: "paid", label: "Paid" },
            ].map((t) => (
              <Chip
                key={t.id}
                label={t.label}
                selected={local.paid === t.id}
                onPress={() => set("paid", t.id)}
              />
            ))}
          </Section>

          <Section title="Skill Level">
            {SKILL_LEVELS.map((s) => (
              <Chip
                key={s.id}
                label={s.label}
                selected={local.skillLevel === s.id}
                onPress={() => set("skillLevel", s.id)}
              />
            ))}
          </Section>

          <Section title="Age Group">
            {AGE_GROUPS.map((a) => (
              <Chip
                key={a.id}
                label={a.label}
                selected={local.ageGroup === a.id}
                onPress={() => set("ageGroup", a.id)}
              />
            ))}
          </Section>

          <Section title="Participation Group">
            {PARTICIPATION_GROUPS.map((p) => (
              <Chip
                key={p.id}
                label={p.label}
                selected={local.participationGroup === p.id}
                onPress={() => set("participationGroup", p.id)}
              />
            ))}
          </Section>
        </ScrollView>

        <Pressable
          onPress={apply}
          style={[styles.applyBtn, { backgroundColor: "#16A34A" }]}
        >
          <Text style={styles.applyText}>Apply Filters</Text>
        </Pressable>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  sheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 12,
    maxHeight: "85%",
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#D1D5DB",
    alignSelf: "center",
    marginBottom: 16,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: "Inter_700Bold",
  },
  content: {
    paddingHorizontal: 20,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
    marginBottom: 10,
  },
  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
  },
  chipText: {
    fontSize: 13,
    fontFamily: "Inter_500Medium",
  },
  applyBtn: {
    marginHorizontal: 20,
    marginTop: 16,
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: "center",
  },
  applyText: {
    color: "#fff",
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
  },
});
