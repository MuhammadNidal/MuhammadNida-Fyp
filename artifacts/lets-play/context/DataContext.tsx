import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import { Game, Conversation, User } from "@/types";
import { MOCK_GAMES, MOCK_CONVERSATIONS } from "@/constants/mockData";
import { useAuth } from "./AuthContext";

const GAMES_KEY = "letsplay_games";
const CONVOS_KEY = "letsplay_conversations";

interface DataContextType {
  games: Game[];
  conversations: Conversation[];
  isLoading: boolean;
  getAllUsers: () => Promise<User[]>;
  createGame: (game: Omit<Game, "id" | "participants" | "messages" | "status">) => Promise<void>;
  joinGame: (gameId: string) => Promise<void>;
  leaveGame: (gameId: string) => Promise<void>;
  sendGameMessage: (gameId: string, body: string) => Promise<void>;
  hideGameMessage: (gameId: string, messageId: string) => Promise<void>;
  getGameById: (id: string) => Game | undefined;
  getOrCreateConversation: (userId: string) => Promise<Conversation>;
  sendDirectMessage: (conversationId: string, content: string) => Promise<void>;
  refreshGames: () => Promise<void>;
  refreshConversations: () => Promise<void>;
  transferOrganizer: (gameId: string, newOrganizerId: string) => Promise<void>;
}

const DataContext = createContext<DataContextType | null>(null);

