import { useUser } from "@/contexts/UserContext";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { AlertCircle, Lock, Mail, User, UserPlus } from "lucide-react-native";
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

export default function RegisterScreen() {
    const { register } = useUser();
    const [name, setName] = useState<string>("");
    const [email, setEmail] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const [confirmPassword, setConfirmPassword] = useState<string>("");
    const [error, setError] = useState<string>("");
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const handleRegister = async () => {
        setError("");

        if (!name || !email || !password || !confirmPassword) {
            setError("Please fill in all fields");
            return;
        }

        if (password !== confirmPassword) {
            setError("Passwords do not match");
            return;
        }

        if (password.length < 6) {
            setError("Password must be at least 6 characters");
            return;
        }

        setIsLoading(true);
        const result = await register({
            name,
            email,
            age: 0,
            height: 0,
            weight: 0,
            fitnessGoal: "general_fitness",
        });
        setIsLoading(false);

        if (result.success) {
            router.replace("/profile-setup");
        } else {
            setError(result.error || "Registration failed");
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
                            <TouchableOpacity
                                style={styles.backButton}
                                onPress={() => router.back()}
                                activeOpacity={0.7}
                            >
                                <Text style={styles.backButtonText}>← Back</Text>
                            </TouchableOpacity>

                            <View style={styles.header}>
                                <View style={styles.iconContainer}>
                                    <UserPlus color="#00A8E8" size={40} strokeWidth={2.5} />
                                </View>
                                <Text style={styles.title}>Create Account</Text>
                                <Text style={styles.subtitle}>
                                    Join ExerTrack and start your fitness journey
                                </Text>
                            </View>

                            {error ? (
                                <View style={styles.errorContainer}>
                                    <AlertCircle color="#FF5252" size={20} />
                                    <Text style={styles.errorText}>{error}</Text>
                                </View>
                            ) : null}

                            <View style={styles.form}>
                                <View style={styles.inputContainer}>
                                    <View style={styles.inputIconContainer}>
                                        <User color="rgba(255, 255, 255, 0.7)" size={20} />
                                    </View>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Full Name"
                                        placeholderTextColor="rgba(255, 255, 255, 0.6)"
                                        value={name}
                                        onChangeText={setName}
                                        autoCapitalize="words"
                                        autoComplete="name"
                                        editable={!isLoading}
                                    />
                                </View>

                                <View style={styles.inputContainer}>
                                    <View style={styles.inputIconContainer}>
                                        <Mail color="rgba(255, 255, 255, 0.7)" size={20} />
                                    </View>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Email"
                                        placeholderTextColor="rgba(255, 255, 255, 0.6)"
                                        value={email}
                                        onChangeText={setEmail}
                                        autoCapitalize="none"
                                        keyboardType="email-address"
                                        autoComplete="email"
                                        editable={!isLoading}
                                    />
                                </View>

                                <View style={styles.inputContainer}>
                                    <View style={styles.inputIconContainer}>
                                        <Lock color="rgba(255, 255, 255, 0.7)" size={20} />
                                    </View>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Password"
                                        placeholderTextColor="rgba(255, 255, 255, 0.6)"
                                        value={password}
                                        onChangeText={setPassword}
                                        secureTextEntry
                                        autoComplete="password"
                                        editable={!isLoading}
                                    />
                                </View>

                                <View style={styles.inputContainer}>
                                    <View style={styles.inputIconContainer}>
                                        <Lock color="rgba(255, 255, 255, 0.7)" size={20} />
                                    </View>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Confirm Password"
                                        placeholderTextColor="rgba(255, 255, 255, 0.6)"
                                        value={confirmPassword}
                                        onChangeText={setConfirmPassword}
                                        secureTextEntry
                                        autoComplete="password"
                                        editable={!isLoading}
                                    />
                                </View>

                                <TouchableOpacity
                                    style={[styles.registerButton, isLoading && styles.registerButtonDisabled]}
                                    onPress={handleRegister}
                                    disabled={isLoading}
                                    activeOpacity={0.8}
                                >
                                    {isLoading ? (
                                        <ActivityIndicator color="#00A8E8" size="small" />
                                    ) : (
                                        <>
                                            <Text style={styles.registerButtonText}>Create Account</Text>
                                            <UserPlus color="#00A8E8" size={20} />
                                        </>
                                    )}
                                </TouchableOpacity>

                                <View style={styles.divider}>
                                    <View style={styles.dividerLine} />
                                    <Text style={styles.dividerText}>OR</Text>
                                    <View style={styles.dividerLine} />
                                </View>

                                <TouchableOpacity
                                    style={styles.signInButton}
                                    onPress={() => router.push("/login")}
                                    activeOpacity={0.7}
                                    disabled={isLoading}
                                >
                                    <Text style={styles.signInButtonText}>
                                        Already have an account? <Text style={styles.signInButtonTextBold}>Sign In</Text>
                                    </Text>
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
        paddingBottom: 40,
    },
    backButton: {
        marginTop: 16,
        marginBottom: 24,
    },
    backButtonText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "600" as const,
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
    registerButton: {
        backgroundColor: "#fff",
        borderRadius: 16,
        paddingVertical: 18,
        paddingHorizontal: 32,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        marginTop: 8,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
    },
    registerButtonDisabled: {
        opacity: 0.7,
    },
    registerButtonText: {
        color: "#00A8E8",
        fontSize: 18,
        fontWeight: "700" as const,
    },
    divider: {
        flexDirection: "row",
        alignItems: "center",
        marginVertical: 24,
        gap: 16,
    },
    dividerLine: {
        flex: 1,
        height: 1,
        backgroundColor: "rgba(255, 255, 255, 0.3)",
    },
    dividerText: {
        color: "rgba(255, 255, 255, 0.7)",
        fontSize: 14,
        fontWeight: "600" as const,
    },
    signInButton: {
        alignItems: "center",
        paddingVertical: 16,
    },
    signInButtonText: {
        color: "rgba(255, 255, 255, 0.9)",
        fontSize: 15,
        fontWeight: "500" as const,
    },
    signInButtonTextBold: {
        fontWeight: "700" as const,
        color: "#fff",
    },
});
