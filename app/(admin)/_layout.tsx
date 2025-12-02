import { useUser } from "@/contexts/UserContext";
import { Tabs, router } from "expo-router";
import { BarChart3, Dumbbell, FileEdit, LogOut } from "lucide-react-native";
import React from "react";
import { Alert, TouchableOpacity } from "react-native";

export default function AdminLayout() {
    const { logout } = useUser();

    const handleLogout = async () => {
        Alert.alert(
            "Logout",
            "Are you sure you want to logout?",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Logout",
                    style: "destructive",
                    onPress: async () => {
                        const result = await logout();
                        if (result.success) {
                            router.replace("/login");
                        } else {
                            Alert.alert("Error", result.error || "Logout failed");
                        }
                    },
                },
            ]
        );
    };

    return (
        <Tabs
            screenOptions={{
                headerShown: true,
                headerStyle: {
                    backgroundColor: "#fff",
                },
                headerTitleStyle: {
                    fontWeight: "700" as const,
                    fontSize: 18,
                },
                headerRight: () => (
                    <TouchableOpacity
                        onPress={handleLogout}
                        style={{
                            marginRight: 16,
                            padding: 8,
                            borderRadius: 8,
                            backgroundColor: "#FFE8E8",
                        }}
                        activeOpacity={0.7}
                    >
                        <LogOut color="#FF5252" size={20} />
                    </TouchableOpacity>
                ),
                tabBarActiveTintColor: "#00A8E8",
                tabBarInactiveTintColor: "#666",
                tabBarStyle: {
                    backgroundColor: "#fff",
                    borderTopWidth: 1,
                    borderTopColor: "#e0e0e0",
                    height: 60,
                    paddingBottom: 8,
                    paddingTop: 8,
                },
                tabBarLabelStyle: {
                    fontSize: 12,
                    fontWeight: "600" as const,
                },
            }}
        >
            <Tabs.Screen
                name="templates"
                options={{
                    title: "Templates",
                    tabBarIcon: ({ color, size }) => (
                        <FileEdit color={color} size={size} />
                    ),
                }}
            />
            <Tabs.Screen
                name="manage-exercises"
                options={{
                    title: "Exercises",
                    tabBarIcon: ({ color, size }) => (
                        <Dumbbell color={color} size={size} />
                    ),
                }}
            />
            <Tabs.Screen
                name="performance"
                options={{
                    title: "Performance",
                    tabBarIcon: ({ color, size }) => (
                        <BarChart3 color={color} size={size} />
                    ),
                }}
            />
        </Tabs>
    );
}
