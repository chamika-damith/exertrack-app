import * as Database from "@/services/database";
import { UserProfile, UserSettings } from "@/types/user";
import createContextHook from "@nkzw/create-context-hook";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useCallback, useEffect, useState } from "react";

const STORAGE_KEYS = {
    USER_ID: "@exertrack_user_id",
};

const DEFAULT_SETTINGS: UserSettings = {
    defaultRepCount: 10,
    restTimer: 60,
    voiceGuidance: true,
    cameraQuality: "high",
    skeletonOverlayStyle: "standard",
    feedbackSensitivity: "medium",
    notifications: {
        workoutReminders: true,
        progressMilestones: true,
    },
    darkMode: false,
};

export const [UserProvider, useUser] = createContextHook(() => {
    const [user, setUser] = useState<UserProfile | null>(null);
    const [settings, setSettings] = useState<UserSettings>(DEFAULT_SETTINGS);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);

    const loadUserData = useCallback(async () => {
        try {
            setIsLoading(true);
            await Database.initDatabase();
            const storedUserId = await AsyncStorage.getItem(STORAGE_KEYS.USER_ID);

            if (storedUserId) {
                // We need to fetch by ID, but currently getUser is by email. 
                // For now, let's assume we store email in AsyncStorage or update getUser to support ID.
                // Or simpler: store email in AsyncStorage as the session key.
                const storedEmail = await AsyncStorage.getItem("@exertrack_user_email");
                if (storedEmail) {
                    const data = await Database.getUser(storedEmail);
                    if (data) {
                        setUser(data.user);
                        setSettings(data.settings);
                        setIsLoggedIn(true);
                    }
                }
            }
        } catch (error) {
            console.error("Error loading user data:", error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        loadUserData();
    }, [loadUserData]);

    const login = useCallback(async (email: string, password: string) => {
        try {
            const data = await Database.getUser(email);

            if (data && data.password === password) { // In real app, verify hash
                setUser(data.user);
                setSettings(data.settings);
                setIsLoggedIn(true);
                await AsyncStorage.setItem(STORAGE_KEYS.USER_ID, data.user.id);
                await AsyncStorage.setItem("@exertrack_user_email", email);
                return { success: true };
            }

            return { success: false, error: "Invalid credentials" };
        } catch (error) {
            console.error("Login error:", error);
            return { success: false, error: "Login failed" };
        }
    }, []);

    const register = useCallback(async (userData: Omit<UserProfile, "id" | "memberSince" | "currentStreak" | "totalWorkouts"> & { password: string }) => {
        try {
            const newUser: UserProfile = {
                id: Date.now().toString(),
                name: userData.name,
                email: userData.email,
                memberSince: new Date().toISOString(),
                currentStreak: 0,
                totalWorkouts: 0,
            };

            await Database.createUser(newUser, userData.password, DEFAULT_SETTINGS); // In real app, hash password

            setUser(newUser);
            setSettings(DEFAULT_SETTINGS);
            setIsLoggedIn(true);
            await AsyncStorage.setItem(STORAGE_KEYS.USER_ID, newUser.id);
            await AsyncStorage.setItem("@exertrack_user_email", newUser.email);

            return { success: true };
        } catch (error) {
            console.error("Registration error:", error);
            return { success: false, error: "Registration failed" };
        }
    }, []);

    const logout = useCallback(async () => {
        try {
            await AsyncStorage.removeItem(STORAGE_KEYS.USER_ID);
            await AsyncStorage.removeItem("@exertrack_user_email");
            setUser(null);
            setIsLoggedIn(false);
            return { success: true };
        } catch (error) {
            console.error("Logout error:", error);
            return { success: false, error: "Logout failed" };
        }
    }, []);

    const updateProfile = useCallback(async (updates: Partial<UserProfile>) => {
        try {
            if (!user) return { success: false, error: "No user logged in" };

            const updatedUser = { ...user, ...updates };
            await Database.updateUser(updatedUser);
            setUser(updatedUser);

            return { success: true };
        } catch (error) {
            console.error("Profile update error:", error);
            return { success: false, error: "Update failed" };
        }
    }, [user]);

    const updateSettings = useCallback(async (updates: Partial<UserSettings>) => {
        try {
            if (!user) return { success: false, error: "No user logged in" };

            const updatedSettings = { ...settings, ...updates };
            await Database.updateSettings(user.id, updatedSettings);
            setSettings(updatedSettings);

            return { success: true };
        } catch (error) {
            console.error("Settings update error:", error);
            return { success: false, error: "Update failed" };
        }
    }, [user, settings]);

    const incrementWorkoutCount = useCallback(async () => {
        if (!user) return;

        const updatedUser = {
            ...user,
            totalWorkouts: user.totalWorkouts + 1,
        };

        await Database.updateUser(updatedUser);
        setUser(updatedUser);
    }, [user]);

    return {
        user,
        settings,
        isLoading,
        isLoggedIn,
        login,
        register,
        logout,
        updateProfile,
        updateSettings,
        incrementWorkoutCount,
    };
});
