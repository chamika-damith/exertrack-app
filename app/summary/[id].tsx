import { exercises } from "@/constants/exercises";
import { useWorkoutHistory } from "@/contexts/WorkoutHistoryContext";
import { WorkoutSession } from "@/types/user";
import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams } from "expo-router";
import { Clock, Home, RotateCcw, TrendingUp, Trophy, Zap } from "lucide-react-native";
import React, { useEffect, useRef } from "react";
import {
    Alert,
    Animated,
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

export default function SummaryScreen() {
    const { id, reps, accuracy, duration, repData } = useLocalSearchParams<{
        id: string;
        reps: string;
        accuracy: string;
        duration: string;
        repData?: string;
    }>();

    const { addSession } = useWorkoutHistory();

    const exercise = exercises.find((ex) => ex.id === id);
    const scaleAnim = useRef(new Animated.Value(0)).current;
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const hasSaved = useRef(false);

    useEffect(() => {
        Animated.parallel([
            Animated.spring(scaleAnim, {
                toValue: 1,
                tension: 50,
                friction: 7,
                useNativeDriver: true,
            }),
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 600,
                useNativeDriver: true,
            }),
        ]).start();
    }, [scaleAnim, fadeAnim]);

    useEffect(() => {
        const saveWorkout = async () => {
            if (hasSaved.current || !exercise) return;
            hasSaved.current = true;

            const session: WorkoutSession = {
                id: Date.now().toString(),
                exerciseId: id!,
                exerciseName: exercise.name,
                date: new Date().toISOString(),
                duration: parseInt(duration || "0"),
                repsCompleted: parseInt(reps || "0"),
                averageAccuracy: parseInt(accuracy || "0"),
                caloriesBurned: Math.round(parseInt(duration || "0") * 0.15),
                formBreakdown: {
                    correctReps: Math.round(
                        (parseInt(reps || "0") * parseInt(accuracy || "0")) / 100
                    ),
                    incorrectReps:
                        parseInt(reps || "0") -
                        Math.round((parseInt(reps || "0") * parseInt(accuracy || "0")) / 100),
                },
            };

            console.log("Saving workout session:", session);
            const result = await addSession(session);

            if (!result.success) {
                Alert.alert(
                    "Warning",
                    "Failed to save workout data, but you can still view the summary."
                );
            }
        };

        saveWorkout();
    }, [id, exercise, reps, accuracy, duration, addSession]);

    if (!exercise) {
        return (
            <View style={styles.container}>
                <Text>Exercise not found</Text>
            </View>
        );
    }

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, "0")}`;
    };

    const accuracyNum = parseInt(accuracy || "0");
    const caloriesBurned = Math.round(parseInt(duration || "0") * 0.15);

    const getFeedbackMessage = () => {
        if (accuracyNum >= 90) return "Excellent form! Keep up the great work!";
        if (accuracyNum >= 80)
            return "Great job! Focus on consistency for even better results.";
        if (accuracyNum >= 70)
            return "Good effort! Pay attention to the key points to improve form.";
        return "Keep practicing! Review the instructions for better form.";
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" />
            <LinearGradient
                colors={["#00A8E8", "#0077B6", "#023E8A"]}
                style={styles.gradient}
            >
                <SafeAreaView style={styles.safeArea} edges={["top", "bottom"]}>
                    <ScrollView
                        contentContainerStyle={styles.scrollContent}
                        showsVerticalScrollIndicator={false}
                    >
                        <Animated.View
                            style={[
                                styles.celebrationContainer,
                                {
                                    transform: [{ scale: scaleAnim }],
                                    opacity: fadeAnim,
                                },
                            ]}
                        >
                            <View style={styles.trophyCircle}>
                                <Trophy color="#FFC107" size={64} fill="#FFC107" />
                            </View>
                            <Text style={styles.congratsText}>Workout Complete!</Text>
                            <Text style={styles.exerciseTitle}>{exercise.name}</Text>
                        </Animated.View>

                        <Animated.View style={[styles.statsGrid, { opacity: fadeAnim }]}>
                            <StatCard
                                icon={<RotateCcw color="#00C853" size={28} />}
                                label="Reps Completed"
                                value={reps || "0"}
                                color="#00C853"
                            />
                            <StatCard
                                icon={<TrendingUp color="#00A8E8" size={28} />}
                                label="Form Accuracy"
                                value={`${accuracy}%`}
                                color="#00A8E8"
                            />
                            <StatCard
                                icon={<Clock color="#FFC107" size={28} />}
                                label="Duration"
                                value={formatTime(parseInt(duration || "0"))}
                                color="#FFC107"
                            />
                            <StatCard
                                icon={<Zap color="#FF5252" size={28} />}
                                label="Calories Burned"
                                value={`${caloriesBurned}`}
                                color="#FF5252"
                            />
                        </Animated.View>

                        <Animated.View
                            style={[styles.accuracyCard, { opacity: fadeAnim }]}
                        >
                            <Text style={styles.accuracyTitle}>Form Breakdown</Text>
                            <View style={styles.accuracyBarContainer}>
                                <View style={styles.accuracyBarBg}>
                                    <Animated.View
                                        style={[
                                            styles.accuracyBarFill,
                                            {
                                                width: `${accuracyNum}%`,
                                                backgroundColor:
                                                    accuracyNum >= 85
                                                        ? "#00C853"
                                                        : accuracyNum >= 70
                                                            ? "#FFC107"
                                                            : "#FF5252",
                                            },
                                        ]}
                                    />
                                </View>
                                <Text style={styles.accuracyPercentage}>{accuracy}%</Text>
                            </View>
                            <View style={styles.phaseBreakdown}>
                                <PhaseItem label="Starting Position" accuracy={92} />
                                <PhaseItem label="Movement Phase" accuracy={85} />
                                <PhaseItem label="Peak Position" accuracy={88} />
                                <PhaseItem label="Return Phase" accuracy={84} />
                            </View>
                        </Animated.View>

                        <Animated.View
                            style={[styles.feedbackCard, { opacity: fadeAnim }]}
                        >
                            <Text style={styles.feedbackTitle}>Coach Feedback</Text>
                            <Text style={styles.feedbackText}>{getFeedbackMessage()}</Text>
                            {accuracyNum < 85 && (
                                <View style={styles.tipsContainer}>
                                    <Text style={styles.tipsTitle}>Tips for improvement:</Text>
                                    {exercise.keyPoints.slice(0, 2).map((point, index) => (
                                        <Text key={index} style={styles.tipItem}>
                                            • {point}
                                        </Text>
                                    ))}
                                </View>
                            )}
                        </Animated.View>

                        <View style={styles.actionsContainer}>
                            <TouchableOpacity
                                style={styles.primaryButton}
                                onPress={() => router.push("/")}
                                activeOpacity={0.8}
                            >
                                <Home color="#00A8E8" size={20} />
                                <Text style={styles.primaryButtonText}>Back to Home</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={styles.secondaryButton}
                                onPress={() => router.push(`/camera/${id}`)}
                                activeOpacity={0.7}
                            >
                                <Text style={styles.secondaryButtonText}>Try Again</Text>
                            </TouchableOpacity>
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
    color,
}: {
    icon: React.ReactNode;
    label: string;
    value: string;
    color: string;
}) {
    return (
        <View style={styles.statCard}>
            <View style={[styles.statIconContainer, { backgroundColor: color + "20" }]}>
                {icon}
            </View>
            <Text style={styles.statValue}>{value}</Text>
            <Text style={styles.statLabel}>{label}</Text>
        </View>
    );
}

function PhaseItem({
    label,
    accuracy,
}: {
    label: string;
    accuracy: number;
}) {
    return (
        <View style={styles.phaseItem}>
            <Text style={styles.phaseLabel}>{label}</Text>
            <View style={styles.phaseBarContainer}>
                <View style={styles.phaseBarBg}>
                    <View
                        style={[
                            styles.phaseBarFill,
                            {
                                width: `${accuracy}%`,
                                backgroundColor:
                                    accuracy >= 85
                                        ? "#00C853"
                                        : accuracy >= 70
                                            ? "#FFC107"
                                            : "#FF5252",
                            },
                        ]}
                    />
                </View>
                <Text style={styles.phaseAccuracy}>{accuracy}%</Text>
            </View>
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
        paddingTop: 40,
        paddingBottom: 40,
    },
    celebrationContainer: {
        alignItems: "center",
        marginBottom: 32,
    },
    trophyCircle: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: "rgba(255, 255, 255, 0.2)",
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 24,
        borderWidth: 3,
        borderColor: "rgba(255, 255, 255, 0.3)",
    },
    congratsText: {
        fontSize: 32,
        fontWeight: "800" as const,
        color: "#fff",
        marginBottom: 8,
        textAlign: "center",
    },
    exerciseTitle: {
        fontSize: 20,
        fontWeight: "600" as const,
        color: "rgba(255, 255, 255, 0.9)",
        textAlign: "center",
    },
    statsGrid: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 12,
        marginBottom: 24,
    },
    statCard: {
        flex: 1,
        minWidth: (width - 60) / 2,
        backgroundColor: "rgba(255, 255, 255, 0.15)",
        borderRadius: 16,
        padding: 20,
        alignItems: "center",
        borderWidth: 1,
        borderColor: "rgba(255, 255, 255, 0.2)",
    },
    statIconContainer: {
        width: 56,
        height: 56,
        borderRadius: 28,
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 12,
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
        textAlign: "center",
        fontWeight: "600" as const,
    },
    accuracyCard: {
        backgroundColor: "rgba(255, 255, 255, 0.15)",
        borderRadius: 20,
        padding: 24,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: "rgba(255, 255, 255, 0.2)",
    },
    accuracyTitle: {
        fontSize: 20,
        fontWeight: "700" as const,
        color: "#fff",
        marginBottom: 16,
    },
    accuracyBarContainer: {
        marginBottom: 24,
    },
    accuracyBarBg: {
        height: 12,
        backgroundColor: "rgba(255, 255, 255, 0.2)",
        borderRadius: 6,
        overflow: "hidden",
        marginBottom: 8,
    },
    accuracyBarFill: {
        height: "100%",
        borderRadius: 6,
    },
    accuracyPercentage: {
        fontSize: 32,
        fontWeight: "800" as const,
        color: "#fff",
        textAlign: "center",
    },
    phaseBreakdown: {
        gap: 12,
    },
    phaseItem: {
        gap: 8,
    },
    phaseLabel: {
        fontSize: 14,
        fontWeight: "600" as const,
        color: "rgba(255, 255, 255, 0.9)",
    },
    phaseBarContainer: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
    },
    phaseBarBg: {
        flex: 1,
        height: 6,
        backgroundColor: "rgba(255, 255, 255, 0.2)",
        borderRadius: 3,
        overflow: "hidden",
    },
    phaseBarFill: {
        height: "100%",
        borderRadius: 3,
    },
    phaseAccuracy: {
        fontSize: 14,
        fontWeight: "700" as const,
        color: "#fff",
        width: 45,
        textAlign: "right",
    },
    feedbackCard: {
        backgroundColor: "rgba(255, 255, 255, 0.15)",
        borderRadius: 20,
        padding: 24,
        marginBottom: 24,
        borderWidth: 1,
        borderColor: "rgba(255, 255, 255, 0.2)",
    },
    feedbackTitle: {
        fontSize: 20,
        fontWeight: "700" as const,
        color: "#fff",
        marginBottom: 12,
    },
    feedbackText: {
        fontSize: 16,
        color: "rgba(255, 255, 255, 0.9)",
        lineHeight: 24,
    },
    tipsContainer: {
        marginTop: 16,
        paddingTop: 16,
        borderTopWidth: 1,
        borderTopColor: "rgba(255, 255, 255, 0.2)",
    },
    tipsTitle: {
        fontSize: 15,
        fontWeight: "700" as const,
        color: "#fff",
        marginBottom: 8,
    },
    tipItem: {
        fontSize: 14,
        color: "rgba(255, 255, 255, 0.9)",
        lineHeight: 20,
        marginBottom: 4,
    },
    actionsContainer: {
        gap: 12,
    },
    primaryButton: {
        backgroundColor: "#fff",
        borderRadius: 16,
        paddingVertical: 18,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
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
        alignItems: "center",
        borderWidth: 2,
        borderColor: "rgba(255, 255, 255, 0.5)",
    },
    secondaryButtonText: {
        color: "#fff",
        fontSize: 17,
        fontWeight: "600" as const,
    },
});
