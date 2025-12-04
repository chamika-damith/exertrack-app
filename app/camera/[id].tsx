// app/camera/[id].tsx - SIMPLIFIED VERSION WITH DEMO DATA
import { exercises } from "@/constants/exercises";
import { CameraType, CameraView, useCameraPermissions } from "expo-camera";
import { router, useLocalSearchParams } from "expo-router";
import { Pause, Play, RotateCcw, Settings, X } from "lucide-react-native";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
    Animated,
    Dimensions,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

type Feedback = "good" | "warning" | "error";
type RepPhase = "starting" | "down" | "bottom" | "up";

// Demo keypoints for skeleton overlay (normalized 0-1)
const DEMO_KEYPOINTS = [
    { x: 0.5, y: 0.15, score: 0.95, name: "nose" },
    { x: 0.48, y: 0.13, score: 0.92, name: "left_eye" },
    { x: 0.52, y: 0.13, score: 0.92, name: "right_eye" },
    { x: 0.46, y: 0.14, score: 0.88, name: "left_ear" },
    { x: 0.54, y: 0.14, score: 0.88, name: "right_ear" },
    { x: 0.42, y: 0.25, score: 0.95, name: "left_shoulder" },
    { x: 0.58, y: 0.25, score: 0.95, name: "right_shoulder" },
    { x: 0.38, y: 0.38, score: 0.93, name: "left_elbow" },
    { x: 0.62, y: 0.38, score: 0.93, name: "right_elbow" },
    { x: 0.35, y: 0.48, score: 0.90, name: "left_wrist" },
    { x: 0.65, y: 0.48, score: 0.90, name: "right_wrist" },
    { x: 0.43, y: 0.52, score: 0.96, name: "left_hip" },
    { x: 0.57, y: 0.52, score: 0.96, name: "right_hip" },
    { x: 0.43, y: 0.68, score: 0.94, name: "left_knee" },
    { x: 0.57, y: 0.68, score: 0.94, name: "right_knee" },
    { x: 0.43, y: 0.85, score: 0.91, name: "left_ankle" },
    { x: 0.57, y: 0.85, score: 0.91, name: "right_ankle" },
];

