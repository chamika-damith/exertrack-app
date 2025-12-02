import { exercises } from "@/constants/exercises";
import {
    AngleMeasurement,
    detectPose,
    hasMinimumConfidentKeypoints,
    isPoseDetectionReady,
    Keypoint,
    measureExerciseForm,
} from "@/utils/poseDetection";
import * as tf from "@tensorflow/tfjs";
import { cameraWithTensors } from "@tensorflow/tfjs-react-native";
import { CameraType, CameraView, useCameraPermissions } from "expo-camera";
import { router, useLocalSearchParams } from "expo-router";
import { Pause, Play, RotateCcw, Settings, X } from "lucide-react-native";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
    Animated,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const TensorCamera = cameraWithTensors(CameraView);

type Feedback = "good" | "warning" | "error";

type RepPhase = "starting" | "down" | "bottom" | "up";
type RepData = {
    phase: RepPhase;
    accuracy: number;
    angles: AngleMeasurement[];
    timestamp: number;
};

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
    const [currentPose, setCurrentPose] = useState<Keypoint[]>([]);
    const [repPhase, setRepPhase] = useState<RepPhase>("starting");
    const [repHistory, setRepHistory] = useState<RepData[]>([]);
    const [currentAngles, setCurrentAngles] = useState<AngleMeasurement[]>([]);
    const [repAccuracies, setRepAccuracies] = useState<number[]>([]);
    const [cameraLayout, setCameraLayout] = useState<{ width: number; height: number }>({
        width: 0,
        height: 0,
    });

    const pulseAnim = useRef(new Animated.Value(1)).current;
    const feedbackAnim = useRef(new Animated.Value(0)).current;

    const handleCameraStream = useCallback(
        (images: IterableIterator<tf.Tensor3D>, updatePreview: () => void, gl: any) => {
            let frameCount = 0;

            const loop = async () => {
                const nextImageTensor = images.next().value;

                if (!isActive || !exercise || reps >= targetReps) {
                    if (nextImageTensor) nextImageTensor.dispose();
                    requestAnimationFrame(loop);
                    return;
                }

                if (nextImageTensor) {
                    frameCount++;

                    // Check if pose detection is ready (log once every 60 frames)
                    if (frameCount % 60 === 1) {
                        const isReady = isPoseDetectionReady();
                        console.log(`📹 Camera frame ${frameCount}, Pose detection ready: ${isReady}`);
                    }

                    const pose = await detectPose(nextImageTensor);
                    setCurrentPose(pose);

                    if (pose.length > 0) {
                        // Check if we have enough confident keypoints
                        const hasGoodPose = hasMinimumConfidentKeypoints(pose, 10, 0.5);

                        // Log form analysis occasionally
                        if (frameCount % 60 === 0) {
                            console.log(`🎯 Detected ${pose.length} keypoints for ${exercise.name}, Good pose: ${hasGoodPose}`);
                        }

                        if (!hasGoodPose) {
                            setFeedback({
                                type: "warning",
                                message: "Move into better view",
                            });
                            setCurrentAngles([]);
                        } else {
                            const formAnalysis = measureExerciseForm(exercise.id, pose);
                            setCurrentAngles(formAnalysis.angles);
                            const currentAccuracy = formAnalysis.accuracy;

                            // Log form analysis occasionally
                            if (frameCount % 60 === 0) {
                                console.log(`📊 Form accuracy: ${currentAccuracy}%, Feedback: ${formAnalysis.feedback}`);
                                console.log(`📐 Angles:`, formAnalysis.angles.map(a => `${a.name}: ${a.angle}° (${a.isCorrect ? '✓' : '✗'})`).join(', '));
                            }

                            setFeedback({
                                type: formAnalysis.feedbackType,
                                message: formAnalysis.feedback,
                            });

                            // Rep counting logic
                            if (repPhase === "starting" && currentAccuracy > 75) {
                                console.log(`🏋️ Rep phase: starting → down (accuracy: ${currentAccuracy}%)`);
                                setRepPhase("down");
                            } else if (repPhase === "down" && currentAccuracy > 80) {
                                console.log(`🏋️ Rep phase: down → bottom (accuracy: ${currentAccuracy}%)`);
                                setRepPhase("bottom");
                            } else if (repPhase === "bottom") {
                                console.log(`🏋️ Rep phase: bottom → up`);
                                setRepPhase("up");
                            } else if (repPhase === "up" && currentAccuracy > 75) {
                                const repAcc = currentAccuracy; // Use real accuracy
                                console.log(`✅ Rep completed! Accuracy: ${repAcc}%`);
                                setRepAccuracies((prev) => [...prev, repAcc]);
                                setRepHistory((prev) => [
                                    ...prev,
                                    {
                                        phase: "starting",
                                        accuracy: repAcc,
                                        angles: formAnalysis.angles,
                                        timestamp: Date.now(),
                                    },
                                ]);
                                setReps((r) => Math.min(r + 1, targetReps));
                                setRepPhase("starting");

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
                        }
                    } else if (frameCount % 60 === 0) {
                        console.log(`⚠️ No pose detected in frame ${frameCount}`);
                    }
                    nextImageTensor.dispose();
                }
                requestAnimationFrame(loop);
            };
            loop();
        },
        [isActive, exercise, reps, targetReps, repPhase, pulseAnim]
    );

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

    useEffect(() => {
        if (!isActive) return;

        const interval = setInterval(() => {
            setTimer((t) => t + 1);
        }, 1000);

        return () => clearInterval(interval);
    }, [isActive]);

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
    }, [feedback, feedbackAnim]);

    useEffect(() => {
        if (repAccuracies.length > 0) {
            const avgAcc = Math.round(
                repAccuracies.reduce((sum, acc) => sum + acc, 0) / repAccuracies.length
            );
            setAccuracy(avgAcc);
        }
    }, [repAccuracies]);

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
                        repData: JSON.stringify(repHistory),
                    },
                });
            }, 1500);
        }
    }, [reps, targetReps, id, accuracy, timer, repHistory]);

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
                <Text>Exercise not found</Text>
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
            <TensorCamera
                style={styles.camera}
                facing={facing}
                onReady={handleCameraStream}
                autorender={true}
                resizeHeight={256}
                resizeWidth={256}
                resizeDepth={3}
                cameraTextureHeight={1920}
                cameraTextureWidth={1080}
                useCustomShadersToResize={false}
                onLayout={(event) => {
                    const { width, height } = event.nativeEvent.layout;
                    setCameraLayout({ width, height });
                }}
            >
                {showSkeleton && cameraLayout.width > 0 && (
                    <SkeletonOverlay
                        keypoints={currentPose}
                        angles={currentAngles}
                        cameraLayout={cameraLayout}
                        facing={facing}
                    />
                )}

                <SafeAreaView style={styles.overlay} edges={["top", "bottom"]}>
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
            </TensorCamera>
        </View>
    );
}

