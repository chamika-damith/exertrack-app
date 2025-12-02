import { router, Stack } from "expo-router";
import { AlertCircle } from "lucide-react-native";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function NotFoundScreen() {
    return (
        <>
            <Stack.Screen options={{ title: "Oops!" }} />
            <View style={styles.container}>
                <AlertCircle color="#FF5252" size={64} />
                <Text style={styles.title}>Screen not found</Text>
                <Text style={styles.description}>
                    The page you&apos;re looking for doesn&apos;t exist.
                </Text>

                <TouchableOpacity
                    style={styles.button}
                    onPress={() => router.push("/")}
                    activeOpacity={0.8}
                >
                    <Text style={styles.buttonText}>Go to Home</Text>
                </TouchableOpacity>
            </View>
        </>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
        backgroundColor: "#F8F9FA",
    },
    title: {
        fontSize: 24,
        fontWeight: "800" as const,
        color: "#1A1A1A",
        marginTop: 16,
        marginBottom: 8,
    },
    description: {
        fontSize: 16,
        color: "#666",
        textAlign: "center",
        marginBottom: 32,
    },
    button: {
        backgroundColor: "#00A8E8",
        paddingHorizontal: 32,
        paddingVertical: 16,
        borderRadius: 12,
    },
    buttonText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "700" as const,
    },
});
