export type Exercise = {
    id: string;
    name: string;
    difficulty: "Beginner" | "Intermediate" | "Advanced";
    category: "Upper Body" | "Lower Body" | "Core" | "Full Body";
    targetMuscles: string[];
    duration: number;
    image: string;
    description: string;
    instructions: string[];
    keyPoints: string[];
    commonMistakes: string[];
};

export const exercises: Exercise[] = [
    {
        id: "squat",
        name: "Squat",
        difficulty: "Beginner",
        category: "Lower Body",
        targetMuscles: ["Quadriceps", "Glutes", "Hamstrings"],
        duration: 3,
        image: "https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=400",
        description:
            "A fundamental lower body exercise that builds strength in your legs and core.",
        instructions: [
            "Stand with feet shoulder-width apart",
            "Lower your body by bending knees and hips",
            "Keep chest up and back straight",
            "Push through heels to return to start",
        ],
        keyPoints: [
            "Keep knees aligned with toes",
            "Maintain neutral spine throughout",
            "Go as low as comfortable with good form",
        ],
        commonMistakes: [
            "Knees caving inward",
            "Rounding the lower back",
            "Lifting heels off the ground",
        ],
    },
    {
        id: "push-up",
        name: "Push-Up",
        difficulty: "Beginner",
        category: "Upper Body",
        targetMuscles: ["Chest", "Triceps", "Shoulders"],
        duration: 2,
        image: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=400",
        description:
            "Classic bodyweight exercise for building upper body and core strength.",
        instructions: [
            "Start in plank position with hands shoulder-width",
            "Lower body until chest nearly touches floor",
            "Keep core engaged and body straight",
            "Push back up to starting position",
        ],
        keyPoints: [
            "Maintain straight line from head to heels",
            "Elbows at 45-degree angle to body",
            "Controlled movement up and down",
        ],
        commonMistakes: [
            "Sagging hips",
            "Flaring elbows too wide",
            "Not going low enough",
        ],
    },
    {
        id: "plank",
        name: "Plank",
        difficulty: "Beginner",
        category: "Core",
        targetMuscles: ["Core", "Shoulders", "Back"],
        duration: 1,
        image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400",
        description: "Isometric core exercise that builds stability and endurance.",
        instructions: [
            "Get into forearm plank position",
            "Keep body in straight line",
            "Engage core and squeeze glutes",
            "Hold position without sagging",
        ],
        keyPoints: [
            "Don't let hips sag or pike up",
            "Keep neck neutral, don't look up",
            "Breathe steadily throughout",
        ],
        commonMistakes: [
            "Hips too high or too low",
            "Holding breath",
            "Shoulders not over elbows",
        ],
    },
    {
        id: "lunge",
        name: "Lunge",
        difficulty: "Intermediate",
        category: "Lower Body",
        targetMuscles: ["Quadriceps", "Glutes", "Hamstrings"],
        duration: 3,
        image: "https://images.unsplash.com/photo-1598971639058-fab3c3109a00?w=400",
        description: "Unilateral leg exercise that improves balance and strength.",
        instructions: [
            "Step forward with one leg",
            "Lower hips until both knees at 90 degrees",
            "Keep front knee over ankle",
            "Push back to starting position",
        ],
        keyPoints: [
            "Keep torso upright throughout",
            "Don't let front knee pass toes",
            "Back knee hovers just above ground",
        ],
        commonMistakes: [
            "Leaning too far forward",
            "Front knee extending past toes",
            "Not lowering back knee enough",
        ],
    },
    {
        id: "burpee",
        name: "Burpee",
        difficulty: "Advanced",
        category: "Full Body",
        targetMuscles: ["Full Body", "Cardio"],
        duration: 4,
        image: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=400",
        description: "High-intensity full body exercise combining strength and cardio.",
        instructions: [
            "Start standing, then drop into squat",
            "Place hands on ground and jump feet back",
            "Perform a push-up",
            "Jump feet forward and explode up with jump",
        ],
        keyPoints: [
            "Maintain form throughout each rep",
            "Control the landing",
            "Keep core engaged during push-up",
        ],
        commonMistakes: [
            "Skipping the push-up",
            "Not fully extending during jump",
            "Landing too hard",
        ],
    },
    {
        id: "deadlift",
        name: "Deadlift",
        difficulty: "Intermediate",
        category: "Full Body",
        targetMuscles: ["Back", "Glutes", "Hamstrings"],
        duration: 4,
        image: "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=400",
        description: "Compound movement building posterior chain strength.",
        instructions: [
            "Stand with feet hip-width apart",
            "Hinge at hips, keep back straight",
            "Lower hands toward floor",
            "Drive through heels to stand up",
        ],
        keyPoints: [
            "Keep bar/weight close to body",
            "Neutral spine throughout movement",
            "Engage lats and core",
        ],
        commonMistakes: [
            "Rounding the back",
            "Starting with hips too low",
            "Not using legs enough",
        ],
    },
];
