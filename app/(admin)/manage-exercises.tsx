import { Image } from "expo-image";
import {
    AlertCircle,
    Edit3,
    Image as ImageIcon,
    Plus,
    Search,
    Trash2,
} from "lucide-react-native";
import React, { useState } from "react";
import {
    Alert,
    Modal,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type ExerciseData = {
    id: string;
    name: string;
    difficulty: "Beginner" | "Intermediate" | "Advanced";
    category: "Upper Body" | "Lower Body" | "Core" | "Full Body";
    targetMuscles: string[];
    duration: number;
    image: string;
    description: string;
    instructions: string[];
    keyPoints: string[];
    commonMistakes: string[];
    referenceVideo?: string;
};

export default function ManageExercisesScreen() {
    const [searchQuery, setSearchQuery] = useState("");
    const [modalVisible, setModalVisible] = useState(false);
    const [editingExercise, setEditingExercise] = useState<ExerciseData | null>(null);
    const [selectedCategory, setSelectedCategory] = useState<string>("All");
    const [exercises, setExercises] = useState<ExerciseData[]>([
        {
            id: "squat",
            name: "Squat",
            difficulty: "Beginner",
            category: "Lower Body",
            targetMuscles: ["Quadriceps", "Glutes", "Hamstrings"],
            duration: 3,
            image: "https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=400",
            description:
                "A fundamental lower body exercise that builds strength in your legs and core.",
            instructions: [
                "Stand with feet shoulder-width apart",
                "Lower your body by bending knees and hips",
                "Keep chest up and back straight",
                "Push through heels to return to start",
            ],
            keyPoints: [
                "Keep knees aligned with toes",
                "Maintain neutral spine throughout",
                "Go as low as comfortable with good form",
            ],
            commonMistakes: [
                "Knees caving inward",
                "Rounding the lower back",
                "Lifting heels off the ground",
            ],
        },
        {
            id: "push-up",
            name: "Push-Up",
            difficulty: "Beginner",
            category: "Upper Body",
            targetMuscles: ["Chest", "Triceps", "Shoulders"],
            duration: 2,
            image: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=400",
            description:
                "Classic bodyweight exercise for building upper body and core strength.",
            instructions: [
                "Start in plank position with hands shoulder-width",
                "Lower body until chest nearly touches floor",
                "Keep core engaged and body straight",
                "Push back up to starting position",
            ],
            keyPoints: [
                "Maintain straight line from head to heels",
                "Elbows at 45-degree angle to body",
                "Controlled movement up and down",
            ],
            commonMistakes: [
                "Sagging hips",
                "Flaring elbows too wide",
                "Not going low enough",
            ],
        },
        {
            id: "plank",
            name: "Plank",
            difficulty: "Beginner",
            category: "Core",
            targetMuscles: ["Core", "Shoulders", "Back"],
            duration: 1,
            image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400",
            description: "Isometric core exercise that builds stability and endurance.",
            instructions: [
                "Get into forearm plank position",
                "Keep body in straight line",
                "Engage core and squeeze glutes",
                "Hold position without sagging",
            ],
            keyPoints: [
                "Don't let hips sag or pike up",
                "Keep neck neutral, don't look up",
                "Breathe steadily throughout",
            ],
            commonMistakes: [
                "Hips too high or too low",
                "Holding breath",
                "Shoulders not over elbows",
            ],
        },
    ]);

    const [formData, setFormData] = useState({
        name: "",
        difficulty: "Beginner" as ExerciseData["difficulty"],
        category: "Upper Body" as ExerciseData["category"],
        targetMuscles: "",
        duration: "",
        image: "",
        description: "",
        instructions: "",
        keyPoints: "",
        commonMistakes: "",
        referenceVideo: "",
    });

    const categories = ["All", "Upper Body", "Lower Body", "Core", "Full Body"];
    const difficulties: ExerciseData["difficulty"][] = ["Beginner", "Intermediate", "Advanced"];

    const filteredExercises = exercises.filter((exercise) => {
        const matchesSearch =
            exercise.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            exercise.category.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = selectedCategory === "All" || exercise.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    const handleSave = () => {
        if (!formData.name || !formData.description) {
            Alert.alert("Error", "Please fill in all required fields");
            return;
        }

        const newExercise: ExerciseData = {
            id: editingExercise?.id || formData.name.toLowerCase().replace(/\s+/g, "-"),
            name: formData.name,
            difficulty: formData.difficulty,
            category: formData.category,
            targetMuscles: formData.targetMuscles
                .split(",")
                .map((m) => m.trim())
                .filter((m) => m),
            duration: parseInt(formData.duration) || 3,
            image: formData.image || "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=400",
            description: formData.description,
            instructions: formData.instructions
                .split("\n")
                .map((i) => i.trim())
                .filter((i) => i),
            keyPoints: formData.keyPoints
                .split("\n")
                .map((k) => k.trim())
                .filter((k) => k),
            commonMistakes: formData.commonMistakes
                .split("\n")
                .map((m) => m.trim())
                .filter((m) => m),
            referenceVideo: formData.referenceVideo || undefined,
        };

        if (editingExercise) {
            setExercises(exercises.map((e) => (e.id === editingExercise.id ? newExercise : e)));
        } else {
            setExercises([...exercises, newExercise]);
        }

        setModalVisible(false);
        resetForm();
    };

    const resetForm = () => {
        setFormData({
            name: "",
            difficulty: "Beginner",
            category: "Upper Body",
            targetMuscles: "",
            duration: "",
            image: "",
            description: "",
            instructions: "",
            keyPoints: "",
            commonMistakes: "",
            referenceVideo: "",
        });
        setEditingExercise(null);
    };

    const handleEdit = (exercise: ExerciseData) => {
        setEditingExercise(exercise);
        setFormData({
            name: exercise.name,
            difficulty: exercise.difficulty,
            category: exercise.category,
            targetMuscles: exercise.targetMuscles.join(", "),
            duration: exercise.duration.toString(),
            image: exercise.image,
            description: exercise.description,
            instructions: exercise.instructions.join("\n"),
            keyPoints: exercise.keyPoints.join("\n"),
            commonMistakes: exercise.commonMistakes.join("\n"),
            referenceVideo: exercise.referenceVideo || "",
        });
        setModalVisible(true);
    };

    const handleDelete = (id: string) => {
        Alert.alert("Delete Exercise", "Are you sure you want to delete this exercise?", [
            { text: "Cancel", style: "cancel" },
            {
                text: "Delete",
                style: "destructive",
                onPress: () => setExercises(exercises.filter((e) => e.id !== id)),
            },
        ]);
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" />
            <SafeAreaView style={styles.safeArea}>
                <View style={styles.header}>
                    <Text style={styles.headerTitle}>Manage Exercises</Text>
                    <Text style={styles.headerSubtitle}>
                        Add and update exercise types, instructions, and reference media
                    </Text>
                </View>

                <View style={styles.searchContainer}>
                    <Search color="#666" size={20} style={styles.searchIcon} />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search exercises..."
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        placeholderTextColor="#999"
                    />
                </View>

                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    style={styles.categoryScroll}
                    contentContainerStyle={styles.categoryContainer}
                >
                    {categories.map((category) => (
                        <TouchableOpacity
                            key={category}
                            style={[
                                styles.categoryChip,
                                selectedCategory === category && styles.categoryChipActive,
                            ]}
                            onPress={() => setSelectedCategory(category)}
                            activeOpacity={0.7}
                        >
                            <Text
                                style={[
                                    styles.categoryChipText,
                                    selectedCategory === category && styles.categoryChipTextActive,
                                ]}
                            >
                                {category}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>

                <TouchableOpacity
                    style={styles.addButton}
                    onPress={() => {
                        resetForm();
                        setModalVisible(true);
                    }}
                    activeOpacity={0.8}
                >
                    <Plus color="#fff" size={20} />
                    <Text style={styles.addButtonText}>Add New Exercise</Text>
                </TouchableOpacity>

                <ScrollView
                    style={styles.scrollView}
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                >
                    {filteredExercises.length === 0 ? (
                        <View style={styles.emptyState}>
                            <AlertCircle color="#ccc" size={64} />
                            <Text style={styles.emptyStateText}>No exercises found</Text>
                            <Text style={styles.emptyStateSubtext}>
                                {searchQuery || selectedCategory !== "All"
                                    ? "Try adjusting your filters"
                                    : "Add your first exercise"}
                            </Text>
                        </View>
                    ) : (
                        filteredExercises.map((exercise) => (
                            <View key={exercise.id} style={styles.exerciseCard}>
                                <Image
                                    source={{ uri: exercise.image }}
                                    style={styles.exerciseImage}
                                    contentFit="cover"
                                />
                                <View style={styles.exerciseContent}>
                                    <View style={styles.exerciseHeader}>
                                        <View style={styles.exerciseInfo}>
                                            <Text style={styles.exerciseName}>{exercise.name}</Text>
                                            <View style={styles.exerciseMeta}>
                                                <View
                                                    style={[
                                                        styles.difficultyBadge,
                                                        exercise.difficulty === "Beginner" && styles.difficultyBeginner,
                                                        exercise.difficulty === "Intermediate" && styles.difficultyIntermediate,
                                                        exercise.difficulty === "Advanced" && styles.difficultyAdvanced,
                                                    ]}
                                                >
                                                    <Text style={styles.difficultyText}>{exercise.difficulty}</Text>
                                                </View>
                                                <Text style={styles.categoryText}>{exercise.category}</Text>
                                            </View>
                                        </View>
                                    </View>

                                    <Text style={styles.exerciseDescription} numberOfLines={2}>
                                        {exercise.description}
                                    </Text>

                                    <View style={styles.exerciseDetails}>
                                        <View style={styles.detailItem}>
                                            <Text style={styles.detailLabel}>Target Muscles</Text>
                                            <Text style={styles.detailValue}>
                                                {exercise.targetMuscles.join(", ")}
                                            </Text>
                                        </View>
                                        <View style={styles.detailItem}>
                                            <Text style={styles.detailLabel}>Duration</Text>
                                            <Text style={styles.detailValue}>{exercise.duration} min</Text>
                                        </View>
                                    </View>

                                    <View style={styles.exerciseActions}>
                                        <TouchableOpacity
                                            style={[styles.actionButton, styles.editButton]}
                                            onPress={() => handleEdit(exercise)}
                                            activeOpacity={0.7}
                                        >
                                            <Edit3 color="#00A8E8" size={18} />
                                            <Text style={styles.editButtonText}>Edit</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                            style={[styles.actionButton, styles.deleteButton]}
                                            onPress={() => handleDelete(exercise.id)}
                                            activeOpacity={0.7}
                                        >
                                            <Trash2 color="#FF5252" size={18} />
                                            <Text style={styles.deleteButtonText}>Delete</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            </View>
                        ))
                    )}
                </ScrollView>
            </SafeAreaView>

            <Modal
                visible={modalVisible}
                animationType="slide"
                presentationStyle="pageSheet"
                onRequestClose={() => setModalVisible(false)}
            >
                <SafeAreaView style={styles.modalContainer}>
                    <View style={styles.modalHeader}>
                        <TouchableOpacity
                            onPress={() => {
                                setModalVisible(false);
                                resetForm();
                            }}
                        >
                            <Text style={styles.cancelText}>Cancel</Text>
                        </TouchableOpacity>
                        <Text style={styles.modalTitle}>
                            {editingExercise ? "Edit Exercise" : "New Exercise"}
                        </Text>
                        <TouchableOpacity onPress={handleSave}>
                            <Text style={styles.saveText}>Save</Text>
                        </TouchableOpacity>
                    </View>

                    <ScrollView
                        style={styles.modalScroll}
                        contentContainerStyle={styles.modalContent}
                        showsVerticalScrollIndicator={false}
                    >
                        <View style={styles.formGroup}>
                            <Text style={styles.label}>Exercise Name *</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="e.g., Squat"
                                value={formData.name}
                                onChangeText={(text) => setFormData({ ...formData, name: text })}
                                placeholderTextColor="#999"
                            />
                        </View>

                        <View style={styles.formRow}>
                            <View style={styles.formGroupHalf}>
                                <Text style={styles.label}>Difficulty</Text>
                                <View style={styles.pickerContainer}>
                                    {difficulties.map((diff) => (
                                        <TouchableOpacity
                                            key={diff}
                                            style={[
                                                styles.pickerOption,
                                                formData.difficulty === diff && styles.pickerOptionActive,
                                            ]}
                                            onPress={() => setFormData({ ...formData, difficulty: diff })}
                                            activeOpacity={0.7}
                                        >
                                            <Text
                                                style={[
                                                    styles.pickerOptionText,
                                                    formData.difficulty === diff && styles.pickerOptionTextActive,
                                                ]}
                                            >
                                                {diff}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </View>

                            <View style={styles.formGroupHalf}>
                                <Text style={styles.label}>Duration (min)</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="3"
                                    keyboardType="numeric"
                                    value={formData.duration}
                                    onChangeText={(text) => setFormData({ ...formData, duration: text })}
                                    placeholderTextColor="#999"
                                />
                            </View>
                        </View>

                        <View style={styles.formGroup}>
                            <Text style={styles.label}>Category</Text>
                            <ScrollView
                                horizontal
                                showsHorizontalScrollIndicator={false}
                                style={styles.categoryPickerScroll}
                            >
                                {categories.filter((c) => c !== "All").map((cat) => (
                                    <TouchableOpacity
                                        key={cat}
                                        style={[
                                            styles.categoryPickerOption,
                                            formData.category === cat && styles.categoryPickerOptionActive,
                                        ]}
                                        onPress={() =>
                                            setFormData({
                                                ...formData,
                                                category: cat as ExerciseData["category"],
                                            })
                                        }
                                        activeOpacity={0.7}
                                    >
                                        <Text
                                            style={[
                                                styles.categoryPickerText,
                                                formData.category === cat && styles.categoryPickerTextActive,
                                            ]}
                                        >
                                            {cat}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>
                        </View>

                        <View style={styles.formGroup}>
                            <Text style={styles.label}>Target Muscles (comma-separated)</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="e.g., Quadriceps, Glutes, Hamstrings"
                                value={formData.targetMuscles}
                                onChangeText={(text) => setFormData({ ...formData, targetMuscles: text })}
                                placeholderTextColor="#999"
                            />
                        </View>

                        <View style={styles.formGroup}>
                            <Text style={styles.label}>Description *</Text>
                            <TextInput
                                style={[styles.input, styles.textArea]}
                                placeholder="Brief description of the exercise"
                                value={formData.description}
                                onChangeText={(text) => setFormData({ ...formData, description: text })}
                                multiline
                                numberOfLines={3}
                                placeholderTextColor="#999"
                            />
                        </View>

                        <View style={styles.formGroup}>
                            <Text style={styles.label}>Image URL</Text>
                            <View style={styles.imageInputContainer}>
                                <ImageIcon color="#666" size={20} />
                                <TextInput
                                    style={styles.imageInput}
                                    placeholder="https://example.com/image.jpg"
                                    value={formData.image}
                                    onChangeText={(text) => setFormData({ ...formData, image: text })}
                                    placeholderTextColor="#999"
                                />
                            </View>
                        </View>

                        <View style={styles.formGroup}>
                            <Text style={styles.label}>Reference Video URL (optional)</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="https://youtube.com/..."
                                value={formData.referenceVideo}
                                onChangeText={(text) => setFormData({ ...formData, referenceVideo: text })}
                                placeholderTextColor="#999"
                            />
                        </View>

                        <View style={styles.formGroup}>
                            <Text style={styles.label}>Instructions (one per line)</Text>
                            <TextInput
                                style={[styles.input, styles.textArea]}
                                placeholder="Step 1&#10;Step 2&#10;Step 3"
                                value={formData.instructions}
                                onChangeText={(text) => setFormData({ ...formData, instructions: text })}
                                multiline
                                numberOfLines={4}
                                placeholderTextColor="#999"
                            />
                        </View>

                        <View style={styles.formGroup}>
                            <Text style={styles.label}>Key Points (one per line)</Text>
                            <TextInput
                                style={[styles.input, styles.textArea]}
                                placeholder="Key point 1&#10;Key point 2"
                                value={formData.keyPoints}
                                onChangeText={(text) => setFormData({ ...formData, keyPoints: text })}
                                multiline
                                numberOfLines={3}
                                placeholderTextColor="#999"
                            />
                        </View>

                        <View style={styles.formGroup}>
                            <Text style={styles.label}>Common Mistakes (one per line)</Text>
                            <TextInput
                                style={[styles.input, styles.textArea]}
                                placeholder="Mistake 1&#10;Mistake 2"
                                value={formData.commonMistakes}
                                onChangeText={(text) => setFormData({ ...formData, commonMistakes: text })}
                                multiline
                                numberOfLines={3}
                                placeholderTextColor="#999"
                            />
                        </View>

                        <View style={styles.infoBox}>
                            <AlertCircle color="#00A8E8" size={20} />
                            <Text style={styles.infoText}>
                                Add comprehensive exercise information including instructions, reference
                                media, and form guidance to help users perform exercises correctly.
                            </Text>
                        </View>
                    </ScrollView>
                </SafeAreaView>
            </Modal>
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
    categoryScroll: {
        marginTop: 16,
        marginBottom: 16,
    },
    categoryContainer: {
        paddingHorizontal: 24,
        flexDirection: 'row',
    },
    categoryChip: {
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 20,
        backgroundColor: "#fff",
        borderWidth: 1,
        borderColor: "#e0e0e0",
        height: 40,
        marginRight: 12,
    },
    categoryChipActive: {
        backgroundColor: "#00A8E8",
        borderColor: "#00A8E8",
    },
    categoryChipText: {
        fontSize: 14,
        fontWeight: "600" as const,
        color: "#666",
    },
    categoryChipTextActive: {
        color: "#fff",
    },
    addButton: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#00A8E8",
        marginHorizontal: 24,
        marginTop: -400,
        paddingVertical: 14,
        borderRadius: 12,
        gap: 8,
    },
    addButtonText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "700" as const,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        padding: 24,
    },
    emptyState: {
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 80,
    },
    emptyStateText: {
        fontSize: 18,
        fontWeight: "600" as const,
        color: "#666",
        marginTop: 16,
    },
    emptyStateSubtext: {
        fontSize: 14,
        color: "#999",
        marginTop: 8,
    },
    exerciseCard: {
        backgroundColor: "#fff",
        borderRadius: 16,
        marginBottom: 16,
        overflow: "hidden",
        borderWidth: 1,
        borderColor: "#e0e0e0",
    },
    exerciseImage: {
        width: "100%",
        height: 200,
        backgroundColor: "#f0f0f0",
    },
    exerciseContent: {
        padding: 16,
    },
    exerciseHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-start",
        marginBottom: 8,
    },
    exerciseInfo: {
        flex: 1,
    },
    exerciseName: {
        fontSize: 20,
        fontWeight: "700" as const,
        color: "#1a1a1a",
        marginBottom: 8,
    },
    exerciseMeta: {
        flexDirection: "row",
        gap: 8,
        alignItems: "center",
    },
    difficultyBadge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8,
    },
    difficultyBeginner: {
        backgroundColor: "#E8F5E9",
    },
    difficultyIntermediate: {
        backgroundColor: "#FFF3E0",
    },
    difficultyAdvanced: {
        backgroundColor: "#FFEBEE",
    },
    difficultyText: {
        fontSize: 12,
        fontWeight: "600" as const,
        color: "#1a1a1a",
    },
    categoryText: {
        fontSize: 13,
        color: "#00A8E8",
        fontWeight: "600" as const,
    },
    exerciseDescription: {
        fontSize: 14,
        color: "#666",
        lineHeight: 20,
        marginBottom: 12,
    },
    exerciseDetails: {
        backgroundColor: "#f9f9f9",
        borderRadius: 10,
        padding: 12,
        marginBottom: 12,
    },
    detailItem: {
        marginBottom: 6,
    },
    detailLabel: {
        fontSize: 12,
        color: "#999",
        marginBottom: 2,
    },
    detailValue: {
        fontSize: 14,
        fontWeight: "600" as const,
        color: "#1a1a1a",
    },
    exerciseActions: {
        flexDirection: "row",
        gap: 12,
    },
    actionButton: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 12,
        borderRadius: 10,
        gap: 6,
    },
    editButton: {
        backgroundColor: "#E3F5FF",
    },
    editButtonText: {
        color: "#00A8E8",
        fontSize: 15,
        fontWeight: "600" as const,
    },
    deleteButton: {
        backgroundColor: "#FFE8E8",
    },
    deleteButtonText: {
        color: "#FF5252",
        fontSize: 15,
        fontWeight: "600" as const,
    },
    modalContainer: {
        flex: 1,
        backgroundColor: "#fff",
    },
    modalHeader: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 24,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: "#e0e0e0",
    },
    cancelText: {
        fontSize: 16,
        color: "#666",
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: "700" as const,
        color: "#1a1a1a",
    },
    saveText: {
        fontSize: 16,
        fontWeight: "700" as const,
        color: "#00A8E8",
    },
    modalScroll: {
        flex: 1,
    },
    modalContent: {
        padding: 24,
    },
    formGroup: {
        marginBottom: 24,
    },
    formRow: {
        flexDirection: "row",
        gap: 12,
        marginBottom: 24,
    },
    formGroupHalf: {
        flex: 1,
    },
    label: {
        fontSize: 16,
        fontWeight: "600" as const,
        color: "#1a1a1a",
        marginBottom: 8,
    },
    input: {
        backgroundColor: "#f9f9f9",
        borderWidth: 1,
        borderColor: "#e0e0e0",
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 14,
        fontSize: 16,
        color: "#1a1a1a",
    },
    textArea: {
        minHeight: 100,
        textAlignVertical: "top",
        paddingTop: 14,
    },
    imageInputContainer: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#f9f9f9",
        borderWidth: 1,
        borderColor: "#e0e0e0",
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 14,
        gap: 8,
    },
    imageInput: {
        flex: 1,
        fontSize: 16,
        color: "#1a1a1a",
    },
    pickerContainer: {
        gap: 8,
    },
    pickerOption: {
        backgroundColor: "#f9f9f9",
        borderWidth: 1,
        borderColor: "#e0e0e0",
        borderRadius: 10,
        paddingVertical: 12,
        paddingHorizontal: 16,
        alignItems: "center",
    },
    pickerOptionActive: {
        backgroundColor: "#E3F5FF",
        borderColor: "#00A8E8",
    },
    pickerOptionText: {
        fontSize: 15,
        fontWeight: "600" as const,
        color: "#666",
    },
    pickerOptionTextActive: {
        color: "#00A8E8",
    },
    categoryPickerScroll: {
        marginBottom: 0,
    },
    categoryPickerOption: {
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 10,
        backgroundColor: "#f9f9f9",
        borderWidth: 1,
        borderColor: "#e0e0e0",
        marginRight: 8,
    },
    categoryPickerOptionActive: {
        backgroundColor: "#E3F5FF",
        borderColor: "#00A8E8",
    },
    categoryPickerText: {
        fontSize: 14,
        fontWeight: "600" as const,
        color: "#666",
    },
    categoryPickerTextActive: {
        color: "#00A8E8",
    },
    infoBox: {
        flexDirection: "row",
        backgroundColor: "#E3F5FF",
        borderRadius: 12,
        padding: 16,
        gap: 12,
        marginTop: 8,
    },
    infoText: {
        flex: 1,
        fontSize: 14,
        color: "#0077B6",
        lineHeight: 20,
    },
});
