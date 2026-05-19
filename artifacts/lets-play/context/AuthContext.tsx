import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import { User } from "@/types";
import { MOCK_USERS } from "@/constants/mockData";

const ALL_USERS_KEY = "letsplay_all_users";
const CURRENT_USER_KEY = "letsplay_current_user";

interface AuthContextType {
  currentUser: User | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
  followUser: (userId: string) => Promise<void>;
  unfollowUser: (userId: string) => Promise<void>;
  completeOnboarding: (data: Partial<User>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadUser() {
      try {
        const usersRaw = await AsyncStorage.getItem(ALL_USERS_KEY);
        if (!usersRaw) {
          await AsyncStorage.setItem(ALL_USERS_KEY, JSON.stringify(MOCK_USERS));
        }
        const savedId = await AsyncStorage.getItem(CURRENT_USER_KEY);
        if (savedId) {
          const allUsersRaw = await AsyncStorage.getItem(ALL_USERS_KEY);
          const allUsers: User[] = JSON.parse(allUsersRaw || "[]");
          const user = allUsers.find((u) => u.id === savedId);
          if (user) setCurrentUser(user);
        }
      } catch {
      } finally {
        setIsLoading(false);
      }
    }
    loadUser();
  }, []);

  const getAllUsers = useCallback(async (): Promise<User[]> => {
    const raw = await AsyncStorage.getItem(ALL_USERS_KEY);
    return raw ? JSON.parse(raw) : MOCK_USERS;
  }, []);

  const saveAllUsers = useCallback(async (users: User[]) => {
    await AsyncStorage.setItem(ALL_USERS_KEY, JSON.stringify(users));
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    const users = await getAllUsers();
    const user = users.find(
      (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password
    );
    if (!user) throw new Error("Invalid email or password");
    await AsyncStorage.setItem(CURRENT_USER_KEY, user.id);
    setCurrentUser(user);
  }, [getAllUsers]);

  const signUp = useCallback(async (email: string, password: string, name: string) => {
    const users = await getAllUsers();
    if (users.find((u) => u.email.toLowerCase() === email.toLowerCase())) {
      throw new Error("An account with this email already exists");
    }
    const newUser: User = {
      id: `user_${Date.now()}`,
      name,
      username: name.toLowerCase().replace(/\s+/g, "_") + Math.floor(Math.random() * 999),
      email,
      password,
      role: "player",
      sports: [],
      location: "",
      bio: "",
      verificationStatus: "none",
      followingIds: [],
      rating: 0,
      gamesPlayed: 0,
      onboardingComplete: false,
    };
    await saveAllUsers([...users, newUser]);
    await AsyncStorage.setItem(CURRENT_USER_KEY, newUser.id);
    setCurrentUser(newUser);
  }, [getAllUsers, saveAllUsers]);

  const signOut = useCallback(async () => {
    await AsyncStorage.removeItem(CURRENT_USER_KEY);
    setCurrentUser(null);
  }, []);

  const updateProfile = useCallback(async (data: Partial<User>) => {
    if (!currentUser) return;
    const users = await getAllUsers();
    const updated = { ...currentUser, ...data };
    const newUsers = users.map((u) => (u.id === currentUser.id ? updated : u));
    await saveAllUsers(newUsers);
    setCurrentUser(updated);
  }, [currentUser, getAllUsers, saveAllUsers]);

  const completeOnboarding = useCallback(async (data: Partial<User>) => {
    await updateProfile({ ...data, onboardingComplete: true });
  }, [updateProfile]);

  const followUser = useCallback(async (userId: string) => {
    if (!currentUser) return;
    const followingIds = currentUser.followingIds.includes(userId)
      ? currentUser.followingIds
      : [...currentUser.followingIds, userId];
    await updateProfile({ followingIds });
  }, [currentUser, updateProfile]);

  const unfollowUser = useCallback(async (userId: string) => {
    if (!currentUser) return;
    const followingIds = currentUser.followingIds.filter((id) => id !== userId);
    await updateProfile({ followingIds });
  }, [currentUser, updateProfile]);

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        isLoading,
        signIn,
        signUp,
        signOut,
        updateProfile,
        followUser,
        unfollowUser,
        completeOnboarding,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
