export type FitnessGoal = "weight_loss" | "muscle_gain" | "general_fitness" | "rehabilitation";

export interface UserProfile {
    id: string;
    name: string;
    email: string;
    age?: number;
    height?: number;
    weight?: number;
    fitnessGoal?: FitnessGoal;
    avatar?: string;
    memberSince: string;
    currentStreak: number;
    totalWorkouts: number;
}

export interface WorkoutSession {
    id: string;
    exerciseId: string;
    exerciseName: string;
    date: string;
    duration: number;
    repsCompleted: number;
    averageAccuracy: number;
    caloriesBurned: number;
    formBreakdown: {
        correctReps: number;
        incorrectReps: number;
    };
}

export interface UserSettings {
    defaultRepCount: number;
    restTimer: number;
    voiceGuidance: boolean;
    cameraQuality: "low" | "medium" | "high";
    skeletonOverlayStyle: "minimal" | "standard" | "detailed";
    feedbackSensitivity: "low" | "medium" | "high";
    notifications: {
        workoutReminders: boolean;
        progressMilestones: boolean;
    };
    darkMode: boolean;
}
