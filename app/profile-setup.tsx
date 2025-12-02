import { useUser } from "@/contexts/UserContext";
import { FitnessGoal } from "@/types/user";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { AlertCircle, CheckCircle, Ruler, Target, User, Weight } from "lucide-react-native";
import React, { useState } from "react";
import {
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const FITNESS_GOALS: { value: FitnessGoal; label: string; description: string }[] = [
    { value: "weight_loss", label: "Weight Loss", description: "Burn calories and lose weight" },
    { value: "muscle_gain", label: "Muscle Gain", description: "Build strength and muscle mass" },
    { value: "general_fitness", label: "General Fitness", description: "Stay healthy and active" },
    { value: "rehabilitation", label: "Rehabilitation", description: "Recover from injury" },
];

export default function ProfileSetupScreen() {
    const { updateProfile } = useUser();
    const [age, setAge] = useState<string>("");
    const [height, setHeight] = useState<string>("");
    const [weight, setWeight] = useState<string>("");
    const [selectedGoal, setSelectedGoal] = useState<FitnessGoal>("general_fitness");
    const [error, setError] = useState<string>("");
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const handleSave = async () => {
        setError("");

        if (!age || !height || !weight) {
            setError("Please fill in all fields");
            return;
        }

        const ageNum = parseInt(age, 10);
        const heightNum = parseFloat(height);
        const weightNum = parseFloat(weight);

        if (isNaN(ageNum) || ageNum < 1 || ageNum > 120) {
            setError("Please enter a valid age");
            return;
        }

        if (isNaN(heightNum) || heightNum < 50 || heightNum > 300) {
            setError("Please enter a valid height (50-300 cm)");
            return;
        }

        if (isNaN(weightNum) || weightNum < 20 || weightNum > 500) {
            setError("Please enter a valid weight (20-500 kg)");
            return;
        }

        setIsLoading(true);
        const result = await updateProfile({
            age: ageNum,
            height: heightNum,
            weight: weightNum,
            fitnessGoal: selectedGoal,
        });
        setIsLoading(false);

        if (result.success) {
            router.replace("/");
        } else {
            setError(result.error || "Failed to save profile");
        }
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" />
            <LinearGradient
                colors={["#023E8A", "#0077B6", "#00A8E8"]}
                style={styles.gradient}
            >
                <SafeAreaView style={styles.safeArea}>
                    <KeyboardAvoidingView
                        behavior={Platform.OS === "ios" ? "padding" : "height"}
                        style={styles.keyboardView}
                    >
                        <ScrollView
                            contentContainerStyle={styles.scrollContent}
                            showsVerticalScrollIndicator={false}
                            keyboardShouldPersistTaps="handled"
                        >
                            <View style={styles.header}>
                                <View style={styles.iconContainer}>
                                    <User color="#00A8E8" size={40} strokeWidth={2.5} />
                                </View>
                                <Text style={styles.title}>Complete Your Profile</Text>
                                <Text style={styles.subtitle}>
                                    Help us personalize your experience
                                </Text>
                            </View>

                            {error ? (
                                <View style={styles.errorContainer}>
                                    <AlertCircle color="#FF5252" size={20} />
                                    <Text style={styles.errorText}>{error}</Text>
                                </View>
                            ) : null}

                            <View style={styles.form}>
                                <Text style={styles.sectionTitle}>Personal Information</Text>

                                <View style={styles.inputContainer}>
                                    <View style={styles.inputIconContainer}>
                                        <User color="rgba(255, 255, 255, 0.7)" size={20} />
                                    </View>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Age (years)"
                                        placeholderTextColor="rgba(255, 255, 255, 0.6)"
                                        value={age}
                                        onChangeText={setAge}
                                        keyboardType="numeric"
                                        editable={!isLoading}
                                    />
                                </View>

                                <View style={styles.inputContainer}>
                                    <View style={styles.inputIconContainer}>
                                        <Ruler color="rgba(255, 255, 255, 0.7)" size={20} />
                                    </View>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Height (cm)"
                                        placeholderTextColor="rgba(255, 255, 255, 0.6)"
                                        value={height}
                                        onChangeText={setHeight}
                                        keyboardType="numeric"
                                        editable={!isLoading}
                                    />
                                </View>

                                <View style={styles.inputContainer}>
                                    <View style={styles.inputIconContainer}>
                                        <Weight color="rgba(255, 255, 255, 0.7)" size={20} />
                                    </View>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Weight (kg)"
                                        placeholderTextColor="rgba(255, 255, 255, 0.6)"
                                        value={weight}
                                        onChangeText={setWeight}
                                        keyboardType="numeric"
                                        editable={!isLoading}
                                    />
                                </View>

                                <Text style={styles.sectionTitle}>Fitness Goal</Text>

                                {FITNESS_GOALS.map((goal) => (
                                    <TouchableOpacity
                                        key={goal.value}
                                        style={[
                                            styles.goalCard,
                                            selectedGoal === goal.value && styles.goalCardSelected,
                                        ]}
                                        onPress={() => setSelectedGoal(goal.value)}
                                        activeOpacity={0.7}
                                        disabled={isLoading}
                                    >
                                        <View style={styles.goalCardContent}>
                                            <View style={styles.goalCardIcon}>
                                                <Target
                                                    color={selectedGoal === goal.value ? "#00C853" : "rgba(255, 255, 255, 0.7)"}
                                                    size={24}
                                                />
                                            </View>
                                            <View style={styles.goalCardText}>
                                                <Text style={styles.goalCardTitle}>{goal.label}</Text>
                                                <Text style={styles.goalCardDescription}>{goal.description}</Text>
                                            </View>
                                            {selectedGoal === goal.value ? (
                                                <CheckCircle color="#00C853" size={24} />
                                            ) : null}
                                        </View>
                                    </TouchableOpacity>
                                ))}

                                <TouchableOpacity
                                    style={[styles.saveButton, isLoading && styles.saveButtonDisabled]}
                                    onPress={handleSave}
                                    disabled={isLoading}
                                    activeOpacity={0.8}
                                >
                                    {isLoading ? (
                                        <ActivityIndicator color="#00A8E8" size="small" />
                                    ) : (
                                        <>
                                            <Text style={styles.saveButtonText}>Complete Setup</Text>
                                            <CheckCircle color="#00A8E8" size={20} />
                                        </>
                                    )}
                                </TouchableOpacity>
                            </View>
                        </ScrollView>
                    </KeyboardAvoidingView>
                </SafeAreaView>
            </LinearGradient>
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
    keyboardView: {
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: 24,
        paddingTop: 24,
        paddingBottom: 40,
    },
    header: {
        alignItems: "center",
        marginBottom: 40,
    },
    iconContainer: {
        width: 80,
        height: 80,
        borderRadius: 20,
        backgroundColor: "#fff",
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 24,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 8,
    },
    title: {
        fontSize: 32,
        fontWeight: "800" as const,
        color: "#fff",
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        color: "rgba(255, 255, 255, 0.85)",
        textAlign: "center",
    },
    errorContainer: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "rgba(255, 82, 82, 0.15)",
        borderWidth: 1,
        borderColor: "rgba(255, 82, 82, 0.3)",
        borderRadius: 12,
        padding: 16,
        marginBottom: 24,
        gap: 12,
    },
    errorText: {
        flex: 1,
        color: "#fff",
        fontSize: 14,
        fontWeight: "600" as const,
    },
    form: {
        gap: 16,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: "700" as const,
        color: "#fff",
        marginTop: 8,
        marginBottom: 4,
    },
    inputContainer: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "rgba(255, 255, 255, 0.15)",
        borderRadius: 16,
        borderWidth: 1,
        borderColor: "rgba(255, 255, 255, 0.2)",
        paddingHorizontal: 16,
        height: 56,
    },
    inputIconContainer: {
        marginRight: 12,
    },
    input: {
        flex: 1,
        fontSize: 16,
        color: "#fff",
        fontWeight: "500" as const,
    },
    goalCard: {
        backgroundColor: "rgba(255, 255, 255, 0.15)",
        borderRadius: 16,
        borderWidth: 2,
        borderColor: "rgba(255, 255, 255, 0.2)",
        padding: 16,
    },
    goalCardSelected: {
        backgroundColor: "rgba(0, 200, 83, 0.15)",
        borderColor: "#00C853",
    },
    goalCardContent: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
    },
    goalCardIcon: {
        width: 48,
        height: 48,
        borderRadius: 12,
        backgroundColor: "rgba(255, 255, 255, 0.2)",
        alignItems: "center",
        justifyContent: "center",
    },
    goalCardText: {
        flex: 1,
    },
    goalCardTitle: {
        fontSize: 16,
        fontWeight: "700" as const,
        color: "#fff",
        marginBottom: 4,
    },
    goalCardDescription: {
        fontSize: 14,
        color: "rgba(255, 255, 255, 0.85)",
    },
    saveButton: {
        backgroundColor: "#fff",
        borderRadius: 16,
        paddingVertical: 18,
        paddingHorizontal: 32,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        marginTop: 16,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
    },
    saveButtonDisabled: {
        opacity: 0.7,
    },
    saveButtonText: {
        color: "#00A8E8",
        fontSize: 18,
        fontWeight: "700" as const,
    },
});
