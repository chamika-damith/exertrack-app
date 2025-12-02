import createContextHook from "@nkzw/create-context-hook";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "@exertrack_posture_templates";

export type PostureTemplate = {
    id: string;
    name: string;
    exerciseType: string;
    keypoints: number;
    angles: {
        name: string;
        minAngle: number;
        maxAngle: number;
    }[];
    createdAt: string;
    updatedAt: string;
};

const defaultTemplates: PostureTemplate[] = [
    {
        id: "1",
        name: "Perfect Squat Form",
        exerciseType: "Squat",
        keypoints: 33,
        angles: [
            { name: "Knee Angle", minAngle: 80, maxAngle: 100 },
            { name: "Hip Angle", minAngle: 85, maxAngle: 95 },
            { name: "Back Angle", minAngle: 165, maxAngle: 180 },
        ],
        createdAt: "2025-01-15",
        updatedAt: "2025-01-20",
    },
    {
        id: "2",
        name: "Standard Push-Up",
        exerciseType: "Push-Up",
        keypoints: 33,
        angles: [
            { name: "Elbow Angle", minAngle: 75, maxAngle: 90 },
            { name: "Body Line", minAngle: 170, maxAngle: 180 },
            { name: "Shoulder Angle", minAngle: 40, maxAngle: 50 },
        ],
        createdAt: "2025-01-10",
        updatedAt: "2025-01-18",
    },
    {
        id: "3",
        name: "Proper Plank Position",
        exerciseType: "Plank",
        keypoints: 33,
        angles: [
            { name: "Body Alignment", minAngle: 175, maxAngle: 180 },
            { name: "Shoulder Position", minAngle: 85, maxAngle: 95 },
            { name: "Hip Angle", minAngle: 175, maxAngle: 180 },
        ],
        createdAt: "2025-01-12",
        updatedAt: "2025-01-22",
    },
    {
        id: "4",
        name: "Lunge Form",
        exerciseType: "Lunge",
        keypoints: 33,
        angles: [
            { name: "Front Knee", minAngle: 85, maxAngle: 95 },
            { name: "Back Knee", minAngle: 85, maxAngle: 95 },
            { name: "Torso Angle", minAngle: 85, maxAngle: 95 },
        ],
        createdAt: "2025-01-14",
        updatedAt: "2025-01-19",
    },
];

export const [PostureTemplateProvider, usePostureTemplates] = createContextHook(() => {
    const [templates, setTemplates] = useState<PostureTemplate[]>(defaultTemplates);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    const loadTemplates = useCallback(async () => {
        try {
            setIsLoading(true);
            const stored = await AsyncStorage.getItem(STORAGE_KEY);
            if (stored) {
                setTemplates(JSON.parse(stored));
            } else {
                await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(defaultTemplates));
            }
        } catch (error) {
            console.error("Error loading posture templates:", error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        loadTemplates();
    }, [loadTemplates]);

    const addTemplate = useCallback(async (template: PostureTemplate) => {
        try {
            const updatedTemplates = [...templates, template];
            await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedTemplates));
            setTemplates(updatedTemplates);
            return { success: true };
        } catch (error) {
            console.error("Error adding posture template:", error);
            return { success: false, error: "Failed to add template" };
        }
    }, [templates]);

    const updateTemplate = useCallback(async (id: string, template: PostureTemplate) => {
        try {
            const updatedTemplates = templates.map((t) => (t.id === id ? template : t));
            await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedTemplates));
            setTemplates(updatedTemplates);
            return { success: true };
        } catch (error) {
            console.error("Error updating posture template:", error);
            return { success: false, error: "Failed to update template" };
        }
    }, [templates]);

    const deleteTemplate = useCallback(async (id: string) => {
        try {
            const updatedTemplates = templates.filter((t) => t.id !== id);
            await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedTemplates));
            setTemplates(updatedTemplates);
            return { success: true };
        } catch (error) {
            console.error("Error deleting posture template:", error);
            return { success: false, error: "Failed to delete template" };
        }
    }, [templates]);

    const getTemplateByExerciseType = useCallback((exerciseType: string) => {
        return templates.find(
            (t) => t.exerciseType.toLowerCase() === exerciseType.toLowerCase()
        );
    }, [templates]);

    return {
        templates,
        isLoading,
        addTemplate,
        updateTemplate,
        deleteTemplate,
        getTemplateByExerciseType,
    };
});
