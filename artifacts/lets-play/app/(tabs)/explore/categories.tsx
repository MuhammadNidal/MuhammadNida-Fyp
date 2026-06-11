import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React from "react";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { SPORTS } from "@/constants/sports";

interface Category {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  bgColor: string;
}

const PLAYER_CATEGORIES: Category[] = [
  { id: "coaches", name: "Expert Coaches", description: "Learn proper technique and strategy from certified coaches.", icon: "award", color: "#8B5CF6", bgColor: "#F5F3FF" },
  { id: "pros", name: "Pro Athletes", description: "Challenge yourself against high-level professional players.", icon: "star", color: "#F97316", bgColor: "#FFF7ED" },
  { id: "verified", name: "Verified Stars", description: "Trusted community members with verified identities.", icon: "check-circle", color: "#10B981", bgColor: "#ECFDF5" },
  { id: "legends", name: "Local Legends", description: "Most active and reputable players in your neighborhood.", icon: "trending-up", color: "#2563EB", bgColor: "#EFF6FF" },
  { id: "multisport", name: "Multisport Masters", description: "Versatile athletes who excel in three or more sports.", icon: "layers", color: "#EC4899", bgColor: "#FDF2F8" },
  { id: "rising", name: "Rising Talent", description: "New players with exceptionally high ratings and potential.", icon: "zap", color: "#EAB308", bgColor: "#FEFCE8" },
  { id: "active", name: "Active Rookies", description: "Newcomers who are hitting the courts almost every day.", icon: "clock", color: "#06B6D4", bgColor: "#ECFEFF" },
  { id: "consistency", name: "Consistency Kings", description: "Players with the highest number of completed games.", icon: "repeat", color: "#16A34A", bgColor: "#F0FDF4" },
  { id: "friendly", name: "Friendly Beginners", description: "Perfect partners for those just starting their journey.", icon: "smile", color: "#F43F5E", bgColor: "#FFF1F2" },
  { id: "tournament", name: "Tournament Ready", description: "Competitive players looking for high-stakes matchplay.", icon: "target", color: "#374151", bgColor: "#F9FAFB" },
];

export default function CategoriesScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { type } = useLocalSearchParams<{ type: 'games' | 'players' }>();

  const data = type === 'games' ? SPORTS : PLAYER_CATEGORIES;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Feather name="arrow-left" size={22} color={colors.foreground} />
        </Pressable>
        <Text style={[styles.title, { color: colors.foreground }]}>
          {type === 'games' ? 'Sport Categories' : 'Player Categories'}
        </Text>
      </View>

      <FlatList
        data={data}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[styles.list, { paddingBottom: insets.bottom + 40 }]}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <Pressable
            onPress={() => {
               // Logic to navigate to filtered results
               router.push({ 
                  pathname: "/(tabs)/explore", 
                  params: { 
                     tab: type === 'games' ? 0 : 1, 
                     filter: item.id 
                  } 
               });
            }}
            style={({ pressed }) => [
              styles.card,
              { backgroundColor: colors.card, borderColor: colors.border, opacity: pressed ? 0.9 : 1 },
            ]}
          >
            <View style={[styles.iconBox, { backgroundColor: (item as any).bgColor || colors.muted }]}>
              {type === 'games' ? (
                 <MaterialCommunityIcons name={(item as any).iconName as any} size={30} color={(item as any).color} />
              ) : (
                 <Feather name={(item as any).icon} size={24} color={(item as any).color} />
              )}
            </View>
            <View style={styles.content}>
              <Text style={[styles.name, { color: colors.foreground }]}>{item.name}</Text>
              <Text style={[styles.desc, { color: colors.mutedForeground }]} numberOfLines={2}>
                {item.description}
              </Text>
            </View>
            <Feather name="chevron-right" size={20} color={colors.mutedForeground} />
          </Pressable>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 16,
    gap: 12,
  },
  backBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 20,
    fontFamily: 'Inter_700Bold',
  },
  list: {
    paddingHorizontal: 20,
    gap: 16,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    gap: 16,
  },
  iconBox: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    gap: 4,
  },
  name: {
    fontSize: 17,
    fontFamily: 'Inter_700Bold',
  },
  desc: {
    fontSize: 13,
    fontFamily: 'Inter_400Regular',
    lineHeight: 18,
  },
});
