// utils/poseDetection.ts
import * as poseDetection from "@tensorflow-models/pose-detection";
import * as tf from "@tensorflow/tfjs";
import "@tensorflow/tfjs-react-native";

// === CRITICAL FIX: Replace deprecated react-native-fs with Expo's filesystem ===
// (tf.io as any).fileSystem = expoFileSystemAdapter(FileSystem, Asset);

// === Types ===
export type Keypoint = {
    x: number;
    y: number;
    score?: number; // confidence
    name?: string;
};

export type Pose = {
    keypoints: Keypoint[];
    score: number;
};

export type AngleMeasurement = {
    name: string;
    angle: number;
    isCorrect: boolean;
    minAngle: number;
    maxAngle: number;
};

// === Helper Functions ===
export function calculateAngle(
    a: { x: number; y: number },
    b: { x: number; y: number },
    c: { x: number; y: number }
): number {
    const radians =
        Math.atan2(c.y - b.y, c.x - b.x) - Math.atan2(a.y - b.y, a.x - b.x);
    let angle = Math.abs((radians * 180) / Math.PI);
    if (angle > 180) angle = 360 - angle;
    return Math.round(angle);
}

export function calculateDistance(a: { x: number; y: number }, b: { x: number; y: number }): number {
    return Math.sqrt(Math.pow(b.x - a.x, 2) + Math.pow(b.y - a.y, 2));
}

export function filterLowConfidenceKeypoints(keypoints: Keypoint[], threshold: number = 0.5): Keypoint[] {
    return keypoints.filter(kp => (kp.score ?? 0) >= threshold);
}

export function hasMinimumConfidentKeypoints(keypoints: Keypoint[], minCount: number = 10, threshold: number = 0.5): boolean {
    const confidentKeypoints = filterLowConfidenceKeypoints(keypoints, threshold);
    return confidentKeypoints.length >= minCount;
}

// === Form Checkers ===
export function measureSquatForm(keypoints: Keypoint[]) {
    const hip = keypoints.find((k) => k.name === "left_hip") ?? keypoints[11];
    const knee = keypoints.find((k) => k.name === "left_knee") ?? keypoints[13];
    const ankle = keypoints.find((k) => k.name === "left_ankle") ?? keypoints[15];
    const shoulder = keypoints.find((k) => k.name === "left_shoulder") ?? keypoints[5];

    // Check keypoint confidence
    const minConfidence = 0.5;
    const criticalPoints = [hip, knee, ankle, shoulder];
    const lowConfidence = criticalPoints.some(p => (p.score ?? 0) < minConfidence);

    const kneeAngle = calculateAngle(hip, knee, ankle);
    const hipAngle = calculateAngle(shoulder, hip, knee);
    const backAngle = calculateAngle({ x: hip.x, y: hip.y - 100 }, hip, shoulder);

    const angles: AngleMeasurement[] = [
        { name: "Knee Angle", angle: kneeAngle, isCorrect: kneeAngle >= 80 && kneeAngle <= 110, minAngle: 80, maxAngle: 110 },
        { name: "Hip Angle", angle: hipAngle, isCorrect: hipAngle >= 80 && hipAngle <= 100, minAngle: 80, maxAngle: 100 },
        { name: "Back Angle", angle: backAngle, isCorrect: backAngle >= 160, minAngle: 160, maxAngle: 180 },
    ];

    let accuracy = Math.round((angles.filter((a) => a.isCorrect).length / angles.length) * 100);
    if (lowConfidence) accuracy = Math.min(accuracy, 50); // Cap accuracy if confidence is low

    let feedback = "Great squat!";
    let feedbackType: "good" | "warning" | "error" = "good";

    if (lowConfidence) {
        feedback = "Move into better view";
        feedbackType = "warning";
    } else if (kneeAngle > 110) {
        feedback = "Go deeper — lower your hips";
        feedbackType = "warning";
    } else if (kneeAngle < 80) {
        feedback = "Don't go too low";
        feedbackType = "warning";
    } else if (backAngle < 160) {
        feedback = "Keep your back straight!";
        feedbackType = "error";
    }

    return { angles, accuracy, feedback, feedbackType };
}