export default function CameraScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const exercise = exercises.find((ex) => ex.id === id);

    const [facing, setFacing] = useState<CameraType>("front");
    const [permission, requestPermission] = useCameraPermissions();
    const [isActive, setIsActive] = useState(true);
    const [reps, setReps] = useState(0);
    const [targetReps] = useState(10);
    const [accuracy, setAccuracy] = useState(0);
    const [feedback, setFeedback] = useState<{
        type: Feedback;
        message: string;
    }>({ type: "good", message: "Get into position" });
    const [timer, setTimer] = useState(0);
    const [showSkeleton, setShowSkeleton] = useState(true);
    const [repPhase, setRepPhase] = useState<RepPhase>("starting");
    const [repAccuracies, setRepAccuracies] = useState<number[]>([]);
    const [cameraLayout, setCameraLayout] = useState<{ width: number; height: number }>({
        width: SCREEN_WIDTH,
        height: SCREEN_HEIGHT,
    });

    const pulseAnim = useRef(new Animated.Value(1)).current;
    const feedbackAnim = useRef(new Animated.Value(0)).current;
    const animationFrame = useRef<number | null>(null);

    // Simulate pose detection and rep counting
    useEffect(() => {
        if (!isActive || !exercise || reps >= targetReps) return;

        const simulateWorkout = () => {
            // Generate random accuracy between 70-95
            const currentAccuracy = Math.floor(Math.random() * 25) + 70;
            
            // Update feedback based on accuracy
            let newFeedback: Feedback = "good";
            let message = "Great form!";
            
            if (currentAccuracy < 75) {
                newFeedback = "error";
                message = "Adjust your posture";
            } else if (currentAccuracy < 85) {
                newFeedback = "warning";
                message = "Almost there, keep going";
            }

            setFeedback({ type: newFeedback, message });

            // Simulate rep counting with state machine
            if (repPhase === "starting" && currentAccuracy > 75) {
                setRepPhase("down");
                console.log("Phase: starting → down");
            } else if (repPhase === "down" && Math.random() > 0.7) {
                setRepPhase("bottom");
                console.log("Phase: down → bottom");
            } else if (repPhase === "bottom" && Math.random() > 0.5) {
                setRepPhase("up");
                console.log("Phase: bottom → up");
            } else if (repPhase === "up" && Math.random() > 0.6) {
                // Rep completed!
                const repAcc = Math.floor(Math.random() * 20) + 75; // 75-95
                console.log(`✅ Rep completed! Accuracy: ${repAcc}%`);
                
                setRepAccuracies((prev) => [...prev, repAcc]);
                setReps((r) => Math.min(r + 1, targetReps));
                setRepPhase("starting");

                // Pulse animation
                Animated.sequence([
                    Animated.timing(pulseAnim, {
                        toValue: 1.2,
                        duration: 150,
                        useNativeDriver: true,
                    }),
                    Animated.timing(pulseAnim, {
                        toValue: 1,
                        duration: 150,
                        useNativeDriver: true,
                    }),
                ]).start();
            }
        };

        // Run simulation every 2 seconds
        const interval = setInterval(simulateWorkout, 2000);
        return () => clearInterval(interval);
    }, [isActive, exercise, reps, targetReps, repPhase, pulseAnim]);

    // Timer
    useEffect(() => {
        if (!isActive) return;

        const interval = setInterval(() => {
            setTimer((t) => t + 1);
        }, 1000);

        return () => clearInterval(interval);
    }, [isActive]);

    // Feedback animation
    useEffect(() => {
        Animated.sequence([
            Animated.timing(feedbackAnim, {
                toValue: 1,
                duration: 300,
                useNativeDriver: true,
            }),
            Animated.delay(2000),
            Animated.timing(feedbackAnim, {
                toValue: 0,
                duration: 300,
                useNativeDriver: true,
            }),
        ]).start();
    }, [feedback]);

    // Calculate average accuracy
    useEffect(() => {
        if (repAccuracies.length > 0) {
            const avgAcc = Math.round(
                repAccuracies.reduce((sum, acc) => sum + acc, 0) / repAccuracies.length
            );
            setAccuracy(avgAcc);
        }
    }, [repAccuracies]);

    // Auto-finish when target reached
    useEffect(() => {
        if (reps >= targetReps) {
            setTimeout(() => {
                router.push({
                    pathname: "/summary/[id]",
                    params: {
                        id: id!,
                        reps: reps.toString(),
                        accuracy: accuracy.toString(),
                        duration: timer.toString(),
                    },
                });
            }, 1500);
        }
    }, [reps, targetReps, id, accuracy, timer]);

    const toggleCamera = useCallback(() => {
        setFacing((current) => (current === "back" ? "front" : "back"));
    }, []);

    const handleFinish = useCallback(() => {
        router.push({
            pathname: "/summary/[id]",
            params: {
                id: id!,
                reps: reps.toString(),
                accuracy: accuracy.toString(),
                duration: timer.toString(),
            },
        });
    }, [id, reps, accuracy, timer]);

    if (!permission) {
        return <View style={styles.container} />;
    }

    if (!permission.granted) {
        return (
            <View style={styles.container}>
                <SafeAreaView style={styles.permissionContainer}>
                    <Text style={styles.permissionTitle}>Camera Permission Required</Text>
                    <Text style={styles.permissionText}>
                        We need camera access to track your exercise form in real-time.
                    </Text>
                    <TouchableOpacity
                        style={styles.permissionButton}
                        onPress={requestPermission}
                    >
                        <Text style={styles.permissionButtonText}>Grant Permission</Text>
                    </TouchableOpacity>
                </SafeAreaView>
            </View>
        );
    }

    if (!exercise) {
        return (
            <View style={styles.container}>
                <Text style={styles.errorText}>Exercise not found</Text>
            </View>
        );
    }

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, "0")}`;
    };

    const getFeedbackColor = () => {
        switch (feedback.type) {
            case "good":
                return "#00C853";
            case "warning":
                return "#FFC107";
            case "error":
                return "#FF5252";
        }
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" />
            
            {/* Normal Camera View */}
            <CameraView
                style={styles.camera}
                facing={facing}
                onLayout={(event) => {
                    const { width, height } = event.nativeEvent.layout;
                    setCameraLayout({ width, height });
                }}
            >
                {/* Skeleton Overlay */}
                {showSkeleton && cameraLayout.width > 0 && (
                    <SkeletonOverlay
                        cameraLayout={cameraLayout}
                        facing={facing}
                    />
                )}

                {/* UI Overlay */}
                <SafeAreaView style={styles.overlay} edges={["top", "bottom"]}>
                    {/* Top HUD */}
                    <View style={styles.topHUD}>
                        <TouchableOpacity
                            style={styles.closeButton}
                            onPress={() => router.back()}
                            activeOpacity={0.7}
                        >
                            <X color="#fff" size={28} />
                        </TouchableOpacity>

                        <View style={styles.exerciseInfo}>
                            <Text style={styles.exerciseName}>{exercise.name}</Text>
                            <Text style={styles.timer}>{formatTime(timer)}</Text>
                        </View>

                        <TouchableOpacity
                            style={styles.iconButton}
                            onPress={() => setShowSkeleton(!showSkeleton)}
                            activeOpacity={0.7}
                        >
                            <Settings color="#fff" size={24} />
                        </TouchableOpacity>
                    </View>

                    {/* Stats */}
                    <View style={styles.statsContainer}>
                        <View style={styles.statCard}>
                            <Text style={styles.statLabel}>Reps</Text>
                            <Animated.Text
                                style={[styles.statValue, { transform: [{ scale: pulseAnim }] }]}
                            >
                                {reps}/{targetReps}
                            </Animated.Text>
                        </View>

                        <View style={styles.statCard}>
                            <Text style={styles.statLabel}>Form Accuracy</Text>
                            <Text style={styles.statValue}>{accuracy}%</Text>
                            <View style={styles.accuracyBar}>
                                <View
                                    style={[
                                        styles.accuracyFill,
                                        {
                                            width: `${accuracy}%`,
                                            backgroundColor:
                                                accuracy > 85
                                                    ? "#00C853"
                                                    : accuracy > 70
                                                        ? "#FFC107"
                                                        : "#FF5252",
                                        },
                                    ]}
                                />
                            </View>
                        </View>
                    </View>

                    {/* Feedback Banner */}
                    <Animated.View
                        style={[
                            styles.feedbackBanner,
                            {
                                backgroundColor: getFeedbackColor() + "E6",
                                opacity: feedbackAnim,
                                transform: [
                                    {
                                        translateY: feedbackAnim.interpolate({
                                            inputRange: [0, 1],
                                            outputRange: [20, 0],
                                        }),
                                    },
                                ],
                            },
                        ]}
                    >
                        <Text style={styles.feedbackText}>{feedback.message}</Text>
                    </Animated.View>

                    {/* Controls */}
                    <View style={styles.controls}>
                        <TouchableOpacity
                            style={styles.controlButton}
                            onPress={toggleCamera}
                            activeOpacity={0.7}
                        >
                            <RotateCcw color="#fff" size={28} />
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.controlButton, styles.pauseButton]}
                            onPress={() => setIsActive(!isActive)}
                            activeOpacity={0.7}
                        >
                            {isActive ? (
                                <Pause color="#fff" size={32} fill="#fff" />
                            ) : (
                                <Play color="#fff" size={32} fill="#fff" />
                            )}
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.controlButton}
                            onPress={handleFinish}
                            activeOpacity={0.7}
                        >
                            <X color="#fff" size={28} />
                        </TouchableOpacity>
                    </View>
                </SafeAreaView>
            </CameraView>
        </View>
    );
}

function SkeletonOverlay({
    cameraLayout,
    facing,
}: {
    cameraLayout: { width: number; height: number };
    facing: CameraType;
}) {
    // Transform demo keypoints to screen coordinates
    const transformKeypoint = (kp: typeof DEMO_KEYPOINTS[0]) => {
        let x = kp.x * cameraLayout.width;
        let y = kp.y * cameraLayout.height;

        // Mirror for front camera
        if (facing === "front") {
            x = cameraLayout.width - x;
        }

        return { ...kp, x, y };
    };

    const keypoints = DEMO_KEYPOINTS.map(transformKeypoint);

    // Skeleton connections
    const connections = [
        [0, 1], [0, 2], [1, 3], [2, 4],
        [5, 6], [5, 7], [7, 9], [6, 8], [8, 10],
        [5, 11], [6, 12], [11, 12],
        [11, 13], [13, 15], [12, 14], [14, 16],
    ];

    return (
        <View style={styles.skeletonContainer} pointerEvents="none">
            {/* Draw lines */}
            {connections.map(([startIdx, endIdx], index) => {
                const start = keypoints[startIdx];
                const end = keypoints[endIdx];

                const dx = end.x - start.x;
                const dy = end.y - start.y;
                const length = Math.sqrt(dx * dx + dy * dy);
                const angle = Math.atan2(dy, dx) * (180 / Math.PI);

                return (
                    <View
                        key={`line-${index}`}
                        style={[
                            styles.skeletonLine,
                            {
                                left: start.x,
                                top: start.y,
                                width: length,
                                transform: [{ rotate: `${angle}deg` }],
                            },
                        ]}
                    />
                );
            })}

            {/* Draw points */}
            {keypoints.map((point, index) => {
                const isJoint = [5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16].includes(index);
                const size = isJoint ? 14 : 10;
                const color = point.score > 0.9 ? "#00C853" : point.score > 0.7 ? "#FFC107" : "#FF5252";

                return (
                    <View
                        key={`point-${index}`}
                        style={[
                            styles.skeletonPoint,
                            {
                                left: point.x - size / 2,
                                top: point.y - size / 2,
                                width: size,
                                height: size,
                                borderRadius: size / 2,
                                backgroundColor: color,
                            },
                        ]}
                    />
                );
            })}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#000",
    },
    camera: {
        flex: 1,
    },
    errorText: {
        color: "#fff",
        fontSize: 18,
        textAlign: "center",
        marginTop: 50,
    },
    permissionContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: 24,
    },
    permissionTitle: {
        fontSize: 24,
        fontWeight: "700",
        color: "#fff",
        marginBottom: 12,
        textAlign: "center",
    },
    permissionText: {
        fontSize: 16,
        color: "rgba(255, 255, 255, 0.8)",
        textAlign: "center",
        marginBottom: 32,
        lineHeight: 24,
    },
    permissionButton: {
        backgroundColor: "#00A8E8",
        paddingHorizontal: 32,
        paddingVertical: 16,
        borderRadius: 12,
    },
    permissionButtonText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "700",
    },
    overlay: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: "space-between",
    },
    topHUD: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: 20,
        paddingTop: 8,
    },
    closeButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        alignItems: "center",
        justifyContent: "center",
    },
    exerciseInfo: {
        flex: 1,
        alignItems: "center",
    },
    exerciseName: {
        fontSize: 18,
        fontWeight: "700",
        color: "#fff",
        textShadowColor: "rgba(0, 0, 0, 0.75)",
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 4,
    },
    timer: {
        fontSize: 16,
        fontWeight: "600",
        color: "rgba(255, 255, 255, 0.9)",
        marginTop: 2,
        textShadowColor: "rgba(0, 0, 0, 0.75)",
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 4,
    },
    iconButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        alignItems: "center",
        justifyContent: "center",
    },
    statsContainer: {
        paddingHorizontal: 20,
        gap: 12,
    },
    statCard: {
        backgroundColor: "rgba(0, 0, 0, 0.7)",
        borderRadius: 16,
        padding: 16,
        borderWidth: 1,
        borderColor: "rgba(255, 255, 255, 0.2)",
    },
    statLabel: {
        fontSize: 13,
        color: "rgba(255, 255, 255, 0.8)",
        fontWeight: "600",
        marginBottom: 4,
    },
    statValue: {
        fontSize: 32,
        fontWeight: "800",
        color: "#fff",
    },
    accuracyBar: {
        height: 6,
        backgroundColor: "rgba(255, 255, 255, 0.2)",
        borderRadius: 3,
        marginTop: 8,
        overflow: "hidden",
    },
    accuracyFill: {
        height: "100%",
        borderRadius: 3,
    },
    feedbackBanner: {
        marginHorizontal: 20,
        paddingVertical: 16,
        paddingHorizontal: 20,
        borderRadius: 16,
        alignItems: "center",
    },
    feedbackText: {
        fontSize: 18,
        fontWeight: "700",
        color: "#fff",
        textAlign: "center",
    },
    controls: {
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        gap: 24,
        paddingHorizontal: 20,
        paddingBottom: 20,
    },
    controlButton: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: "rgba(0, 0, 0, 0.7)",
        alignItems: "center",
        justifyContent: "center",
        borderWidth: 2,
        borderColor: "rgba(255, 255, 255, 0.3)",
    },
    pauseButton: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: "#00A8E8",
        borderColor: "#fff",
    },
    skeletonContainer: {
        ...StyleSheet.absoluteFillObject,
        pointerEvents: "none",
    },
    skeletonLine: {
        position: "absolute",
        height: 3,
        backgroundColor: "rgba(0, 168, 232, 0.8)",
        transformOrigin: "0% 50%",
    },
    skeletonPoint: {
        position: "absolute",
        borderWidth: 2,
        borderColor: "#fff",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.5,
        shadowRadius: 4,
        elevation: 5,
    },
});