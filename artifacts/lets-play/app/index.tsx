import { Redirect } from "expo-router";
import { useAuth } from "@/context/AuthContext";

export default function Index() {
  const { currentUser, isLoading } = useAuth();

  if (isLoading) return null;

  if (!currentUser) {
    return <Redirect href="/(auth)/login" />;
  }

  if (!currentUser.onboardingComplete) {
    return <Redirect href="/(auth)/onboarding" />;
  }

  return <Redirect href="/(tabs)/explore" />;
}
