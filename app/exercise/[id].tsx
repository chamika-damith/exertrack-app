import { exercises } from "@/constants/exercises";
import { router, useLocalSearchParams } from "expo-router";
import {
    AlertCircle,
    CheckCircle,
    ChevronLeft,
    Clock,
    Play,
    Target,
} from "lucide-react-native";
import React from "react";
import {
    Image,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ExerciseDetailScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const exercise = exercises.find((ex) => ex.id === id);

    if (!exercise) {
        return (
            <View style={styles.container}>
                <Text>Exercise not found</Text>
            </View>
        );
    }

    const getDifficultyColor = () => {
        switch (exercise.difficulty) {
            case "Beginner":
                return "#00C853";
            case "Intermediate":
                return "#FFC107";
            case "Advanced":
                return "#FF5252";
        }
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" />
            <Image source={{ uri: exercise.image }} style={styles.heroImage} />
            <TouchableOpacity
                style={styles.backButton}
                onPress={() => router.back()}
                activeOpacity={0.7}
            >
                <ChevronLeft color="#fff" size={28} />
            </TouchableOpacity>

            <ScrollView
                style={styles.content}
                contentContainerStyle={styles.contentContainer}
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.card}>
                    <Text style={styles.exerciseName}>{exercise.name}</Text>
                    <Text style={styles.exerciseDescription}>{exercise.description}</Text>

                    <View style={styles.metaRow}>
                        <View
                            style={[
                                styles.difficultyBadge,
                                { backgroundColor: getDifficultyColor() + "20" },
                            ]}
                        >
                            <Text
                                style={[styles.difficultyText, { color: getDifficultyColor() }]}
                            >
                                {exercise.difficulty}
                            </Text>
                        </View>
                        <View style={styles.metaItem}>
                            <Clock color="#666" size={16} />
                            <Text style={styles.metaText}>{exercise.duration} min</Text>
                        </View>
                        <View style={styles.metaItem}>
                            <Target color="#666" size={16} />
                            <Text style={styles.metaText}>{exercise.category}</Text>
                        </View>
                    </View>

                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Target Muscles</Text>
                        <View style={styles.musclesList}>
                            {exercise.targetMuscles.map((muscle, index) => (
                                <View key={index} style={styles.muscleChip}>
                                    <Text style={styles.muscleText}>{muscle}</Text>
                                </View>
                            ))}
                        </View>
                    </View>

                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Instructions</Text>
                        {exercise.instructions.map((instruction, index) => (
                            <View key={index} style={styles.instructionItem}>
                                <View style={styles.instructionNumber}>
                                    <Text style={styles.instructionNumberText}>{index + 1}</Text>
                                </View>
                                <Text style={styles.instructionText}>{instruction}</Text>
                            </View>
                        ))}
                    </View>

                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <CheckCircle color="#00C853" size={20} />
                            <Text style={styles.sectionTitle}>Key Points</Text>
                        </View>
                        {exercise.keyPoints.map((point, index) => (
                            <View key={index} style={styles.bulletItem}>
                                <View style={styles.bulletDot} />
                                <Text style={styles.bulletText}>{point}</Text>
                            </View>
                        ))}
                    </View>

                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <AlertCircle color="#FF5252" size={20} />
                            <Text style={styles.sectionTitle}>Common Mistakes</Text>
                        </View>
                        {exercise.commonMistakes.map((mistake, index) => (
                            <View key={index} style={styles.bulletItem}>
                                <View style={[styles.bulletDot, styles.bulletDotRed]} />
                                <Text style={styles.bulletText}>{mistake}</Text>
                            </View>
                        ))}
                    </View>
                </View>
            </ScrollView>

            <SafeAreaView style={styles.footer} edges={["bottom"]}>
                <TouchableOpacity
                    style={styles.startButton}
                    onPress={() => router.push(`/camera/${exercise.id}`)}
                    activeOpacity={0.8}
                >
                    <Play color="#fff" size={24} fill="#fff" />
                    <Text style={styles.startButtonText}>Start Exercise</Text>
                </TouchableOpacity>
            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#F8F9FA",
    },
    heroImage: {
        width: "100%",
        height: 280,
        backgroundColor: "#E5E5E5",
    },
    backButton: {
        position: "absolute",
        top: 48,
        left: 16,
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: "rgba(0, 0, 0, 0.3)",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 10,
    },
    content: {
        flex: 1,
    },
    contentContainer: {
        padding: 20,
        paddingBottom: 100,
    },
    card: {
        backgroundColor: "#fff",
        borderRadius: 20,
        padding: 24,
        marginTop: -40,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
        elevation: 4,
    },
    exerciseName: {
        fontSize: 32,
        fontWeight: "800" as const,
        color: "#1A1A1A",
        marginBottom: 8,
    },
    exerciseDescription: {
        fontSize: 16,
        color: "#666",
        lineHeight: 24,
        marginBottom: 20,
    },
    metaRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
        paddingBottom: 20,
        borderBottomWidth: 1,
        borderBottomColor: "#E5E5E5",
    },
    difficultyBadge: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
    },
    difficultyText: {
        fontSize: 13,
        fontWeight: "700" as const,
    },
    metaItem: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
    },
    metaText: {
        fontSize: 14,
        color: "#666",
        fontWeight: "500" as const,
    },
    section: {
        marginTop: 24,
    },
    sectionHeader: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        marginBottom: 12,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: "700" as const,
        color: "#1A1A1A",
        marginBottom: 12,
    },
    musclesList: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 8,
    },
    muscleChip: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
        backgroundColor: "#E3F2FD",
    },
    muscleText: {
        fontSize: 14,
        color: "#00A8E8",
        fontWeight: "600" as const,
    },
    instructionItem: {
        flexDirection: "row",
        alignItems: "flex-start",
        marginBottom: 16,
    },
    instructionNumber: {
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: "#00A8E8",
        alignItems: "center",
        justifyContent: "center",
        marginRight: 12,
    },
    instructionNumberText: {
        color: "#fff",
        fontSize: 14,
        fontWeight: "700" as const,
    },
    instructionText: {
        flex: 1,
        fontSize: 15,
        color: "#333",
        lineHeight: 22,
        paddingTop: 4,
    },
    bulletItem: {
        flexDirection: "row",
        alignItems: "flex-start",
        marginBottom: 12,
    },
    bulletDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: "#00C853",
        marginTop: 8,
        marginRight: 12,
    },
    bulletDotRed: {
        backgroundColor: "#FF5252",
    },
    bulletText: {
        flex: 1,
        fontSize: 15,
        color: "#333",
        lineHeight: 22,
    },
    footer: {
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: "#fff",
        borderTopWidth: 1,
        borderTopColor: "#E5E5E5",
        paddingHorizontal: 20,
        paddingTop: 16,
    },
    startButton: {
        backgroundColor: "#00A8E8",
        borderRadius: 16,
        paddingVertical: 18,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        shadowColor: "#00A8E8",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
    },
    startButtonText: {
        color: "#fff",
        fontSize: 18,
        fontWeight: "700" as const,
    },
});
