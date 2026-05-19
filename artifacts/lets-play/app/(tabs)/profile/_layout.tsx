import { Stack } from "expo-router";

export default function ProfileLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="edit" options={{ presentation: "modal" }} />
      <Stack.Screen name="settings" options={{ presentation: "card" }} />
      <Stack.Screen name="verify" options={{ presentation: "card" }} />
    </Stack>
  );
}
