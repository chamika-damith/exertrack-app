import { Exercise, exercises } from "@/constants/exercises";
import { router } from "expo-router";
import {
    ArrowLeft,
    ChevronRight,
    Dumbbell,
    Filter,
    Zap,
} from "lucide-react-native";
import React, { useMemo, useState } from "react";
import {
    Image,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type CategoryFilter = "All" | "Upper Body" | "Lower Body" | "Core" | "Full Body";

export default function ExercisesScreen() {
    const [searchQuery, setSearchQuery] = useState("");
    const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>("All");

    const filteredExercises = useMemo(() => {
        return exercises.filter((exercise) => {
            const matchesSearch = exercise.name
                .toLowerCase()
                .includes(searchQuery.toLowerCase());
            const matchesCategory =
                categoryFilter === "All" || exercise.category === categoryFilter;
            return matchesSearch && matchesCategory;
        });
    }, [searchQuery, categoryFilter]);

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" />
            <SafeAreaView style={styles.safeArea} edges={["top"]}>
                <View style={styles.header}>
                    <View style={styles.headerTop}>
                        <View style={styles.headerTopLeft}>
                            <TouchableOpacity
                                style={styles.backButton}
                                onPress={() => router.back()}
                                activeOpacity={0.7}
                            >
                                <ArrowLeft color="#1A1A1A" size={24} />
                            </TouchableOpacity>
                            <View>
                                <Text style={styles.headerTitle}>Exercises</Text>
                                <Text style={styles.headerSubtitle}>
                                    {filteredExercises.length} exercises available
                                </Text>
                            </View>
                        </View>
                        <TouchableOpacity style={styles.filterButton}>
                            <Filter color="#00A8E8" size={24} />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.searchContainer}>
                        <TextInput
                            style={styles.searchInput}
                            placeholder="Search exercises..."
                            placeholderTextColor="#999"
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                        />
                    </View>

                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        style={styles.filtersScroll}
                        contentContainerStyle={styles.filtersContent}
                    >
                        <FilterChip
                            label="All"
                            active={categoryFilter === "All"}
                            onPress={() => setCategoryFilter("All")}
                        />
                        <FilterChip
                            label="Upper Body"
                            active={categoryFilter === "Upper Body"}
                            onPress={() => setCategoryFilter("Upper Body")}
                        />
                        <FilterChip
                            label="Lower Body"
                            active={categoryFilter === "Lower Body"}
                            onPress={() => setCategoryFilter("Lower Body")}
                        />
                        <FilterChip
                            label="Core"
                            active={categoryFilter === "Core"}
                            onPress={() => setCategoryFilter("Core")}
                        />
                        <FilterChip
                            label="Full Body"
                            active={categoryFilter === "Full Body"}
                            onPress={() => setCategoryFilter("Full Body")}
                        />
                    </ScrollView>
                </View>

                <ScrollView
                    style={styles.content}
                    contentContainerStyle={styles.contentContainer}
                    showsVerticalScrollIndicator={false}
                >
                    {filteredExercises.map((exercise) => (
                        <ExerciseCard key={exercise.id} exercise={exercise} />
                    ))}
                </ScrollView>
            </SafeAreaView>
        </View>
    );
}

function FilterChip({
    label,
    active,
    onPress,
}: {
    label: string;
    active: boolean;
    onPress: () => void;
}) {
    return (
        <TouchableOpacity
            style={[styles.filterChip, active && styles.filterChipActive]}
            onPress={onPress}
            activeOpacity={0.7}
        >
            <Text style={[styles.filterChipText, active && styles.filterChipTextActive]}>
                {label}
            </Text>
        </TouchableOpacity>
    );
}

function ExerciseCard({ exercise }: { exercise: Exercise }) {
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
        <TouchableOpacity
            style={styles.exerciseCard}
            onPress={() => router.push(`/exercise/${exercise.id}`)}
            activeOpacity={0.7}
        >
            <Image source={{ uri: exercise.image }} style={styles.exerciseImage} />
            <View style={styles.exerciseContent}>
                <View style={styles.exerciseHeader}>
                    <Text style={styles.exerciseName}>{exercise.name}</Text>
                    <ChevronRight color="#999" size={20} />
                </View>
                <Text style={styles.exerciseDescription} numberOfLines={2}>
                    {exercise.description}
                </Text>
                <View style={styles.exerciseMeta}>
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
                        <Dumbbell color="#666" size={14} />
                        <Text style={styles.metaText}>{exercise.category}</Text>
                    </View>
                    <View style={styles.metaItem}>
                        <Zap color="#666" size={14} />
                        <Text style={styles.metaText}>{exercise.duration} min</Text>
                    </View>
                </View>
            </View>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#F8F9FA",
    },
    safeArea: {
        flex: 1,
    },
    header: {
        backgroundColor: "#fff",
        paddingHorizontal: 20,
        paddingBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: "#E5E5E5",
    },
    headerTop: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 16,
    },
    headerTopLeft: {
        flexDirection: "row",
        alignItems: "center",
        flex: 1,
        gap: 12,
    },
    backButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: "#F5F5F5",
        alignItems: "center",
        justifyContent: "center",
    },
    headerTitle: {
        fontSize: 32,
        fontWeight: "800" as const,
        color: "#1A1A1A",
    },
    headerSubtitle: {
        fontSize: 14,
        color: "#666",
        marginTop: 2,
    },
    filterButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: "#F0F9FF",
        alignItems: "center",
        justifyContent: "center",
    },
    searchContainer: {
        marginBottom: 16,
    },
    searchInput: {
        height: 48,
        backgroundColor: "#F5F5F5",
        borderRadius: 12,
        paddingHorizontal: 16,
        fontSize: 16,
        color: "#1A1A1A",
    },
    filtersScroll: {
        marginHorizontal: -20,
    },
    filtersContent: {
        paddingHorizontal: 20,
        gap: 8,
    },
    filterChip: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: "#F5F5F5",
        marginRight: 8,
    },
    filterChipActive: {
        backgroundColor: "#00A8E8",
    },
    filterChipText: {
        fontSize: 14,
        fontWeight: "600" as const,
        color: "#666",
    },
    filterChipTextActive: {
        color: "#fff",
    },
    content: {
        flex: 1,
    },
    contentContainer: {
        padding: 20,
        gap: 16,
    },
    exerciseCard: {
        backgroundColor: "#fff",
        borderRadius: 16,
        overflow: "hidden",
        marginBottom: 16,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
        elevation: 2,
    },
    exerciseImage: {
        width: "100%",
        height: 160,
        backgroundColor: "#E5E5E5",
    },
    exerciseContent: {
        padding: 16,
    },
    exerciseHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 8,
    },
    exerciseName: {
        fontSize: 20,
        fontWeight: "700" as const,
        color: "#1A1A1A",
    },
    exerciseDescription: {
        fontSize: 14,
        color: "#666",
        lineHeight: 20,
        marginBottom: 12,
    },
    exerciseMeta: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
    },
    difficultyBadge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8,
    },
    difficultyText: {
        fontSize: 12,
        fontWeight: "600" as const,
    },
    metaItem: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
    },
    metaText: {
        fontSize: 13,
        color: "#666",
        fontWeight: "500" as const,
    },
});