export function measurePushUpForm(keypoints: Keypoint[]) {
    const shoulder = keypoints.find((k) => k.name === "left_shoulder") ?? keypoints[5];
    const elbow = keypoints.find((k) => k.name === "left_elbow") ?? keypoints[7];
    const wrist = keypoints.find((k) => k.name === "left_wrist") ?? keypoints[9];
    const hip = keypoints.find((k) => k.name === "left_hip") ?? keypoints[11];
    const knee = keypoints.find((k) => k.name === "left_knee") ?? keypoints[13];

    const elbowAngle = calculateAngle(shoulder, elbow, wrist);
    const bodyAngle = calculateAngle(shoulder, hip, knee);

    const angles: AngleMeasurement[] = [
        { name: "Elbow Angle", angle: elbowAngle, isCorrect: elbowAngle >= 80 && elbowAngle <= 100, minAngle: 80, maxAngle: 100 },
        { name: "Body Straight", angle: bodyAngle, isCorrect: bodyAngle >= 165, minAngle: 165, maxAngle: 180 },
    ];

    const accuracy = Math.round((angles.filter((a) => a.isCorrect).length / angles.length) * 100);
    let feedback = "Perfect push-up!";
    let feedbackType: "good" | "warning" | "error" = "good";

    if (elbowAngle > 100) {
        feedback = "Lower your chest more";
        feedbackType = "warning";
    }
    if (bodyAngle < 165) {
        feedback = "Don't let hips sag!";
        feedbackType = "error";
    }

    return { angles, accuracy, feedback, feedbackType };
}

export function measurePlankForm(keypoints: Keypoint[]) {
    const shoulder = keypoints.find((k) => k.name === "left_shoulder") ?? keypoints[5];
    const elbow = keypoints.find((k) => k.name === "left_elbow") ?? keypoints[7];
    const hip = keypoints.find((k) => k.name === "left_hip") ?? keypoints[11];
    const ankle = keypoints.find((k) => k.name === "left_ankle") ?? keypoints[15];

    const bodyAngle = calculateAngle(shoulder, hip, ankle);
    const shoulderOverElbow = Math.abs(shoulder.x - elbow.x) < 30;

    const angles: AngleMeasurement[] = [
        { name: "Body Straight", angle: bodyAngle, isCorrect: bodyAngle >= 170, minAngle: 170, maxAngle: 180 },
        { name: "Shoulders over elbows", angle: shoulderOverElbow ? 180 : 90, isCorrect: shoulderOverElbow, minAngle: 180, maxAngle: 180 },
    ];

    const accuracy = Math.round((angles.filter((a) => a.isCorrect).length / angles.length) * 100);
    let feedback = "Strong plank!";
    let feedbackType: "good" | "warning" | "error" = "good";

    if (bodyAngle < 170) {
        feedback = "Don't let hips drop!";
        feedbackType = "error";
    }
    if (!shoulderOverElbow) {
        feedback = "Keep shoulders over elbows";
        feedbackType = "warning";
    }

    return { angles, accuracy, feedback, feedbackType };
}

export function measureLungeForm(keypoints: Keypoint[]) {
    const hip = keypoints.find((k) => k.name === "left_hip") ?? keypoints[11];
    const knee = keypoints.find((k) => k.name === "left_knee") ?? keypoints[13];
    const ankle = keypoints.find((k) => k.name === "left_ankle") ?? keypoints[15];
    const shoulder = keypoints.find((k) => k.name === "left_shoulder") ?? keypoints[5];

    const kneeAngle = calculateAngle(hip, knee, ankle);
    const torsoAngle = calculateAngle({ x: hip.x, y: hip.y - 100 }, hip, shoulder);

    const angles: AngleMeasurement[] = [
        { name: "Front Knee", angle: kneeAngle, isCorrect: kneeAngle >= 85 && kneeAngle <= 100, minAngle: 85, maxAngle: 100 },
        { name: "Torso Upright", angle: torsoAngle, isCorrect: torsoAngle >= 80, minAngle: 80, maxAngle: 180 },
    ];

    const accuracy = Math.round((angles.filter((a) => a.isCorrect).length / angles.length) * 100);
    let feedback = "Perfect lunge!";
    let feedbackType: "good" | "warning" | "error" = "good";

    if (kneeAngle < 85) {
        feedback = "Front knee too far forward";
        feedbackType = "error";
    } else if (torsoAngle < 80) {
        feedback = "Stay upright";
        feedbackType = "warning";
    }

    return { angles, accuracy, feedback, feedbackType };
}