export function DataProvider({ children }: { children: React.ReactNode }) {
  const { currentUser } = useAuth();
  const [games, setGames] = useState<Game[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const gamesRaw = await AsyncStorage.getItem(GAMES_KEY);
      if (!gamesRaw) {
        await AsyncStorage.setItem(GAMES_KEY, JSON.stringify(MOCK_GAMES));
        setGames(MOCK_GAMES);
      } else {
        const storedGames: Game[] = JSON.parse(gamesRaw);
        // Merge imageUrl from MOCK_GAMES if missing in stored games
        const updatedGames = storedGames.map(sg => {
          const mock = MOCK_GAMES.find(mg => mg.id === sg.id);
          if (mock && !sg.imageUrl) {
            return { ...sg, imageUrl: mock.imageUrl };
          }
          return sg;
        });
        setGames(updatedGames);
      }

      const convosRaw = await AsyncStorage.getItem(CONVOS_KEY);
      if (!convosRaw) {
        const seeded = MOCK_CONVERSATIONS.map((c) => ({
          ...c,
          participantIds: c.participantIds.map((id) =>
            id === "CURRENT_USER" ? currentUser?.id ?? id : id
          ),
          messages: c.messages.map((m) => ({
            ...m,
            senderId: m.senderId === "CURRENT_USER" ? currentUser?.id ?? m.senderId : m.senderId,
          })),
        }));
        await AsyncStorage.setItem(CONVOS_KEY, JSON.stringify(seeded));
        setConversations(seeded);
      } else {
        setConversations(JSON.parse(convosRaw));
      }
    } catch {
      setGames(MOCK_GAMES);
    } finally {
      setIsLoading(false);
    }
  }, [currentUser?.id]);

  useEffect(() => {
    if (currentUser) loadData();
    else {
      setGames([]);
      setConversations([]);
    }
  }, [currentUser, loadData]);

  const saveGames = useCallback(async (updated: Game[]) => {
    await AsyncStorage.setItem(GAMES_KEY, JSON.stringify(updated));
    setGames(updated);
  }, []);

  const saveConversations = useCallback(async (updated: Conversation[]) => {
    await AsyncStorage.setItem(CONVOS_KEY, JSON.stringify(updated));
    setConversations(updated);
  }, []);

  const getAllUsers = useCallback(async (): Promise<User[]> => {
    const raw = await AsyncStorage.getItem("letsplay_all_users");
    return raw ? JSON.parse(raw) : [];
  }, []);

  const refreshGames = useCallback(async () => {
    const raw = await AsyncStorage.getItem(GAMES_KEY);
    if (raw) setGames(JSON.parse(raw));
  }, []);

  const refreshConversations = useCallback(async () => {
    const raw = await AsyncStorage.getItem(CONVOS_KEY);
    if (raw) setConversations(JSON.parse(raw));
  }, []);

  const getGameById = useCallback((id: string) => games.find((g) => g.id === id), [games]);

  const createGame = useCallback(
    async (data: Omit<Game, "id" | "participants" | "messages" | "status">) => {
      if (!currentUser) return;
      const newGame: Game = {
        ...data,
        id: `game_${Date.now()}`,
        participants: [currentUser.id],
        messages: [],
        status: "active",
      };
      await saveGames([...games, newGame]);
    },
    [currentUser, games, saveGames]
  );

  const joinGame = useCallback(
    async (gameId: string) => {
      if (!currentUser) return;
      const updated = games.map((g) => {
        if (g.id !== gameId) return g;
        if (g.participants.includes(currentUser.id)) return g;
        return { ...g, participants: [...g.participants, currentUser.id] };
      });
      await saveGames(updated);
    },
    [currentUser, games, saveGames]
  );

  const leaveGame = useCallback(
    async (gameId: string) => {
      if (!currentUser) return;
      const updated = games.map((g) => {
        if (g.id !== gameId) return g;
        return { ...g, participants: g.participants.filter((id) => id !== currentUser.id) };
      });
      await saveGames(updated);
    },
    [currentUser, games, saveGames]
  );

  const sendGameMessage = useCallback(
    async (gameId: string, body: string) => {
      if (!currentUser) return;
      const msg = {
        id: `msg_${Date.now()}`,
        senderId: currentUser.id,
        body,
        createdAt: new Date().toISOString(),
        isHidden: false,
      };
      const updated = games.map((g) => {
        if (g.id !== gameId) return g;
        return { ...g, messages: [...g.messages, msg] };
      });
      await saveGames(updated);
    },
    [currentUser, games, saveGames]
  );

  const hideGameMessage = useCallback(
    async (gameId: string, messageId: string) => {
      const updated = games.map((g) => {
        if (g.id !== gameId) return g;
        return {
          ...g,
          messages: g.messages.map((m) =>
            m.id === messageId ? { ...m, isHidden: true } : m
          ),
        };
      });
      await saveGames(updated);
    },
    [games, saveGames]
  );

  const transferOrganizer = useCallback(
    async (gameId: string, newOrganizerId: string) => {
      const updated = games.map((g) =>
        g.id !== gameId ? g : { ...g, organizerId: newOrganizerId }
      );
      await saveGames(updated);
    },
    [games, saveGames]
  );

  const getOrCreateConversation = useCallback(
    async (userId: string): Promise<Conversation> => {
      if (!currentUser) throw new Error("Not authenticated");
      const existing = conversations.find(
        (c) =>
          c.type === "direct" &&
          c.participantIds.includes(currentUser.id) &&
          c.participantIds.includes(userId)
      );
      if (existing) return existing;
      const newConvo: Conversation = {
        id: `conv_${Date.now()}`,
        type: "direct",
        participantIds: [currentUser.id, userId],
        messages: [],
        lastMessageAt: new Date().toISOString(),
      };
      await saveConversations([...conversations, newConvo]);
      return newConvo;
    },
    [currentUser, conversations, saveConversations]
  );

  const sendDirectMessage = useCallback(
    async (conversationId: string, content: string) => {
      if (!currentUser) return;
      const msg = {
        id: `dm_${Date.now()}`,
        senderId: currentUser.id,
        content,
        createdAt: new Date().toISOString(),
      };
      const updated = conversations.map((c) => {
        if (c.id !== conversationId) return c;
        return {
          ...c,
          messages: [...c.messages, msg],
          lastMessageAt: msg.createdAt,
        };
      });
      await saveConversations(updated);
    },
    [currentUser, conversations, saveConversations]
  );

  return (
    <DataContext.Provider
      value={{
        games,
        conversations,
        isLoading,
        getAllUsers,
        createGame,
        joinGame,
        leaveGame,
        sendGameMessage,
        hideGameMessage,
        getGameById,
        getOrCreateConversation,
        sendDirectMessage,
        refreshGames,
        refreshConversations,
        transferOrganizer,
      }}
    >
      {children}
    </DataContext.Provider>
  );
}

export function useData(): DataContextType {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error("useData must be used within DataProvider");
  return ctx;
}
