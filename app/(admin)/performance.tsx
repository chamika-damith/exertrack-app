import {
    Award,
    Calendar,
    ChevronRight,
    Search,
    TrendingUp,
    User,
} from "lucide-react-native";
import React, { useState } from "react";
import {
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type UserPerformance = {
    id: string;
    userName: string;
    email: string;
    totalWorkouts: number;
    averageAccuracy: number;
    lastWorkout: string;
    improvement: number;
    exercisesCompleted: {
        name: string;
        accuracy: number;
        date: string;
    }[];
};

type ExerciseStats = {
    exerciseName: string;
    totalAttempts: number;
    averageAccuracy: number;
    users: number;
};

export default function PerformanceScreen() {
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedTab, setSelectedTab] = useState<"users" | "exercises">("users");

    const [userPerformance] = useState<UserPerformance[]>([
        {
            id: "1",
            userName: "John Doe",
            email: "john@example.com",
            totalWorkouts: 45,
            averageAccuracy: 87.5,
            lastWorkout: "2025-01-27",
            improvement: 12.3,
            exercisesCompleted: [
                { name: "Squat", accuracy: 89, date: "2025-01-27" },
                { name: "Push-up", accuracy: 92, date: "2025-01-26" },
                { name: "Plank", accuracy: 85, date: "2025-01-25" },
            ],
        },
        {
            id: "2",
            userName: "Sarah Smith",
            email: "sarah@example.com",
            totalWorkouts: 62,
            averageAccuracy: 91.2,
            lastWorkout: "2025-01-27",
            improvement: 8.7,
            exercisesCompleted: [
                { name: "Lunge", accuracy: 93, date: "2025-01-27" },
                { name: "Squat", accuracy: 90, date: "2025-01-26" },
                { name: "Burpee", accuracy: 88, date: "2025-01-25" },
            ],
        },
        {
            id: "3",
            userName: "Mike Johnson",
            email: "mike@example.com",
            totalWorkouts: 38,
            averageAccuracy: 83.8,
            lastWorkout: "2025-01-26",
            improvement: 15.2,
            exercisesCompleted: [
                { name: "Push-up", accuracy: 85, date: "2025-01-26" },
                { name: "Plank", accuracy: 82, date: "2025-01-25" },
                { name: "Squat", accuracy: 84, date: "2025-01-24" },
            ],
        },
        {
            id: "4",
            userName: "Emily Davis",
            email: "emily@example.com",
            totalWorkouts: 71,
            averageAccuracy: 94.1,
            lastWorkout: "2025-01-27",
            improvement: 6.5,
            exercisesCompleted: [
                { name: "Deadlift", accuracy: 96, date: "2025-01-27" },
                { name: "Squat", accuracy: 95, date: "2025-01-27" },
                { name: "Lunge", accuracy: 91, date: "2025-01-26" },
            ],
        },
    ]);

    const [exerciseStats] = useState<ExerciseStats[]>([
        {
            exerciseName: "Squat",
            totalAttempts: 342,
            averageAccuracy: 88.5,
            users: 156,
        },
        {
            exerciseName: "Push-up",
            totalAttempts: 289,
            averageAccuracy: 85.3,
            users: 142,
        },
        {
            exerciseName: "Plank",
            totalAttempts: 267,
            averageAccuracy: 90.1,
            users: 138,
        },
        {
            exerciseName: "Lunge",
            totalAttempts: 198,
            averageAccuracy: 86.7,
            users: 98,
        },
        {
            exerciseName: "Burpee",
            totalAttempts: 156,
            averageAccuracy: 81.2,
            users: 78,
        },
        {
            exerciseName: "Deadlift",
            totalAttempts: 145,
            averageAccuracy: 89.8,
            users: 72,
        },
    ]);

    const filteredUsers = userPerformance.filter(
        (user) =>
            user.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            user.email.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const filteredExercises = exerciseStats.filter((exercise) =>
        exercise.exerciseName.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const getAccuracyColor = (accuracy: number) => {
        if (accuracy >= 90) return "#00C853";
        if (accuracy >= 80) return "#FFC107";
        return "#FF5252";
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" />
            <SafeAreaView style={styles.safeArea}>
                <View style={styles.header}>
                    <Text style={styles.headerTitle}>Performance Analytics</Text>
                    <Text style={styles.headerSubtitle}>
                        Track user progress and exercise statistics
                    </Text>
                </View>

                <View style={styles.tabContainer}>
                    <TouchableOpacity
                        style={[styles.tab, selectedTab === "users" && styles.tabActive]}
                        onPress={() => setSelectedTab("users")}
                        activeOpacity={0.7}
                    >
                        <User
                            color={selectedTab === "users" ? "#00A8E8" : "#666"}
                            size={20}
                        />
                        <Text
                            style={[styles.tabText, selectedTab === "users" && styles.tabTextActive]}
                        >
                            Users
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.tab, selectedTab === "exercises" && styles.tabActive]}
                        onPress={() => setSelectedTab("exercises")}
                        activeOpacity={0.7}
                    >
                        <TrendingUp
                            color={selectedTab === "exercises" ? "#00A8E8" : "#666"}
                            size={20}
                        />
                        <Text
                            style={[
                                styles.tabText,
                                selectedTab === "exercises" && styles.tabTextActive,
                            ]}
                        >
                            Exercises
                        </Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.searchContainer}>
                    <Search color="#666" size={20} style={styles.searchIcon} />
                    <TextInput
                        style={styles.searchInput}
                        placeholder={`Search ${selectedTab}...`}
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        placeholderTextColor="#999"
                    />
                </View>

                {selectedTab === "users" ? (
                    <ScrollView
                        style={styles.scrollView}
                        contentContainerStyle={styles.scrollContent}
                        showsVerticalScrollIndicator={false}
                    >
                        <View style={styles.statsGrid}>
                            <View style={styles.statCard}>
                                <View style={styles.statIconContainer}>
                                    <User color="#00A8E8" size={24} />
                                </View>
                                <Text style={styles.statValue}>
                                    {userPerformance.length}
                                </Text>
                                <Text style={styles.statLabel}>Total Users</Text>
                            </View>

                            <View style={styles.statCard}>
                                <View style={styles.statIconContainer}>
                                    <TrendingUp color="#00C853" size={24} />
                                </View>
                                <Text style={styles.statValue}>
                                    {(
                                        userPerformance.reduce(
                                            (sum, u) => sum + u.averageAccuracy,
                                            0
                                        ) / userPerformance.length
                                    ).toFixed(1)}
                                    %
                                </Text>
                                <Text style={styles.statLabel}>Avg Accuracy</Text>
                            </View>

                            <View style={styles.statCard}>
                                <View style={styles.statIconContainer}>
                                    <Award color="#FFC107" size={24} />
                                </View>
                                <Text style={styles.statValue}>
                                    {userPerformance.reduce((sum, u) => sum + u.totalWorkouts, 0)}
                                </Text>
                                <Text style={styles.statLabel}>Total Workouts</Text>
                            </View>
                        </View>

                        {filteredUsers.map((user) => (
                            <View key={user.id} style={styles.userCard}>
                                <View style={styles.userHeader}>
                                    <View style={styles.userAvatar}>
                                        <Text style={styles.userAvatarText}>
                                            {user.userName.charAt(0)}
                                        </Text>
                                    </View>
                                    <View style={styles.userInfo}>
                                        <Text style={styles.userName}>{user.userName}</Text>
                                        <Text style={styles.userEmail}>{user.email}</Text>
                                    </View>
                                    <ChevronRight color="#ccc" size={20} />
                                </View>

                                <View style={styles.userStats}>
                                    <View style={styles.userStatItem}>
                                        <Text style={styles.userStatLabel}>Workouts</Text>
                                        <Text style={styles.userStatValue}>
                                            {user.totalWorkouts}
                                        </Text>
                                    </View>
                                    <View style={styles.userStatDivider} />
                                    <View style={styles.userStatItem}>
                                        <Text style={styles.userStatLabel}>Avg Accuracy</Text>
                                        <Text
                                            style={[
                                                styles.userStatValue,
                                                { color: getAccuracyColor(user.averageAccuracy) },
                                            ]}
                                        >
                                            {user.averageAccuracy}%
                                        </Text>
                                    </View>
                                    <View style={styles.userStatDivider} />
                                    <View style={styles.userStatItem}>
                                        <Text style={styles.userStatLabel}>Improvement</Text>
                                        <Text
                                            style={[styles.userStatValue, { color: "#00C853" }]}
                                        >
                                            +{user.improvement}%
                                        </Text>
                                    </View>
                                </View>

                                <View style={styles.lastWorkoutContainer}>
                                    <Calendar color="#666" size={16} />
                                    <Text style={styles.lastWorkoutText}>
                                        Last workout: {user.lastWorkout}
                                    </Text>
                                </View>

                                <View style={styles.recentExercises}>
                                    <Text style={styles.recentExercisesTitle}>
                                        Recent Exercises
                                    </Text>
                                    {user.exercisesCompleted.slice(0, 3).map((exercise, idx) => (
                                        <View key={idx} style={styles.recentExerciseItem}>
                                            <Text style={styles.recentExerciseName}>
                                                {exercise.name}
                                            </Text>
                                            <View style={styles.recentExerciseRight}>
                                                <Text
                                                    style={[
                                                        styles.recentExerciseAccuracy,
                                                        { color: getAccuracyColor(exercise.accuracy) },
                                                    ]}
                                                >
                                                    {exercise.accuracy}%
                                                </Text>
                                                <Text style={styles.recentExerciseDate}>
                                                    {exercise.date}
                                                </Text>
                                            </View>
                                        </View>
                                    ))}
                                </View>
                            </View>
                        ))}
                    </ScrollView>
                ) : (
                    <ScrollView
                        style={styles.scrollView}
                        contentContainerStyle={styles.scrollContent}
                        showsVerticalScrollIndicator={false}
                    >
                        <View style={styles.statsGrid}>
                            <View style={styles.statCard}>
                                <View style={styles.statIconContainer}>
                                    <Award color="#00A8E8" size={24} />
                                </View>
                                <Text style={styles.statValue}>
                                    {exerciseStats.reduce((sum, e) => sum + e.totalAttempts, 0)}
                                </Text>
                                <Text style={styles.statLabel}>Total Attempts</Text>
                            </View>

                            <View style={styles.statCard}>
                                <View style={styles.statIconContainer}>
                                    <TrendingUp color="#00C853" size={24} />
                                </View>
                                <Text style={styles.statValue}>
                                    {(
                                        exerciseStats.reduce(
                                            (sum, e) => sum + e.averageAccuracy,
                                            0
                                        ) / exerciseStats.length
                                    ).toFixed(1)}
                                    %
                                </Text>
                                <Text style={styles.statLabel}>Avg Accuracy</Text>
                            </View>

                            <View style={styles.statCard}>
                                <View style={styles.statIconContainer}>
                                    <User color="#FFC107" size={24} />
                                </View>
                                <Text style={styles.statValue}>
                                    {Math.max(...exerciseStats.map((e) => e.users))}
                                </Text>
                                <Text style={styles.statLabel}>Most Users</Text>
                            </View>
                        </View>

                        {filteredExercises.map((exercise, index) => (
                            <View key={index} style={styles.exerciseCard}>
                                <View style={styles.exerciseHeader}>
                                    <View style={styles.exerciseRank}>
                                        <Text style={styles.exerciseRankText}>#{index + 1}</Text>
                                    </View>
                                    <View style={styles.exerciseInfo}>
                                        <Text style={styles.exerciseName}>
                                            {exercise.exerciseName}
                                        </Text>
                                        <Text style={styles.exerciseUsers}>
                                            {exercise.users} users
                                        </Text>
                                    </View>
                                </View>

                                <View style={styles.exerciseStats}>
                                    <View style={styles.exerciseStatItem}>
                                        <Text style={styles.exerciseStatLabel}>Total Attempts</Text>
                                        <Text style={styles.exerciseStatValue}>
                                            {exercise.totalAttempts}
                                        </Text>
                                    </View>

                                    <View style={styles.exerciseStatItem}>
                                        <Text style={styles.exerciseStatLabel}>
                                            Average Accuracy
                                        </Text>
                                        <View style={styles.accuracyContainer}>
                                            <View style={styles.accuracyBarBackground}>
                                                <View
                                                    style={[
                                                        styles.accuracyBarFill,
                                                        {
                                                            width: `${exercise.averageAccuracy}%`,
                                                            backgroundColor: getAccuracyColor(
                                                                exercise.averageAccuracy
                                                            ),
                                                        },
                                                    ]}
                                                />
                                            </View>
                                            <Text
                                                style={[
                                                    styles.exerciseStatValue,
                                                    { color: getAccuracyColor(exercise.averageAccuracy) },
                                                ]}
                                            >
                                                {exercise.averageAccuracy}%
                                            </Text>
                                        </View>
                                    </View>
                                </View>
                            </View>
                        ))}
                    </ScrollView>
                )}
            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#f5f5f5",
    },
    safeArea: {
        flex: 1,
    },
    header: {
        paddingHorizontal: 24,
        paddingTop: 16,
        paddingBottom: 8,
        backgroundColor: "#fff",
        borderBottomWidth: 1,
        borderBottomColor: "#e0e0e0",
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: "800" as const,
        color: "#1a1a1a",
        marginBottom: 4,
    },
    headerSubtitle: {
        fontSize: 14,
        color: "#666",
        lineHeight: 20,
    },
    tabContainer: {
        flexDirection: "row",
        marginHorizontal: 24,
        marginTop: 16,
        backgroundColor: "#f0f0f0",
        borderRadius: 12,
        padding: 4,
    },
    tab: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 12,
        borderRadius: 10,
        gap: 8,
    },
    tabActive: {
        backgroundColor: "#fff",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    tabText: {
        fontSize: 15,
        fontWeight: "600" as const,
        color: "#666",
    },
    tabTextActive: {
        color: "#00A8E8",
    },
    searchContainer: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#fff",
        marginHorizontal: 24,
        marginTop: 16,
        paddingHorizontal: 16,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: "#e0e0e0",
    },
    searchIcon: {
        marginRight: 8,
    },
    searchInput: {
        flex: 1,
        height: 48,
        fontSize: 16,
        color: "#1a1a1a",
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        padding: 24,
    },
    statsGrid: {
        flexDirection: "row",
        gap: 12,
        marginBottom: 24,
    },
    statCard: {
        flex: 1,
        backgroundColor: "#fff",
        borderRadius: 16,
        padding: 16,
        alignItems: "center",
        borderWidth: 1,
        borderColor: "#e0e0e0",
    },
    statIconContainer: {
        width: 48,
        height: 48,
        borderRadius: 12,
        backgroundColor: "#f0f0f0",
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 12,
    },
    statValue: {
        fontSize: 24,
        fontWeight: "800" as const,
        color: "#1a1a1a",
        marginBottom: 4,
    },
    statLabel: {
        fontSize: 12,
        color: "#666",
        textAlign: "center",
    },
    userCard: {
        backgroundColor: "#fff",
        borderRadius: 16,
        padding: 20,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: "#e0e0e0",
    },
    userHeader: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 16,
    },
    userAvatar: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: "#00A8E8",
        alignItems: "center",
        justifyContent: "center",
        marginRight: 12,
    },
    userAvatarText: {
        fontSize: 20,
        fontWeight: "700" as const,
        color: "#fff",
    },
    userInfo: {
        flex: 1,
    },
    userName: {
        fontSize: 18,
        fontWeight: "700" as const,
        color: "#1a1a1a",
        marginBottom: 4,
    },
    userEmail: {
        fontSize: 14,
        color: "#666",
    },
    userStats: {
        flexDirection: "row",
        backgroundColor: "#f9f9f9",
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
    },
    userStatItem: {
        flex: 1,
        alignItems: "center",
    },
    userStatDivider: {
        width: 1,
        backgroundColor: "#e0e0e0",
    },
    userStatLabel: {
        fontSize: 12,
        color: "#999",
        marginBottom: 6,
    },
    userStatValue: {
        fontSize: 18,
        fontWeight: "700" as const,
        color: "#1a1a1a",
    },
    lastWorkoutContainer: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        marginBottom: 16,
    },
    lastWorkoutText: {
        fontSize: 13,
        color: "#666",
    },
    recentExercises: {
        borderTopWidth: 1,
        borderTopColor: "#e0e0e0",
        paddingTop: 16,
    },
    recentExercisesTitle: {
        fontSize: 14,
        fontWeight: "600" as const,
        color: "#666",
        marginBottom: 12,
    },
    recentExerciseItem: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingVertical: 8,
    },
    recentExerciseName: {
        fontSize: 14,
        fontWeight: "600" as const,
        color: "#1a1a1a",
    },
    recentExerciseRight: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
    },
    recentExerciseAccuracy: {
        fontSize: 14,
        fontWeight: "700" as const,
    },
    recentExerciseDate: {
        fontSize: 12,
        color: "#999",
    },
    exerciseCard: {
        backgroundColor: "#fff",
        borderRadius: 16,
        padding: 20,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: "#e0e0e0",
    },
    exerciseHeader: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 16,
    },
    exerciseRank: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: "#E3F5FF",
        alignItems: "center",
        justifyContent: "center",
        marginRight: 12,
    },
    exerciseRankText: {
        fontSize: 16,
        fontWeight: "700" as const,
        color: "#00A8E8",
    },
    exerciseInfo: {
        flex: 1,
    },
    exerciseName: {
        fontSize: 18,
        fontWeight: "700" as const,
        color: "#1a1a1a",
        marginBottom: 4,
    },
    exerciseUsers: {
        fontSize: 13,
        color: "#666",
    },
    exerciseStats: {
        gap: 16,
    },
    exerciseStatItem: {
        gap: 8,
    },
    exerciseStatLabel: {
        fontSize: 13,
        color: "#999",
    },
    exerciseStatValue: {
        fontSize: 16,
        fontWeight: "700" as const,
        color: "#1a1a1a",
    },
    accuracyContainer: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
    },
    accuracyBarBackground: {
        flex: 1,
        height: 8,
        backgroundColor: "#f0f0f0",
        borderRadius: 4,
        overflow: "hidden",
    },
    accuracyBarFill: {
        height: "100%",
        borderRadius: 4,
    },
});
