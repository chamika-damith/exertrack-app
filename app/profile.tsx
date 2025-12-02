import { useUser } from "@/contexts/UserContext";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import {
    Bell,
    Camera,
    ChevronRight,
    LogOut,
    Moon,
    Settings,
    User,
    Volume2,
} from "lucide-react-native";
import React from "react";
import {
    Alert,
    ScrollView,
    StatusBar,
    StyleSheet,
    Switch,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const FITNESS_GOAL_LABELS: Record<string, string> = {
    weight_loss: "Weight Loss",
    muscle_gain: "Muscle Gain",
    general_fitness: "General Fitness",
    rehabilitation: "Rehabilitation",
};

export default function ProfileScreen() {
    const { user, settings, logout, updateSettings } = useUser();

    const handleLogout = () => {
        Alert.alert(
            "Logout",
            "Are you sure you want to logout?",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Logout",
                    style: "destructive",
                    onPress: async () => {
                        await logout();
                        router.replace("/");
                    },
                },
            ]
        );
    };

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
                            <Text style={styles.notLoggedInText}>Please log in to view your profile</Text>
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

    const memberSinceDate = new Date(user.memberSince).toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
    });

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
                        <TouchableOpacity
                            style={styles.backButton}
                            onPress={() => router.back()}
                            activeOpacity={0.7}
                        >
                            <Text style={styles.backButtonText}>← Back</Text>
                        </TouchableOpacity>

                        <View style={styles.profileHeader}>
                            <View style={styles.avatarContainer}>
                                <User color="#00A8E8" size={48} strokeWidth={2.5} />
                            </View>
                            <Text style={styles.userName}>{user.name}</Text>
                            <Text style={styles.userEmail}>{user.email}</Text>
                            <Text style={styles.memberSince}>Member since {memberSinceDate}</Text>
                        </View>

                        <View style={styles.statsContainer}>
                            <StatCard label="Workouts" value={user.totalWorkouts.toString()} />
                            <StatCard label="Streak" value={`${user.currentStreak}d`} />
                        </View>

                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Profile Information</Text>
                            <InfoCard label="Age" value={`${user.age} years`} />
                            <InfoCard label="Height" value={`${user.height} cm`} />
                            <InfoCard label="Weight" value={`${user.weight} kg`} />
                            <InfoCard
                                label="Fitness Goal"
                                value={FITNESS_GOAL_LABELS[user.fitnessGoal] || user.fitnessGoal}
                            />
                        </View>

                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Exercise Settings</Text>
                            <SettingRow
                                icon={<Settings color="rgba(255, 255, 255, 0.7)" size={20} />}
                                label="Default Rep Count"
                                value={settings.defaultRepCount.toString()}
                                onPress={() => { }}
                            />
                            <SettingRow
                                icon={<Volume2 color="rgba(255, 255, 255, 0.7)" size={20} />}
                                label="Voice Guidance"
                                rightComponent={
                                    <Switch
                                        value={settings.voiceGuidance}
                                        onValueChange={(value) => {
                                            updateSettings({ voiceGuidance: value });
                                        }}
                                        trackColor={{ false: "#767577", true: "#00C853" }}
                                        thumbColor="#fff"
                                    />
                                }
                            />
                        </View>

                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Camera Settings</Text>
                            <SettingRow
                                icon={<Camera color="rgba(255, 255, 255, 0.7)" size={20} />}
                                label="Camera Quality"
                                value={settings.cameraQuality}
                                onPress={() => { }}
                            />
                            <SettingRow
                                icon={<Settings color="rgba(255, 255, 255, 0.7)" size={20} />}
                                label="Feedback Sensitivity"
                                value={settings.feedbackSensitivity}
                                onPress={() => { }}
                            />
                        </View>

                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Notifications</Text>
                            <SettingRow
                                icon={<Bell color="rgba(255, 255, 255, 0.7)" size={20} />}
                                label="Workout Reminders"
                                rightComponent={
                                    <Switch
                                        value={settings.notifications.workoutReminders}
                                        onValueChange={(value) => {
                                            updateSettings({
                                                notifications: {
                                                    ...settings.notifications,
                                                    workoutReminders: value,
                                                },
                                            });
                                        }}
                                        trackColor={{ false: "#767577", true: "#00C853" }}
                                        thumbColor="#fff"
                                    />
                                }
                            />
                            <SettingRow
                                icon={<Bell color="rgba(255, 255, 255, 0.7)" size={20} />}
                                label="Progress Milestones"
                                rightComponent={
                                    <Switch
                                        value={settings.notifications.progressMilestones}
                                        onValueChange={(value) => {
                                            updateSettings({
                                                notifications: {
                                                    ...settings.notifications,
                                                    progressMilestones: value,
                                                },
                                            });
                                        }}
                                        trackColor={{ false: "#767577", true: "#00C853" }}
                                        thumbColor="#fff"
                                    />
                                }
                            />
                        </View>

                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Appearance</Text>
                            <SettingRow
                                icon={<Moon color="rgba(255, 255, 255, 0.7)" size={20} />}
                                label="Dark Mode"
                                rightComponent={
                                    <Switch
                                        value={settings.darkMode}
                                        onValueChange={(value) => {
                                            updateSettings({ darkMode: value });
                                        }}
                                        trackColor={{ false: "#767577", true: "#00C853" }}
                                        thumbColor="#fff"
                                    />
                                }
                            />
                        </View>

                        <TouchableOpacity
                            style={styles.logoutButton}
                            onPress={handleLogout}
                            activeOpacity={0.8}
                        >
                            <LogOut color="#FF5252" size={20} />
                            <Text style={styles.logoutButtonText}>Logout</Text>
                        </TouchableOpacity>
                    </ScrollView>
                </SafeAreaView>
            </LinearGradient>
        </View>
    );
}

