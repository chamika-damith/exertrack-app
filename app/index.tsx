import { useUser } from "@/contexts/UserContext";
import { useWorkoutHistory } from "@/contexts/WorkoutHistoryContext";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { Activity, Award, Calendar, Flame, Target, TrendingUp, User, Zap } from "lucide-react-native";
import React from "react";
import {
    ActivityIndicator,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function WelcomeScreen() {
    const { user, isLoading, isLoggedIn } = useUser();
    const { recentSessions, averageAccuracy, totalWorkouts } = useWorkoutHistory();

    if (isLoading) {
        return (
            <View style={styles.container}>
                <StatusBar barStyle="light-content" />
                <LinearGradient
                    colors={["#00A8E8", "#0077B6", "#023E8A"]}
                    style={styles.gradient}
                >
                    <SafeAreaView style={styles.safeArea}>
                        <View style={styles.loadingContainer}>
                            <ActivityIndicator size="large" color="#fff" />
                        </View>
                    </SafeAreaView>
                </LinearGradient>
            </View>
        );
    }

    if (isLoggedIn && user) {
        return (
            <View style={styles.container}>
                <StatusBar barStyle="light-content" />
                <LinearGradient
                    colors={["#00A8E8", "#0077B6", "#023E8A"]}
                    style={styles.gradient}
                >
                    <SafeAreaView style={styles.safeArea}>
                        <ScrollView
                            contentContainerStyle={styles.scrollContent}
                            showsVerticalScrollIndicator={false}
                        >
                            <View style={styles.dashboardHeader}>
                                <View>
                                    <Text style={styles.welcomeText}>Welcome back,</Text>
                                    <Text style={styles.userName}>{user.name}!</Text>
                                </View>
                                <TouchableOpacity
                                    style={styles.profileButton}
                                    onPress={() => router.push("/profile")}
                                    activeOpacity={0.7}
                                >
                                    <User color="#00A8E8" size={24} />
                                </TouchableOpacity>
                            </View>

                            <View style={styles.streakCard}>
                                <Flame color="#FF5252" size={32} />
                                <View style={styles.streakInfo}>
                                    <Text style={styles.streakValue}>{user.currentStreak} Days</Text>
                                    <Text style={styles.streakLabel}>Current Streak</Text>
                                </View>
                            </View>

                            <View style={styles.quickStats}>
                                <QuickStatCard
                                    icon={<Target color="#00C853" size={20} />}
                                    label="Workouts"
                                    value={totalWorkouts.toString()}
                                />
                                <QuickStatCard
                                    icon={<TrendingUp color="#FFC107" size={20} />}
                                    label="Avg Accuracy"
                                    value={`${averageAccuracy}%`}
                                />
                            </View>

                            <TouchableOpacity
                                style={styles.startWorkoutButton}
                                onPress={() => router.push("/exercises")}
                                activeOpacity={0.8}
                            >
                                <Activity color="#fff" size={24} strokeWidth={2.5} />
                                <Text style={styles.startWorkoutButtonText}>Start Workout</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={styles.progressButton}
                                onPress={() => router.push("/progress")}
                                activeOpacity={0.8}
                            >
                                <TrendingUp color="#fff" size={20} />
                                <Text style={styles.progressButtonText}>View Progress</Text>
                            </TouchableOpacity>

                            <View style={styles.recentSection}>
                                <Text style={styles.recentTitle}>Recent Workouts</Text>
                                {recentSessions.length === 0 ? (
                                    <View style={styles.emptyRecent}>
                                        <Calendar color="rgba(255, 255, 255, 0.5)" size={48} />
                                        <Text style={styles.emptyRecentText}>No workouts yet</Text>
                                        <Text style={styles.emptyRecentSubtext}>Start your first workout!</Text>
                                    </View>
                                ) : (
                                    recentSessions.map((session) => {
                                        const date = new Date(session.date);
                                        const formattedDate = date.toLocaleDateString("en-US", {
                                            month: "short",
                                            day: "numeric",
                                        });
                                        return (
                                            <View key={session.id} style={styles.recentCard}>
                                                <View style={styles.recentCardLeft}>
                                                    <Text style={styles.recentCardTitle}>{session.exerciseName}</Text>
                                                    <Text style={styles.recentCardDate}>{formattedDate}</Text>
                                                </View>
                                                <View style={styles.recentCardRight}>
                                                    <Text style={styles.recentCardAccuracy}>{session.averageAccuracy}%</Text>
                                                    <Text style={styles.recentCardLabel}>Accuracy</Text>
                                                </View>
                                            </View>
                                        );
                                    })
                                )}
                            </View>

                            <TouchableOpacity
                                style={styles.adminButton}
                                onPress={() => router.push("/(admin)/templates")}
                                activeOpacity={0.7}
                            >
                                <Text style={styles.adminButtonText}>Admin Panel</Text>
                            </TouchableOpacity>
                        </ScrollView>
                    </SafeAreaView>
                </LinearGradient>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" />
            <LinearGradient
                colors={["#00A8E8", "#0077B6", "#023E8A"]}
                style={styles.gradient}
            >
                <SafeAreaView style={styles.safeArea}>
                    <ScrollView
                        contentContainerStyle={styles.scrollContent}
                        showsVerticalScrollIndicator={false}
                    >
                        <View style={styles.header}>
                            <Activity color="#fff" size={48} strokeWidth={2.5} />
                            <Text style={styles.appName}>ExerTrack</Text>
                            <Text style={styles.tagline}>Your Personal Form Coach</Text>
                        </View>

                        <View style={styles.featuresContainer}>
                            <FeatureCard
                                icon={<Zap color="#00C853" size={32} />}
                                title="Real-Time Analysis"
                                description="Get instant feedback on your exercise form with AI-powered pose detection"
                            />
                            <FeatureCard
                                icon={<TrendingUp color="#FFC107" size={32} />}
                                title="Track Progress"
                                description="Monitor your improvement with detailed accuracy metrics"
                            />
                            <FeatureCard
                                icon={<Award color="#FF5252" size={32} />}
                                title="Achieve Goals"
                                description="Stay motivated with personalized workout recommendations"
                            />
                        </View>

                        <View style={styles.statsContainer}>
                            <StatBox label="Exercises" value="12+" />
                            <StatBox label="Accuracy" value="95%" />
                            <StatBox label="Users" value="10K+" />
                        </View>

                        <TouchableOpacity
                            style={styles.primaryButton}
                            onPress={() => router.push("/register")}
                            activeOpacity={0.8}
                        >
                            <Text style={styles.primaryButtonText}>Create Account</Text>
                            <Activity color="#fff" size={20} />
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.secondaryButton}
                            onPress={() => router.push("/login")}
                            activeOpacity={0.7}
                        >
                            <Text style={styles.secondaryButtonText}>Sign In</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.guestButton}
                            onPress={() => router.push("/exercises")}
                            activeOpacity={0.7}
                        >
                            <Text style={styles.guestButtonText}>Continue as Guest</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.adminButton}
                            onPress={() => router.push("/(admin)/templates")}
                            activeOpacity={0.7}
                        >
                            <Text style={styles.adminButtonText}>Admin Panel</Text>
                        </TouchableOpacity>
                    </ScrollView>
                </SafeAreaView>
            </LinearGradient>
        </View>
    );
}

