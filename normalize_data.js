// Calculate scaling factor (distance between shoulders)
function calculateScaleFactor(landmarks) {
  const leftShoulder = landmarks[11];
  const rightShoulder = landmarks[12];
  return Math.sqrt(
    Math.pow(rightShoulder.x - leftShoulder.x, 2) +
    Math.pow(rightShoulder.y - leftShoulder.y, 2) +
    Math.pow(rightShoulder.z - leftShoulder.z, 2),
  );
}

// Normalize a single landmark relative to the reference point and scale factor
function normalizeLandmark(landmark, referencePoint, scaleFactor) {
  return {
    x: (landmark.x - referencePoint.x) / scaleFactor,
    y: (landmark.y - referencePoint.y) / scaleFactor,
    z: (landmark.z - referencePoint.z) / scaleFactor,
    visibility: landmark.visibility, // Preserve visibility
  };
}

// Categorize landmarks into body segments
function categorizeLandmarks(landmarks) {
  return {
    upperBody: [
      landmarks[0],
      landmarks[11],
      landmarks[12],
      landmarks[23],
      landmarks[24],
    ],
    arms: [
      landmarks[11],
      landmarks[13],
      landmarks[15], // Left arm
      landmarks[12],
      landmarks[14],
      landmarks[16], // Right arm
    ],
    lowerBody: [landmarks[23], landmarks[24], landmarks[25], landmarks[26]],
    legs: [
      landmarks[25],
      landmarks[27],
      landmarks[29],
      landmarks[31], // Left leg
      landmarks[26],
      landmarks[28],
      landmarks[30],
      landmarks[32], // Right leg
    ],
  };
}

function categorizeSwingPhase(landmarks, prevLandmarks) {
  if (!prevLandmarks) return "setup"; // Default to 'setup' for the first frame

  const leftHand = landmarks[15]; // Left wrist
  const rightHand = landmarks[16]; // Right wrist
  const leftHip = landmarks[23];
  const rightHip = landmarks[24];

  const handHeight = (leftHand.y + rightHand.y) / 2; // Average hand height
  const hipHeight = (leftHip.y + rightHip.y) / 2;

  if (handHeight > hipHeight) {
    return "backswing"; // Hands moving upward
  }

  if (prevLandmarks && handHeight < prevLandmarks[15].y) {
    return "downswing"; // Hands moving downward
  }

  return "follow-through"; // Default to follow-through for now
}

// Normalize and categorize pose data from raw JSON
function normalizeAndCategorizeFrames(frames) {
  return frames.map((frame, index) => {
    const landmarks = frame.landmarks;
    const prevLandmarks = index > 0 ? frames[index - 1].landmarks : null;

    // Step 1: Normalize Landmarks
    const referencePoint = {
      x: (landmarks[23].x + landmarks[24].x) / 2,
      y: (landmarks[23].y + landmarks[24].y) / 2,
      z: (landmarks[23].z + landmarks[24].z) / 2,
    };
    const scaleFactor = calculateScaleFactor(landmarks);
    const normalizedLandmarks = landmarks.map((landmark) =>
      normalizeLandmark(landmark, referencePoint, scaleFactor),
    );

    // Step 2: Categorize by body parts
    const categorizedLandmarks = categorizeLandmarks(normalizedLandmarks);

    // Step 3: Categorize swing phase
    const phase = categorizeSwingPhase(landmarks, prevLandmarks);

    return {
      timestamp: frame.timestamp,
      phase, // Add the categorized swing phase
      normalizedLandmarks: categorizedLandmarks,
    };
  });
}

// Main function to process raw pose data
async function processPoseFile(inputFile) {
  // Read raw pose data
  const rawData = JSON.parse(await Deno.readTextFile(inputFile));

  // Normalize and categorize
  const processedData = normalizeAndCategorizeFrames(rawData);

  // Generate output file name
  const outputFile = inputFile.replace(/(\.json)$/, "_normalized$1");

  // Save the normalized data
  await Deno.writeTextFile(outputFile, JSON.stringify(processedData, null, 2));
  console.log(`Normalized data saved to ${outputFile}`);
}

// CLI Logic
if (Deno.args.length < 1) {
  console.error(
    "Usage: deno run --allow-read --allow-write script.js <inputFile>",
  );
  Deno.exit(1);
}

const inputFile = Deno.args[0];
await processPoseFile(inputFile);
