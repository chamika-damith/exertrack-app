import { useUser } from "@/contexts/UserContext";
import { useWorkoutHistory } from "@/contexts/WorkoutHistoryContext";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { Award, Calendar, ChevronLeft, TrendingUp } from "lucide-react-native";
import React, { useMemo, useState } from "react";
import {
    Dimensions,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const { width } = Dimensions.get("window");

type DateRangeOption = "week" | "month" | "3months" | "year";

const DATE_RANGE_OPTIONS: { value: DateRangeOption; label: string }[] = [
    { value: "week", label: "Week" },
    { value: "month", label: "Month" },
    { value: "3months", label: "3 Months" },
    { value: "year", label: "Year" },
];

export default function ProgressScreen() {
    const { sessions, averageAccuracy, totalCaloriesBurned, getSessionsByDateRange } = useWorkoutHistory();
    const { user } = useUser();
    const [selectedRange, setSelectedRange] = useState<DateRangeOption>("month");

    const getDateRangeStart = (range: DateRangeOption): Date => {
        const now = new Date();
        switch (range) {
            case "week":
                return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            case "month":
                return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
            case "3months":
                return new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
            case "year":
                return new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        }
    };

    const filteredSessions = useMemo(() => {
        const startDate = getDateRangeStart(selectedRange);
        const endDate = new Date();
        return getSessionsByDateRange(startDate, endDate);
    }, [selectedRange, getSessionsByDateRange]);

    const rangeStats = useMemo(() => {
        const totalWorkouts = filteredSessions.length;
        const avgAccuracy = filteredSessions.length > 0
            ? Math.round(filteredSessions.reduce((sum, s) => sum + s.averageAccuracy, 0) / filteredSessions.length)
            : 0;
        const totalCalories = filteredSessions.reduce((sum, s) => sum + s.caloriesBurned, 0);
        const totalDuration = filteredSessions.reduce((sum, s) => sum + s.duration, 0);

        return { totalWorkouts, avgAccuracy, totalCalories, totalDuration };
    }, [filteredSessions]);

    if (!user) {
        return (
            <View style={styles.container}>
                <StatusBar barStyle="light-content" />
                <LinearGradient
                    colors={["#023E8A", "#0077B6", "#00A8E8"]}
                    style={styles.gradient}
                >
                    <SafeAreaView style={styles.safeArea}>
                        <View style={styles.centerContainer}>
                            <Text style={styles.notLoggedInText}>Please log in to view your progress</Text>
                            <TouchableOpacity
                                style={styles.loginButton}
                                onPress={() => router.push("/login")}
                                activeOpacity={0.8}
                            >
                                <Text style={styles.loginButtonText}>Login</Text>
                            </TouchableOpacity>
                        </View>
                    </SafeAreaView>
                </LinearGradient>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" />
            <LinearGradient
                colors={["#023E8A", "#0077B6", "#00A8E8"]}
                style={styles.gradient}
            >
                <SafeAreaView style={styles.safeArea}>
                    <ScrollView
                        contentContainerStyle={styles.scrollContent}
                        showsVerticalScrollIndicator={false}
                    >
                        <View style={styles.header}>
                            <TouchableOpacity
                                style={styles.backButton}
                                onPress={() => router.back()}
                                activeOpacity={0.7}
                            >
                                <ChevronLeft color="#fff" size={24} />
                            </TouchableOpacity>
                            <View style={styles.headerTitleContainer}>
                                <TrendingUp color="#fff" size={24} />
                                <Text style={styles.headerTitle}>Progress</Text>
                            </View>
                            <View style={styles.headerSpacer} />
                        </View>

                        <View style={styles.rangeSelector}>
                            {DATE_RANGE_OPTIONS.map((option) => (
                                <TouchableOpacity
                                    key={option.value}
                                    style={[
                                        styles.rangeOption,
                                        selectedRange === option.value && styles.rangeOptionSelected,
                                    ]}
                                    onPress={() => setSelectedRange(option.value)}
                                    activeOpacity={0.7}
                                >
                                    <Text
                                        style={[
                                            styles.rangeOptionText,
                                            selectedRange === option.value && styles.rangeOptionTextSelected,
                                        ]}
                                    >
                                        {option.label}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        <View style={styles.statsGrid}>
                            <StatCard
                                icon={<TrendingUp color="#00C853" size={24} />}
                                label="Workouts"
                                value={rangeStats.totalWorkouts.toString()}
                            />
                            <StatCard
                                icon={<Award color="#FFC107" size={24} />}
                                label="Avg Accuracy"
                                value={`${rangeStats.avgAccuracy}%`}
                            />
                            <StatCard
                                icon={<Calendar color="#FF5252" size={24} />}
                                label="Calories"
                                value={rangeStats.totalCalories.toString()}
                            />
                            <StatCard
                                icon={<TrendingUp color="#00A8E8" size={24} />}
                                label="Duration"
                                value={`${Math.floor(rangeStats.totalDuration / 60)}m`}
                            />
                        </View>

                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Personal Records</Text>
                            <RecordCard
                                label="Total Workouts"
                                value={sessions.length.toString()}
                                subtitle="All time"
                            />
                            <RecordCard
                                label="Average Accuracy"
                                value={`${averageAccuracy}%`}
                                subtitle="Across all exercises"
                            />
                            <RecordCard
                                label="Total Calories Burned"
                                value={totalCaloriesBurned.toString()}
                                subtitle="All time"
                            />
                        </View>

                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Recent Workouts</Text>
                            {filteredSessions.length === 0 ? (
                                <View style={styles.emptyState}>
                                    <Calendar color="rgba(255, 255, 255, 0.5)" size={48} />
                                    <Text style={styles.emptyStateText}>No workouts in this period</Text>
                                    <Text style={styles.emptyStateSubtext}>
                                        Start exercising to track your progress
                                    </Text>
                                </View>
                            ) : (
                                filteredSessions.slice(0, 10).map((session) => (
                                    <WorkoutCard key={session.id} session={session} />
                                ))
                            )}
                        </View>
                    </ScrollView>
                </SafeAreaView>
            </LinearGradient>
        </View>
    );
}

function StatCard({
    icon,
    label,
    value,
}: {
    icon: React.ReactNode;
    label: string;
    value: string;
}) {
    return (
        <View style={styles.statCard}>
            <View style={styles.statIconContainer}>{icon}</View>
            <Text style={styles.statValue}>{value}</Text>
            <Text style={styles.statLabel}>{label}</Text>
        </View>
    );
}

function RecordCard({
    label,
    value,
    subtitle,
}: {
    label: string;
    value: string;
    subtitle: string;
}) {
    return (
        <View style={styles.recordCard}>
            <View style={styles.recordCardLeft}>
                <Text style={styles.recordCardLabel}>{label}</Text>
                <Text style={styles.recordCardSubtitle}>{subtitle}</Text>
            </View>
            <Text style={styles.recordCardValue}>{value}</Text>
        </View>
    );
}

function WorkoutCard({ session }: { session: any }) {
    const date = new Date(session.date);
    const formattedDate = date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });

    return (
        <View style={styles.workoutCard}>
            <View style={styles.workoutCardHeader}>
                <Text style={styles.workoutCardTitle}>{session.exerciseName}</Text>
                <Text style={styles.workoutCardDate}>{formattedDate}</Text>
            </View>
            <View style={styles.workoutCardStats}>
                <WorkoutStat label="Reps" value={session.repsCompleted.toString()} />
                <WorkoutStat label="Accuracy" value={`${session.averageAccuracy}%`} />
                <WorkoutStat label="Duration" value={`${Math.floor(session.duration / 60)}m`} />
                <WorkoutStat label="Calories" value={session.caloriesBurned.toString()} />
            </View>
        </View>
    );
}

function WorkoutStat({ label, value }: { label: string; value: string }) {
    return (
        <View style={styles.workoutStat}>
            <Text style={styles.workoutStatValue}>{value}</Text>
            <Text style={styles.workoutStatLabel}>{label}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#00A8E8",
    },
    gradient: {
        flex: 1,
    },
    safeArea: {
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: 24,
        paddingBottom: 40,
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginTop: 16,
        marginBottom: 24,
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: "rgba(255, 255, 255, 0.15)",
        alignItems: "center",
        justifyContent: "center",
    },
    headerTitleContainer: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: "800" as const,
        color: "#fff",
    },
    headerSpacer: {
        width: 40,
    },
    rangeSelector: {
        flexDirection: "row",
        backgroundColor: "rgba(255, 255, 255, 0.15)",
        borderRadius: 16,
        padding: 4,
        marginBottom: 24,
        gap: 4,
    },
    rangeOption: {
        flex: 1,
        paddingVertical: 12,
        paddingHorizontal: 8,
        borderRadius: 12,
        alignItems: "center",
    },
    rangeOptionSelected: {
        backgroundColor: "#fff",
    },
    rangeOptionText: {
        fontSize: 14,
        fontWeight: "600" as const,
        color: "rgba(255, 255, 255, 0.7)",
    },
    rangeOptionTextSelected: {
        color: "#00A8E8",
    },
    statsGrid: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 12,
        marginBottom: 32,
    },
    statCard: {
        width: (width - 60) / 2,
        backgroundColor: "rgba(255, 255, 255, 0.15)",
        borderRadius: 16,
        padding: 20,
        alignItems: "center",
        borderWidth: 1,
        borderColor: "rgba(255, 255, 255, 0.2)",
    },
    statIconContainer: {
        width: 48,
        height: 48,
        borderRadius: 12,
        backgroundColor: "rgba(255, 255, 255, 0.95)",
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 12,
    },
    statValue: {
        fontSize: 24,
        fontWeight: "800" as const,
        color: "#fff",
        marginBottom: 4,
    },
    statLabel: {
        fontSize: 13,
        color: "rgba(255, 255, 255, 0.85)",
        fontWeight: "600" as const,
    },
    section: {
        marginBottom: 32,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: "700" as const,
        color: "#fff",
        marginBottom: 16,
    },
    recordCard: {
        backgroundColor: "rgba(255, 255, 255, 0.15)",
        borderRadius: 16,
        padding: 20,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 12,
        borderWidth: 1,
        borderColor: "rgba(255, 255, 255, 0.2)",
    },
    recordCardLeft: {
        flex: 1,
    },
    recordCardLabel: {
        fontSize: 16,
        fontWeight: "700" as const,
        color: "#fff",
        marginBottom: 4,
    },
    recordCardSubtitle: {
        fontSize: 13,
        color: "rgba(255, 255, 255, 0.7)",
    },
    recordCardValue: {
        fontSize: 28,
        fontWeight: "800" as const,
        color: "#fff",
    },
    workoutCard: {
        backgroundColor: "rgba(255, 255, 255, 0.15)",
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: "rgba(255, 255, 255, 0.2)",
    },
    workoutCardHeader: {
        marginBottom: 12,
    },
    workoutCardTitle: {
        fontSize: 17,
        fontWeight: "700" as const,
        color: "#fff",
        marginBottom: 4,
    },
    workoutCardDate: {
        fontSize: 13,
        color: "rgba(255, 255, 255, 0.7)",
    },
    workoutCardStats: {
        flexDirection: "row",
        justifyContent: "space-between",
    },
    workoutStat: {
        alignItems: "center",
    },
    workoutStatValue: {
        fontSize: 18,
        fontWeight: "700" as const,
        color: "#fff",
        marginBottom: 4,
    },
    workoutStatLabel: {
        fontSize: 11,
        color: "rgba(255, 255, 255, 0.7)",
        fontWeight: "600" as const,
    },
    emptyState: {
        alignItems: "center",
        paddingVertical: 48,
    },
    emptyStateText: {
        fontSize: 18,
        fontWeight: "700" as const,
        color: "#fff",
        marginTop: 16,
        marginBottom: 8,
    },
    emptyStateSubtext: {
        fontSize: 14,
        color: "rgba(255, 255, 255, 0.7)",
    },
    centerContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 24,
    },
    notLoggedInText: {
        fontSize: 18,
        color: "#fff",
        textAlign: "center",
        marginBottom: 24,
        fontWeight: "600" as const,
    },
    loginButton: {
        backgroundColor: "#fff",
        borderRadius: 16,
        paddingVertical: 16,
        paddingHorizontal: 48,
    },
    loginButtonText: {
        color: "#00A8E8",
        fontSize: 17,
        fontWeight: "700" as const,
    },
});