export function measureBurpeeForm(keypoints: Keypoint[]) {
    const nose = keypoints.find((k) => k.name === "nose") ?? keypoints[0];
    const shoulder = keypoints.find((k) => k.name === "left_shoulder") ?? keypoints[5];
    const elbow = keypoints.find((k) => k.name === "left_elbow") ?? keypoints[7];
    const wrist = keypoints.find((k) => k.name === "left_wrist") ?? keypoints[9];
    const hip = keypoints.find((k) => k.name === "left_hip") ?? keypoints[11];
    const knee = keypoints.find((k) => k.name === "left_knee") ?? keypoints[13];
    const ankle = keypoints.find((k) => k.name === "left_ankle") ?? keypoints[15];

    // Check keypoint confidence
    const minConfidence = 0.5;
    const criticalPoints = [shoulder, hip, knee, ankle];
    const lowConfidence = criticalPoints.some(p => (p.score ?? 0) < minConfidence);

    // Detect phase based on body position
    const hipHeight = hip.y;
    const shoulderHeight = shoulder.y;
    const kneeAngle = calculateAngle(hip, knee, ankle);
    const bodyAngle = calculateAngle(shoulder, hip, ankle);
    const elbowAngle = calculateAngle(shoulder, elbow, wrist);

    // Determine which phase of burpee
    let phase: "standing" | "plank" | "pushup" | "jump" = "standing";
    let angles: AngleMeasurement[] = [];
    let feedback = "Get into position";
    let feedbackType: "good" | "warning" | "error" = "good";

    // Standing/Jump phase: body upright
    if (bodyAngle > 160 && kneeAngle > 160) {
        phase = "standing";
        angles = [
            { name: "Body Upright", angle: bodyAngle, isCorrect: bodyAngle >= 165, minAngle: 165, maxAngle: 180 },
            { name: "Legs Extended", angle: kneeAngle, isCorrect: kneeAngle >= 165, minAngle: 165, maxAngle: 180 },
        ];
        feedback = "Good! Now drop down";
        feedbackType = "good";
    }
    // Plank/Push-up phase: body horizontal
    else if (bodyAngle > 160 && kneeAngle > 160 && hipHeight > 0.4) {
        phase = "plank";
        angles = [
            { name: "Body Straight", angle: bodyAngle, isCorrect: bodyAngle >= 165, minAngle: 165, maxAngle: 180 },
            { name: "Plank Hold", angle: kneeAngle, isCorrect: kneeAngle >= 165, minAngle: 165, maxAngle: 180 },
        ];

        // Check if doing push-up
        if (elbowAngle < 120) {
            phase = "pushup";
            angles.push({ name: "Elbow Angle", angle: elbowAngle, isCorrect: elbowAngle >= 80 && elbowAngle <= 100, minAngle: 80, maxAngle: 100 });
            feedback = elbowAngle >= 80 && elbowAngle <= 100 ? "Perfect push-up!" : "Lower your chest more";
            feedbackType = elbowAngle >= 80 && elbowAngle <= 100 ? "good" : "warning";
        } else {
            feedback = bodyAngle >= 165 ? "Hold plank, then push-up" : "Keep body straight!";
            feedbackType = bodyAngle >= 165 ? "good" : "error";
        }
    }
    // Squat phase: preparing to jump
    else if (kneeAngle < 120) {
        phase = "standing";
        angles = [
            { name: "Squat Depth", angle: kneeAngle, isCorrect: kneeAngle >= 80 && kneeAngle <= 110, minAngle: 80, maxAngle: 110 },
        ];
        feedback = "Now jump up!";
        feedbackType = "good";
    }

    let accuracy = angles.length > 0 ? Math.round((angles.filter((a) => a.isCorrect).length / angles.length) * 100) : 0;
    if (lowConfidence) {
        accuracy = Math.min(accuracy, 50);
        feedback = "Move into better view";
        feedbackType = "warning";
    }

    return { angles, accuracy, feedback, feedbackType };
}

