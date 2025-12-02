import { UserProfile, UserSettings, WorkoutSession } from "@/types/user";
import * as SQLite from "expo-sqlite";

let db: SQLite.SQLiteDatabase;

export const initDatabase = async () => {
    db = await SQLite.openDatabaseAsync("exertrack.db");

    await db.execAsync(`
        PRAGMA journal_mode = WAL;
        CREATE TABLE IF NOT EXISTS users (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            email TEXT NOT NULL UNIQUE,
            password TEXT NOT NULL,
            memberSince TEXT NOT NULL,
            currentStreak INTEGER DEFAULT 0,
            totalWorkouts INTEGER DEFAULT 0,
            settings TEXT NOT NULL
        );
        CREATE TABLE IF NOT EXISTS workouts (
            id TEXT PRIMARY KEY,
            userId TEXT NOT NULL,
            exerciseId TEXT NOT NULL,
            exerciseName TEXT NOT NULL,
            date TEXT NOT NULL,
            duration INTEGER NOT NULL,
            repsCompleted INTEGER NOT NULL,
            averageAccuracy INTEGER NOT NULL,
            caloriesBurned INTEGER NOT NULL,
            formBreakdown TEXT NOT NULL,
            FOREIGN KEY (userId) REFERENCES users (id)
        );
    `);
    console.log("Database initialized");
};

// User Operations
export const createUser = async (user: UserProfile, passwordHash: string, settings: UserSettings) => {
    if (!db) await initDatabase();
    await db.runAsync(
        "INSERT INTO users (id, name, email, password, memberSince, currentStreak, totalWorkouts, settings) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
        user.id,
        user.name,
        user.email,
        passwordHash,
        user.memberSince,
        user.currentStreak,
        user.totalWorkouts,
        JSON.stringify(settings)
    );
};

export const getUser = async (email: string) => {
    if (!db) await initDatabase();
    const result = await db.getFirstAsync<{
        id: string;
        name: string;
        email: string;
        password: string;
        memberSince: string;
        currentStreak: number;
        totalWorkouts: number;
        settings: string;
    }>("SELECT * FROM users WHERE email = ?", email);

    if (result) {
        const user: UserProfile = {
            id: result.id,
            name: result.name,
            email: result.email,
            memberSince: result.memberSince,
            currentStreak: result.currentStreak,
            totalWorkouts: result.totalWorkouts,
        };
        const settings: UserSettings = JSON.parse(result.settings);
        return { user, settings, password: result.password };
    }
    return null;
};

export const updateUser = async (user: UserProfile) => {
    if (!db) await initDatabase();
    await db.runAsync(
        "UPDATE users SET name = ?, currentStreak = ?, totalWorkouts = ? WHERE id = ?",
        user.name,
        user.currentStreak,
        user.totalWorkouts,
        user.id
    );
};

export const updateSettings = async (userId: string, settings: UserSettings) => {
    if (!db) await initDatabase();
    await db.runAsync(
        "UPDATE users SET settings = ? WHERE id = ?",
        JSON.stringify(settings),
        userId
    );
};

// Workout Operations
export const addWorkout = async (userId: string, session: WorkoutSession) => {
    if (!db) await initDatabase();
    await db.runAsync(
        "INSERT INTO workouts (id, userId, exerciseId, exerciseName, date, duration, repsCompleted, averageAccuracy, caloriesBurned, formBreakdown) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
        session.id,
        userId,
        session.exerciseId,
        session.exerciseName,
        session.date,
        session.duration,
        session.repsCompleted,
        session.averageAccuracy,
        session.caloriesBurned,
        JSON.stringify(session.formBreakdown)
    );
};

export const getWorkouts = async (userId: string): Promise<WorkoutSession[]> => {
    if (!db) await initDatabase();
    const results = await db.getAllAsync<{
        id: string;
        exerciseId: string;
        exerciseName: string;
        date: string;
        duration: number;
        repsCompleted: number;
        averageAccuracy: number;
        caloriesBurned: number;
        formBreakdown: string;
    }>("SELECT * FROM workouts WHERE userId = ? ORDER BY date DESC", userId);

    return results.map(row => ({
        id: row.id,
        exerciseId: row.exerciseId,
        exerciseName: row.exerciseName,
        date: row.date,
        duration: row.duration,
        repsCompleted: row.repsCompleted,
        averageAccuracy: row.averageAccuracy,
        caloriesBurned: row.caloriesBurned,
        formBreakdown: JSON.parse(row.formBreakdown),
    }));
};

export const deleteWorkout = async (id: string) => {
    if (!db) await initDatabase();
    await db.runAsync("DELETE FROM workouts WHERE id = ?", id);
};

export const clearWorkouts = async (userId: string) => {
    if (!db) await initDatabase();
    await db.runAsync("DELETE FROM workouts WHERE userId = ?", userId);
};
