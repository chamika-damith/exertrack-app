import * as Database from "@/services/database";
import { WorkoutSession } from "@/types/user";
import createContextHook from "@nkzw/create-context-hook";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useUser } from "./UserContext";

export const [WorkoutHistoryProvider, useWorkoutHistory] = createContextHook(() => {
    const { user } = useUser();
    const [sessions, setSessions] = useState<WorkoutSession[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    const loadHistory = useCallback(async () => {
        if (!user) {
            setSessions([]);
            return;
        }

        try {
            setIsLoading(true);
            const history = await Database.getWorkouts(user.id);
            setSessions(history);
        } catch (error) {
            console.error("Error loading workout history:", error);
        } finally {
            setIsLoading(false);
        }
    }, [user]);

    useEffect(() => {
        loadHistory();
    }, [loadHistory]);

    const addSession = useCallback(async (session: WorkoutSession) => {
        if (!user) return { success: false, error: "No user logged in" };

        try {
            await Database.addWorkout(user.id, session);
            const updatedSessions = [session, ...sessions];
            setSessions(updatedSessions);
            return { success: true };
        } catch (error) {
            console.error("Error adding workout session:", error);
            return { success: false, error: "Failed to save session" };
        }
    }, [sessions, user]);

    const deleteSession = useCallback(async (sessionId: string) => {
        try {
            await Database.deleteWorkout(sessionId);
            const updatedSessions = sessions.filter(s => s.id !== sessionId);
            setSessions(updatedSessions);
            return { success: true };
        } catch (error) {
            console.error("Error deleting workout session:", error);
            return { success: false, error: "Failed to delete session" };
        }
    }, [sessions]);

    const clearHistory = useCallback(async () => {
        if (!user) return { success: false, error: "No user logged in" };

        try {
            await Database.clearWorkouts(user.id);
            setSessions([]);
            return { success: true };
        } catch (error) {
            console.error("Error clearing workout history:", error);
            return { success: false, error: "Failed to clear history" };
        }
    }, [user]);

    const recentSessions = useMemo(() => {
        return sessions.slice(0, 5);
    }, [sessions]);

    const totalWorkouts = useMemo(() => sessions.length, [sessions]);

    const averageAccuracy = useMemo(() => {
        if (sessions.length === 0) return 0;
        const sum = sessions.reduce((acc, s) => acc + s.averageAccuracy, 0);
        return Math.round(sum / sessions.length);
    }, [sessions]);

    const totalCaloriesBurned = useMemo(() => {
        return sessions.reduce((acc, s) => acc + s.caloriesBurned, 0);
    }, [sessions]);

    const getSessionsByDateRange = useCallback((startDate: Date, endDate: Date) => {
        return sessions.filter(s => {
            const sessionDate = new Date(s.date);
            return sessionDate >= startDate && sessionDate <= endDate;
        });
    }, [sessions]);

    const getSessionsByExercise = useCallback((exerciseId: string) => {
        return sessions.filter(s => s.exerciseId === exerciseId);
    }, [sessions]);

    return {
        sessions,
        recentSessions,
        isLoading,
        totalWorkouts,
        averageAccuracy,
        totalCaloriesBurned,
        addSession,
        deleteSession,
        clearHistory,
        getSessionsByDateRange,
        getSessionsByExercise,
    };
});