export function measureExerciseForm(exerciseId: string, keypoints: Keypoint[]) {
    switch (exerciseId.toLowerCase()) {
        case "squat":
            return measureSquatForm(keypoints);
        case "pushup":
        case "push-up":
            return measurePushUpForm(keypoints);
        case "plank":
            return measurePlankForm(keypoints);
        case "lunge":
            return measureLungeForm(keypoints);
        case "burpee":
            return measureBurpeeForm(keypoints);
        default:
            return measureSquatForm(keypoints);
    }
}

// === TensorFlow.js Pose Detection ===
let detector: poseDetection.PoseDetector | null = null;
let isInitialized = false;

export async function initPoseDetection() {
    try {
        console.log("🚀 Starting TensorFlow.js initialization...");

        // Wait for TensorFlow to be ready
        await tf.ready();
        console.log("✅ TensorFlow.js backend ready:", tf.getBackend());

        // Check if we have the right backend for React Native
        const backend = tf.getBackend();
        console.log("📱 Current backend:", backend);

        // Create the pose detector
        console.log("🔄 Loading MoveNet model...");
        const model = poseDetection.SupportedModels.MoveNet;
        detector = await poseDetection.createDetector(model, {
            modelType: poseDetection.movenet.modelType.SINGLEPOSE_LIGHTNING,
            enableSmoothing: true,
        });

        isInitialized = true;
        console.log("✅ MoveNet Lightning loaded successfully!");
        console.log("✅ Pose detection is ready to use");

        return true;
    } catch (error) {
        console.error("❌ Failed to initialize pose detection:", error);
        console.error("Error details:", JSON.stringify(error, null, 2));
        isInitialized = false;
        return false;
    }
}

export function isPoseDetectionReady(): boolean {
    return isInitialized && detector !== null;
}

export async function detectPose(tensor3D: tf.Tensor3D): Promise<Keypoint[]> {
    if (!detector) {
        console.warn("⚠️ Pose detector not initialized yet");
        return [];
    }

    try {
        const poses = await detector.estimatePoses(tensor3D, {
            flipHorizontal: false,
        });

        if (poses.length > 0 && poses[0].keypoints) {
            const keypoints = poses[0].keypoints as Keypoint[];

            // Log detection success (only occasionally to avoid spam)
            if (Math.random() < 0.05) { // Log ~5% of detections
                console.log(`✅ Detected ${keypoints.length} keypoints, confidence: ${poses[0].score?.toFixed(2) || 'N/A'}`);

                // Log a few key joints for debugging
                const nose = keypoints.find(k => k.name === 'nose');
                const leftHip = keypoints.find(k => k.name === 'left_hip');
                const rightHip = keypoints.find(k => k.name === 'right_hip');

                if (nose && leftHip && rightHip) {
                    console.log(`  Nose: (${nose.x.toFixed(2)}, ${nose.y.toFixed(2)}) score: ${nose.score?.toFixed(2)}`);
                    console.log(`  Left Hip: (${leftHip.x.toFixed(2)}, ${leftHip.y.toFixed(2)}) score: ${leftHip.score?.toFixed(2)}`);
                }
            }

            return keypoints;
        } else {
            // Only log occasionally to avoid spam
            if (Math.random() < 0.01) {
                console.log("⚠️ No pose detected in frame");
            }
        }
    } catch (err) {
        console.error("❌ Pose estimation error:", err);
        console.error("Error details:", JSON.stringify(err, null, 2));
    }

    return [];
}

// Optional: Cleanup
export function disposeDetector() {
    if (detector) {
        detector.dispose();
        detector = null;
        isInitialized = false;
        console.log("🧹 Pose detector disposed");
    }
}