function StatCard({ label, value }: { label: string; value: string }) {
    return (
        <View style={styles.statCard}>
            <Text style={styles.statValue}>{value}</Text>
            <Text style={styles.statLabel}>{label}</Text>
        </View>
    );
}

function InfoCard({ label, value }: { label: string; value: string }) {
    return (
        <View style={styles.infoCard}>
            <Text style={styles.infoLabel}>{label}</Text>
            <Text style={styles.infoValue}>{value}</Text>
        </View>
    );
}

function SettingRow({
    icon,
    label,
    value,
    onPress,
    rightComponent,
}: {
    icon: React.ReactNode;
    label: string;
    value?: string;
    onPress?: () => void;
    rightComponent?: React.ReactNode;
}) {
    const content = (
        <View style={styles.settingRow}>
            <View style={styles.settingLeft}>
                <View style={styles.settingIcon}>{icon}</View>
                <Text style={styles.settingLabel}>{label}</Text>
            </View>
            {rightComponent ? (
                rightComponent
            ) : (
                <View style={styles.settingRight}>
                    {value ? <Text style={styles.settingValue}>{value}</Text> : null}
                    <ChevronRight color="rgba(255, 255, 255, 0.5)" size={20} />
                </View>
            )}
        </View>
    );

    if (onPress) {
        return (
            <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
                {content}
            </TouchableOpacity>
        );
    }

    return content;
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
    backButton: {
        marginTop: 16,
        marginBottom: 24,
    },
    backButtonText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "600" as const,
    },
    profileHeader: {
        alignItems: "center",
        marginBottom: 32,
    },
    avatarContainer: {
        width: 96,
        height: 96,
        borderRadius: 48,
        backgroundColor: "#fff",
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 16,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 8,
    },
    userName: {
        fontSize: 28,
        fontWeight: "800" as const,
        color: "#fff",
        marginBottom: 4,
    },
    userEmail: {
        fontSize: 16,
        color: "rgba(255, 255, 255, 0.85)",
        marginBottom: 8,
    },
    memberSince: {
        fontSize: 14,
        color: "rgba(255, 255, 255, 0.7)",
    },
    statsContainer: {
        flexDirection: "row",
        gap: 12,
        marginBottom: 32,
    },
    statCard: {
        flex: 1,
        backgroundColor: "rgba(255, 255, 255, 0.15)",
        borderRadius: 16,
        padding: 20,
        alignItems: "center",
        borderWidth: 1,
        borderColor: "rgba(255, 255, 255, 0.2)",
    },
    statValue: {
        fontSize: 32,
        fontWeight: "800" as const,
        color: "#fff",
        marginBottom: 4,
    },
    statLabel: {
        fontSize: 14,
        color: "rgba(255, 255, 255, 0.85)",
        fontWeight: "600" as const,
    },
    section: {
        marginBottom: 32,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: "700" as const,
        color: "#fff",
        marginBottom: 12,
    },
    infoCard: {
        backgroundColor: "rgba(255, 255, 255, 0.15)",
        borderRadius: 12,
        padding: 16,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 8,
        borderWidth: 1,
        borderColor: "rgba(255, 255, 255, 0.2)",
    },
    infoLabel: {
        fontSize: 15,
        color: "rgba(255, 255, 255, 0.85)",
        fontWeight: "600" as const,
    },
    infoValue: {
        fontSize: 15,
        color: "#fff",
        fontWeight: "700" as const,
    },
    settingRow: {
        backgroundColor: "rgba(255, 255, 255, 0.15)",
        borderRadius: 12,
        padding: 16,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 8,
        borderWidth: 1,
        borderColor: "rgba(255, 255, 255, 0.2)",
    },
    settingLeft: {
        flexDirection: "row",
        alignItems: "center",
        flex: 1,
    },
    settingIcon: {
        width: 40,
        height: 40,
        borderRadius: 10,
        backgroundColor: "rgba(255, 255, 255, 0.2)",
        alignItems: "center",
        justifyContent: "center",
        marginRight: 12,
    },
    settingLabel: {
        fontSize: 15,
        color: "#fff",
        fontWeight: "600" as const,
        flex: 1,
    },
    settingRight: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
    },
    settingValue: {
        fontSize: 14,
        color: "rgba(255, 255, 255, 0.7)",
        fontWeight: "500" as const,
        textTransform: "capitalize",
    },
    logoutButton: {
        backgroundColor: "rgba(255, 82, 82, 0.15)",
        borderWidth: 2,
        borderColor: "#FF5252",
        borderRadius: 16,
        paddingVertical: 16,
        paddingHorizontal: 32,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        marginTop: 16,
    },
    logoutButtonText: {
        color: "#FF5252",
        fontSize: 17,
        fontWeight: "700" as const,
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