function SkeletonOverlay({
    keypoints,
    angles,
    cameraLayout,
    facing,
}: {
    keypoints: Keypoint[];
    angles: AngleMeasurement[];
    cameraLayout: { width: number; height: number };
    facing: CameraType;
}) {
    if (keypoints.length === 0 || cameraLayout.width === 0) {
        return null;
    }

    // Transform keypoint coordinates to match camera view
    const transformKeypoint = (kp: Keypoint) => {
        // MoveNet returns coordinates normalized to [0, 1]
        // We need to map them to the actual camera view dimensions
        let x = kp.x * cameraLayout.width;
        let y = kp.y * cameraLayout.height;

        // Mirror horizontally for front camera
        if (facing === "front") {
            x = cameraLayout.width - x;
        }

        return { ...kp, x, y };
    };

    const transformedKeypoints = keypoints.map(transformKeypoint);

    // Filter keypoints by confidence
    const confidentKeypoints = transformedKeypoints.filter(kp => (kp.score ?? 0) >= 0.4);

    // Define skeleton connections (MoveNet keypoint indices)
    const connections = [
        [0, 1],  // nose to left_eye
        [0, 2],  // nose to right_eye
        [1, 3],  // left_eye to left_ear
        [2, 4],  // right_eye to right_ear
        [5, 6],  // left_shoulder to right_shoulder
        [5, 7],  // left_shoulder to left_elbow
        [7, 9],  // left_elbow to left_wrist
        [6, 8],  // right_shoulder to right_elbow
        [8, 10], // right_elbow to right_wrist
        [5, 11], // left_shoulder to left_hip
        [6, 12], // right_shoulder to right_hip
        [11, 12], // left_hip to right_hip
        [11, 13], // left_hip to left_knee
        [13, 15], // left_knee to left_ankle
        [12, 14], // right_hip to right_knee
        [14, 16], // right_knee to right_ankle
    ];

    return (
        <View style={styles.skeletonContainer}>
            {/* Render skeleton lines */}
            {connections.map(([startIdx, endIdx], index) => {
                const startPoint = transformedKeypoints[startIdx];
                const endPoint = transformedKeypoints[endIdx];

                // Only render line if both points exist and are confident
                if (!startPoint || !endPoint ||
                    (startPoint.score ?? 0) < 0.4 ||
                    (endPoint.score ?? 0) < 0.4) {
                    return null;
                }

                const dx = endPoint.x - startPoint.x;
                const dy = endPoint.y - startPoint.y;
                const length = Math.sqrt(dx * dx + dy * dy);
                const angle = Math.atan2(dy, dx) * (180 / Math.PI);

                return (
                    <View
                        key={`line-${index}`}
                        style={[
                            styles.skeletonLine,
                            {
                                left: startPoint.x,
                                top: startPoint.y,
                                width: length,
                                transform: [{ rotate: `${angle}deg` }],
                            },
                        ]}
                    />
                );
            })}

            {/* Render keypoints */}
            {transformedKeypoints.map((point, index) => {
                // Only render confident keypoints
                if ((point.score ?? 0) < 0.4) {
                    return null;
                }

                const isJoint = [5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16].includes(index);
                const color =
                    (point.score ?? 0) > 0.9
                        ? "#00C853"
                        : (point.score ?? 0) > 0.7
                            ? "#FFC107"
                            : "#FF5252";

                const size = isJoint ? 14 : 10;

                return (
                    <View
                        key={`point-${index}`}
                        style={[
                            styles.skeletonPoint,
                            {
                                left: point.x - size / 2,
                                top: point.y - size / 2,
                                backgroundColor: color,
                                width: size,
                                height: size,
                                borderRadius: size / 2,
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
    permissionContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: 24,
    },
    permissionTitle: {
        fontSize: 24,
        fontWeight: "700" as const,
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
        fontWeight: "700" as const,
    },
    overlay: {
        flex: 1,
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
        fontWeight: "700" as const,
        color: "#fff",
        textShadowColor: "rgba(0, 0, 0, 0.75)",
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 4,
    },
    timer: {
        fontSize: 16,
        fontWeight: "600" as const,
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
        fontWeight: "600" as const,
        marginBottom: 4,
    },
    statValue: {
        fontSize: 32,
        fontWeight: "800" as const,
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
        fontWeight: "700" as const,
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