function FeatureCard({
    icon,
    title,
    description,
}: {
    icon: React.ReactNode;
    title: string;
    description: string;
}) {
    return (
        <View style={styles.featureCard}>
            <View style={styles.featureIconContainer}>{icon}</View>
            <Text style={styles.featureTitle}>{title}</Text>
            <Text style={styles.featureDescription}>{description}</Text>
        </View>
    );
}

function StatBox({ label, value }: { label: string; value: string }) {
    return (
        <View style={styles.statBox}>
            <Text style={styles.statValue}>{value}</Text>
            <Text style={styles.statLabel}>{label}</Text>
        </View>
    );
}

function QuickStatCard({
    icon,
    label,
    value,
}: {
    icon: React.ReactNode;
    label: string;
    value: string;
}) {
    return (
        <View style={styles.quickStatCard}>
            <View style={styles.quickStatIcon}>{icon}</View>
            <Text style={styles.quickStatValue}>{value}</Text>
            <Text style={styles.quickStatLabel}>{label}</Text>
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
        alignItems: "center",
        marginTop: 60,
        marginBottom: 40,
    },
    appName: {
        fontSize: 48,
        fontWeight: "800" as const,
        color: "#fff",
        marginTop: 16,
        letterSpacing: -1,
    },
    tagline: {
        fontSize: 18,
        color: "rgba(255, 255, 255, 0.9)",
        marginTop: 8,
        fontWeight: "500" as const,
    },
    featuresContainer: {
        marginBottom: 32,
    },
    featureCard: {
        backgroundColor: "rgba(255, 255, 255, 0.15)",
        borderRadius: 20,
        padding: 24,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: "rgba(255, 255, 255, 0.2)",
    },
    featureIconContainer: {
        width: 56,
        height: 56,
        borderRadius: 16,
        backgroundColor: "rgba(255, 255, 255, 0.95)",
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 16,
    },
    featureTitle: {
        fontSize: 20,
        fontWeight: "700" as const,
        color: "#fff",
        marginBottom: 8,
    },
    featureDescription: {
        fontSize: 15,
        color: "rgba(255, 255, 255, 0.85)",
        lineHeight: 22,
    },
    statsContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 40,
        gap: 12,
    },
    statBox: {
        flex: 1,
        backgroundColor: "rgba(255, 255, 255, 0.15)",
        borderRadius: 16,
        padding: 20,
        alignItems: "center",
        borderWidth: 1,
        borderColor: "rgba(255, 255, 255, 0.2)",
    },
    statValue: {
        fontSize: 28,
        fontWeight: "800" as const,
        color: "#fff",
        marginBottom: 4,
    },
    statLabel: {
        fontSize: 13,
        color: "rgba(255, 255, 255, 0.85)",
        fontWeight: "600" as const,
    },
    primaryButton: {
        backgroundColor: "#fff",
        borderRadius: 16,
        paddingVertical: 18,
        paddingHorizontal: 32,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        marginBottom: 12,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
    },
    primaryButtonText: {
        color: "#00A8E8",
        fontSize: 18,
        fontWeight: "700" as const,
    },
    secondaryButton: {
        borderRadius: 16,
        paddingVertical: 18,
        paddingHorizontal: 32,
        alignItems: "center",
        borderWidth: 2,
        borderColor: "rgba(255, 255, 255, 0.5)",
    },
    secondaryButtonText: {
        color: "#fff",
        fontSize: 17,
        fontWeight: "600" as const,
    },
    adminButton: {
        borderRadius: 16,
        paddingVertical: 14,
        paddingHorizontal: 32,
        alignItems: "center",
        backgroundColor: "rgba(255, 255, 255, 0.2)",
        marginTop: 12,
    },
    adminButtonText: {
        color: "rgba(255, 255, 255, 0.9)",
        fontSize: 15,
        fontWeight: "600" as const,
    },
    guestButton: {
        borderRadius: 16,
        paddingVertical: 14,
        paddingHorizontal: 32,
        alignItems: "center",
        marginTop: 12,
        marginBottom: 12,
    },
    guestButtonText: {
        color: "rgba(255, 255, 255, 0.8)",
        fontSize: 15,
        fontWeight: "600" as const,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    dashboardHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginTop: 16,
        marginBottom: 24,
    },
    welcomeText: {
        fontSize: 16,
        color: "rgba(255, 255, 255, 0.85)",
        fontWeight: "500" as const,
    },
    userName: {
        fontSize: 32,
        fontWeight: "800" as const,
        color: "#fff",
        marginTop: 4,
    },
    profileButton: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: "#fff",
        alignItems: "center",
        justifyContent: "center",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 4,
    },
    streakCard: {
        backgroundColor: "rgba(255, 255, 255, 0.15)",
        borderRadius: 20,
        padding: 24,
        flexDirection: "row",
        alignItems: "center",
        gap: 16,
        marginBottom: 24,
        borderWidth: 1,
        borderColor: "rgba(255, 255, 255, 0.2)",
    },
    streakInfo: {
        flex: 1,
    },
    streakValue: {
        fontSize: 28,
        fontWeight: "800" as const,
        color: "#fff",
        marginBottom: 4,
    },
    streakLabel: {
        fontSize: 15,
        color: "rgba(255, 255, 255, 0.85)",
        fontWeight: "600" as const,
    },
    quickStats: {
        flexDirection: "row",
        gap: 12,
        marginBottom: 24,
    },
    quickStatCard: {
        flex: 1,
        backgroundColor: "rgba(255, 255, 255, 0.15)",
        borderRadius: 16,
        padding: 20,
        alignItems: "center",
        borderWidth: 1,
        borderColor: "rgba(255, 255, 255, 0.2)",
    },
    quickStatIcon: {
        width: 40,
        height: 40,
        borderRadius: 10,
        backgroundColor: "rgba(255, 255, 255, 0.95)",
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 12,
    },
    quickStatValue: {
        fontSize: 24,
        fontWeight: "800" as const,
        color: "#fff",
        marginBottom: 4,
    },
    quickStatLabel: {
        fontSize: 13,
        color: "rgba(255, 255, 255, 0.85)",
        fontWeight: "600" as const,
    },
    startWorkoutButton: {
        backgroundColor: "#fff",
        borderRadius: 16,
        paddingVertical: 18,
        paddingHorizontal: 32,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 12,
        marginBottom: 12,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
    },
    startWorkoutButtonText: {
        color: "#00A8E8",
        fontSize: 18,
        fontWeight: "700" as const,
    },
    progressButton: {
        borderRadius: 16,
        paddingVertical: 16,
        paddingHorizontal: 32,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        borderWidth: 2,
        borderColor: "rgba(255, 255, 255, 0.5)",
        marginBottom: 32,
    },
    progressButtonText: {
        color: "#fff",
        fontSize: 17,
        fontWeight: "600" as const,
    },
    recentSection: {
        marginBottom: 32,
    },
    recentTitle: {
        fontSize: 20,
        fontWeight: "700" as const,
        color: "#fff",
        marginBottom: 16,
    },
    emptyRecent: {
        alignItems: "center",
        paddingVertical: 48,
        backgroundColor: "rgba(255, 255, 255, 0.1)",
        borderRadius: 16,
    },
    emptyRecentText: {
        fontSize: 18,
        fontWeight: "700" as const,
        color: "#fff",
        marginTop: 16,
        marginBottom: 8,
    },
    emptyRecentSubtext: {
        fontSize: 14,
        color: "rgba(255, 255, 255, 0.7)",
    },
    recentCard: {
        backgroundColor: "rgba(255, 255, 255, 0.15)",
        borderRadius: 16,
        padding: 16,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 12,
        borderWidth: 1,
        borderColor: "rgba(255, 255, 255, 0.2)",
    },
    recentCardLeft: {
        flex: 1,
    },
    recentCardTitle: {
        fontSize: 16,
        fontWeight: "700" as const,
        color: "#fff",
        marginBottom: 4,
    },
    recentCardDate: {
        fontSize: 13,
        color: "rgba(255, 255, 255, 0.7)",
    },
    recentCardRight: {
        alignItems: "flex-end",
    },
    recentCardAccuracy: {
        fontSize: 24,
        fontWeight: "800" as const,
        color: "#00C853",
        marginBottom: 4,
    },
    recentCardLabel: {
        fontSize: 12,
        color: "rgba(255, 255, 255, 0.7)",
        fontWeight: "600" as const,
    },
});
