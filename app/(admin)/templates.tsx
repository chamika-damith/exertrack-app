import {
    PostureTemplate,
    usePostureTemplates,
} from "@/contexts/PostureTemplateContext";
import {
    AlertCircle,
    Edit3,
    Plus,
    Search,
    Trash2,
    User,
} from "lucide-react-native";
import React, { useState } from "react";
import {
    ActivityIndicator,
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



export default function PostureTemplatesScreen() {
    const {
        templates,
        isLoading,
        addTemplate,
        updateTemplate,
        deleteTemplate,
    } = usePostureTemplates();

    const [searchQuery, setSearchQuery] = useState("");
    const [modalVisible, setModalVisible] = useState(false);
    const [editingTemplate, setEditingTemplate] = useState<PostureTemplate | null>(null);

    const [formData, setFormData] = useState({
        name: "",
        exerciseType: "",
        angles: [{ name: "", minAngle: "", maxAngle: "" }],
    });

    const filteredTemplates = templates.filter(
        (template) =>
            template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            template.exerciseType.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleAddAngle = () => {
        setFormData({
            ...formData,
            angles: [...formData.angles, { name: "", minAngle: "", maxAngle: "" }],
        });
    };

    const handleRemoveAngle = (index: number) => {
        const newAngles = formData.angles.filter((_, i) => i !== index);
        setFormData({ ...formData, angles: newAngles });
    };

    const handleSave = async () => {
        if (!formData.name || !formData.exerciseType) {
            Alert.alert("Error", "Please fill in all required fields");
            return;
        }

        const newTemplate: PostureTemplate = {
            id: editingTemplate?.id || Date.now().toString(),
            name: formData.name,
            exerciseType: formData.exerciseType,
            keypoints: 33,
            angles: formData.angles.map((angle) => ({
                name: angle.name,
                minAngle: parseInt(angle.minAngle) || 0,
                maxAngle: parseInt(angle.maxAngle) || 0,
            })),
            createdAt: editingTemplate?.createdAt || new Date().toISOString().split("T")[0],
            updatedAt: new Date().toISOString().split("T")[0],
        };

        let result;
        if (editingTemplate) {
            result = await updateTemplate(editingTemplate.id, newTemplate);
        } else {
            result = await addTemplate(newTemplate);
        }

        if (!result.success) {
            Alert.alert("Error", result.error || "Failed to save template");
            return;
        }

        setModalVisible(false);
        resetForm();
    };

    const resetForm = () => {
        setFormData({
            name: "",
            exerciseType: "",
            angles: [{ name: "", minAngle: "", maxAngle: "" }],
        });
        setEditingTemplate(null);
    };

    const handleEdit = (template: PostureTemplate) => {
        setEditingTemplate(template);
        setFormData({
            name: template.name,
            exerciseType: template.exerciseType,
            angles: template.angles.map((angle) => ({
                name: angle.name,
                minAngle: angle.minAngle.toString(),
                maxAngle: angle.maxAngle.toString(),
            })),
        });
        setModalVisible(true);
    };

    const handleDelete = (id: string) => {
        Alert.alert("Delete Template", "Are you sure you want to delete this template?", [
            { text: "Cancel", style: "cancel" },
            {
                text: "Delete",
                style: "destructive",
                onPress: async () => {
                    const result = await deleteTemplate(id);
                    if (!result.success) {
                        Alert.alert("Error", result.error || "Failed to delete template");
                    }
                },
            },
        ]);
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" />
            <SafeAreaView style={styles.safeArea}>
                <View style={styles.header}>
                    <Text style={styles.headerTitle}>Posture Templates</Text>
                    <Text style={styles.headerSubtitle}>
                        Manage standard posture templates for exercises
                    </Text>
                </View>

                <View style={styles.searchContainer}>
                    <Search color="#666" size={20} style={styles.searchIcon} />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search templates..."
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        placeholderTextColor="#999"
                    />
                </View>

                <TouchableOpacity
                    style={styles.addButton}
                    onPress={() => {
                        resetForm();
                        setModalVisible(true);
                    }}
                    activeOpacity={0.8}
                >
                    <Plus color="#fff" size={20} />
                    <Text style={styles.addButtonText}>Add New Template</Text>
                </TouchableOpacity>

                <ScrollView
                    style={styles.scrollView}
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                >
                    {isLoading ? (
                        <View style={styles.emptyState}>
                            <ActivityIndicator size="large" color="#00A8E8" />
                            <Text style={styles.emptyStateText}>Loading templates...</Text>
                        </View>
                    ) : filteredTemplates.length === 0 ? (
                        <View style={styles.emptyState}>
                            <AlertCircle color="#ccc" size={64} />
                            <Text style={styles.emptyStateText}>No templates found</Text>
                            <Text style={styles.emptyStateSubtext}>
                                {searchQuery
                                    ? "Try a different search term"
                                    : "Add your first posture template"}
                            </Text>
                        </View>
                    ) : (
                        filteredTemplates.map((template) => (
                            <View key={template.id} style={styles.templateCard}>
                                <View style={styles.templateHeader}>
                                    <View style={styles.templateIconContainer}>
                                        <User color="#00A8E8" size={24} />
                                    </View>
                                    <View style={styles.templateInfo}>
                                        <Text style={styles.templateName}>{template.name}</Text>
                                        <Text style={styles.templateExercise}>
                                            {template.exerciseType}
                                        </Text>
                                    </View>
                                </View>

                                <View style={styles.templateDetails}>
                                    <View style={styles.detailRow}>
                                        <Text style={styles.detailLabel}>Keypoints:</Text>
                                        <Text style={styles.detailValue}>{template.keypoints}</Text>
                                    </View>
                                    <View style={styles.detailRow}>
                                        <Text style={styles.detailLabel}>Angles tracked:</Text>
                                        <Text style={styles.detailValue}>{template.angles.length}</Text>
                                    </View>
                                    <View style={styles.detailRow}>
                                        <Text style={styles.detailLabel}>Last updated:</Text>
                                        <Text style={styles.detailValue}>{template.updatedAt}</Text>
                                    </View>
                                </View>

                                <View style={styles.anglesContainer}>
                                    <Text style={styles.anglesTitle}>Tracked Angles:</Text>
                                    {template.angles.map((angle, idx) => (
                                        <View key={idx} style={styles.angleItem}>
                                            <Text style={styles.angleName}>{angle.name}</Text>
                                            <Text style={styles.angleRange}>
                                                {angle.minAngle}° - {angle.maxAngle}°
                                            </Text>
                                        </View>
                                    ))}
                                </View>

                                <View style={styles.templateActions}>
                                    <TouchableOpacity
                                        style={[styles.actionButton, styles.editButton]}
                                        onPress={() => handleEdit(template)}
                                        activeOpacity={0.7}
                                    >
                                        <Edit3 color="#00A8E8" size={18} />
                                        <Text style={styles.editButtonText}>Edit</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={[styles.actionButton, styles.deleteButton]}
                                        onPress={() => handleDelete(template.id)}
                                        activeOpacity={0.7}
                                    >
                                        <Trash2 color="#FF5252" size={18} />
                                        <Text style={styles.deleteButtonText}>Delete</Text>
                                    </TouchableOpacity>
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
                            {editingTemplate ? "Edit Template" : "New Template"}
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
                            <Text style={styles.label}>Template Name *</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="e.g., Perfect Squat Form"
                                value={formData.name}
                                onChangeText={(text) => setFormData({ ...formData, name: text })}
                                placeholderTextColor="#999"
                            />
                        </View>

                        <View style={styles.formGroup}>
                            <Text style={styles.label}>Exercise Type *</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="e.g., Squat, Push-up, Plank"
                                value={formData.exerciseType}
                                onChangeText={(text) =>
                                    setFormData({ ...formData, exerciseType: text })
                                }
                                placeholderTextColor="#999"
                            />
                        </View>

                        <View style={styles.formGroup}>
                            <View style={styles.anglesHeader}>
                                <Text style={styles.label}>Angle Measurements</Text>
                                <TouchableOpacity
                                    style={styles.addAngleButton}
                                    onPress={handleAddAngle}
                                    activeOpacity={0.7}
                                >
                                    <Plus color="#00A8E8" size={18} />
                                    <Text style={styles.addAngleText}>Add Angle</Text>
                                </TouchableOpacity>
                            </View>

                            {formData.angles.map((angle, index) => (
                                <View key={index} style={styles.angleFormGroup}>
                                    <View style={styles.angleFormHeader}>
                                        <Text style={styles.angleFormTitle}>Angle {index + 1}</Text>
                                        {formData.angles.length > 1 && (
                                            <TouchableOpacity
                                                onPress={() => handleRemoveAngle(index)}
                                                activeOpacity={0.7}
                                            >
                                                <Trash2 color="#FF5252" size={18} />
                                            </TouchableOpacity>
                                        )}
                                    </View>

                                    <TextInput
                                        style={styles.input}
                                        placeholder="Angle name (e.g., Knee Angle)"
                                        value={angle.name}
                                        onChangeText={(text) => {
                                            const newAngles = [...formData.angles];
                                            newAngles[index].name = text;
                                            setFormData({ ...formData, angles: newAngles });
                                        }}
                                        placeholderTextColor="#999"
                                    />

                                    <View style={styles.rangeInputs}>
                                        <View style={styles.rangeInputGroup}>
                                            <Text style={styles.rangeLabel}>Min Angle (°)</Text>
                                            <TextInput
                                                style={styles.rangeInput}
                                                placeholder="0"
                                                keyboardType="numeric"
                                                value={angle.minAngle}
                                                onChangeText={(text) => {
                                                    const newAngles = [...formData.angles];
                                                    newAngles[index].minAngle = text;
                                                    setFormData({ ...formData, angles: newAngles });
                                                }}
                                                placeholderTextColor="#999"
                                            />
                                        </View>

                                        <View style={styles.rangeInputGroup}>
                                            <Text style={styles.rangeLabel}>Max Angle (°)</Text>
                                            <TextInput
                                                style={styles.rangeInput}
                                                placeholder="180"
                                                keyboardType="numeric"
                                                value={angle.maxAngle}
                                                onChangeText={(text) => {
                                                    const newAngles = [...formData.angles];
                                                    newAngles[index].maxAngle = text;
                                                    setFormData({ ...formData, angles: newAngles });
                                                }}
                                                placeholderTextColor="#999"
                                            />
                                        </View>
                                    </View>
                                </View>
                            ))}
                        </View>

                        <View style={styles.infoBox}>
                            <AlertCircle color="#00A8E8" size={20} />
                            <Text style={styles.infoText}>
                                Templates define the correct form angles for each exercise. The
                                system will compare user performance against these values.
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
    addButton: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#00A8E8",
        marginHorizontal: 24,
        marginTop: 16,
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
    templateCard: {
        backgroundColor: "#fff",
        borderRadius: 16,
        padding: 20,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: "#e0e0e0",
    },
    templateHeader: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 16,
    },
    templateIconContainer: {
        width: 48,
        height: 48,
        borderRadius: 12,
        backgroundColor: "#E3F5FF",
        alignItems: "center",
        justifyContent: "center",
        marginRight: 12,
    },
    templateInfo: {
        flex: 1,
    },
    templateName: {
        fontSize: 18,
        fontWeight: "700" as const,
        color: "#1a1a1a",
        marginBottom: 4,
    },
    templateExercise: {
        fontSize: 14,
        color: "#00A8E8",
        fontWeight: "600" as const,
    },
    templateDetails: {
        backgroundColor: "#f9f9f9",
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
    },
    detailRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 8,
    },
    detailLabel: {
        fontSize: 14,
        color: "#666",
    },
    detailValue: {
        fontSize: 14,
        fontWeight: "600" as const,
        color: "#1a1a1a",
    },
    anglesContainer: {
        marginBottom: 16,
    },
    anglesTitle: {
        fontSize: 14,
        fontWeight: "600" as const,
        color: "#666",
        marginBottom: 12,
    },
    angleItem: {
        flexDirection: "row",
        justifyContent: "space-between",
        paddingVertical: 8,
        paddingHorizontal: 12,
        backgroundColor: "#f9f9f9",
        borderRadius: 8,
        marginBottom: 8,
    },
    angleName: {
        fontSize: 14,
        color: "#1a1a1a",
        fontWeight: "500" as const,
    },
    angleRange: {
        fontSize: 14,
        color: "#00A8E8",
        fontWeight: "600" as const,
    },
    templateActions: {
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
    anglesHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 16,
    },
    addAngleButton: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
    },
    addAngleText: {
        color: "#00A8E8",
        fontSize: 14,
        fontWeight: "600" as const,
    },
    angleFormGroup: {
        backgroundColor: "#f9f9f9",
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: "#e0e0e0",
    },
    angleFormHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 12,
    },
    angleFormTitle: {
        fontSize: 14,
        fontWeight: "600" as const,
        color: "#666",
    },
    rangeInputs: {
        flexDirection: "row",
        gap: 12,
        marginTop: 12,
    },
    rangeInputGroup: {
        flex: 1,
    },
    rangeLabel: {
        fontSize: 13,
        color: "#666",
        marginBottom: 6,
    },
    rangeInput: {
        backgroundColor: "#fff",
        borderWidth: 1,
        borderColor: "#e0e0e0",
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 10,
        fontSize: 15,
        color: "#1a1a1a",
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
