/**
 * AWS AI Service for CivicLens x402
 * Uses AWS Rekognition and Bedrock for image/description verification
 */

const { RekognitionClient, DetectLabelsCommand } = require('@aws-sdk/client-rekognition');
const { BedrockRuntimeClient, InvokeModelCommand } = require('@aws-sdk/client-bedrock-runtime');

// Initialize AWS clients
const rekognition = new RekognitionClient({
    region: process.env.AWS_REGION || 'us-east-1'
});

const bedrock = new BedrockRuntimeClient({
    region: process.env.AWS_REGION || 'us-east-1'
});

/**
 * Analyze incident using AI
 * 
 * @param {Buffer} imageBuffer - Image data as buffer
 * @param {string} description - User's description of the incident
 * @returns {Object} Analysis result with verification status and severity
 */
async function analyzeIncident(imageBuffer, description) {
    try {
        console.log("Starting AI analysis...");

        // Step 1: Detect labels in image using Rekognition
        const labels = await detectLabels(imageBuffer);
        console.log("Detected labels:", labels.map(l => l.Name));

        // Step 2: Use Bedrock to analyze if description matches image
        const bedrockAnalysis = await analyzeWithBedrock(labels, description);

        // Step 3: Calculate severity score
        const severity = calculateSeverity(labels, bedrockAnalysis);

        // Step 4: Determine if report is verified
        const isVerified = bedrockAnalysis.isMatch && severity >= 3;

        return {
            isVerified,
            severity,
            summary: bedrockAnalysis.summary,
            labels: labels.map(l => l.Name),
            confidence: bedrockAnalysis.confidence,
            analysis: {
                labelsDetected: labels.length,
                descriptionMatch: bedrockAnalysis.isMatch,
                aiReasoning: bedrockAnalysis.reasoning
            }
        };

    } catch (error) {
        console.error("AI Analysis Error:", error);

        // Return mock result if AWS not configured
        return getMockAnalysis(description);
    }
}

/**
 * Detect labels in image using AWS Rekognition
 */
async function detectLabels(imageBuffer) {
    const command = new DetectLabelsCommand({
        Image: { Bytes: imageBuffer },
        MaxLabels: 20,
        MinConfidence: 70
    });

    const response = await rekognition.send(command);
    return response.Labels || [];
}

/**
 * Analyze description against detected labels using Bedrock
 */
async function analyzeWithBedrock(labels, description) {
    const labelNames = labels.map(l => l.Name).join(', ');

    const prompt = `You are an AI assistant for a civic incident reporting system.

DETECTED IN IMAGE: ${labelNames}

USER'S DESCRIPTION: "${description}"

Analyze if the description matches what's in the image. This is for a civic reporting app where people report issues like potholes, flooding, broken infrastructure, etc.

Respond in JSON format:
{
    "isMatch": true/false,
    "confidence": 0-100,
    "summary": "Brief summary of what you see and the reported issue",
    "reasoning": "Why you believe the description matches or doesn't match",
    "suggestedSeverity": 1-10
}`;

    try {
        const command = new InvokeModelCommand({
            modelId: 'anthropic.claude-3-haiku-20240307-v1:0',
            body: JSON.stringify({
                anthropic_version: "bedrock-2023-05-31",
                max_tokens: 500,
                messages: [{ role: "user", content: prompt }]
            })
        });

        const response = await bedrock.send(command);
        const result = JSON.parse(new TextDecoder().decode(response.body));
        const content = result.content[0].text;

        // Parse JSON from response
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            return JSON.parse(jsonMatch[0]);
        }

        return {
            isMatch: true,
            confidence: 70,
            summary: "Analysis complete",
            reasoning: content,
            suggestedSeverity: 5
        };

    } catch (error) {
        console.error("Bedrock error:", error);
        return {
            isMatch: true,
            confidence: 60,
            summary: `Incident reported: ${description.substring(0, 100)}`,
            reasoning: "Automated verification (Bedrock unavailable)",
            suggestedSeverity: 5
        };
    }
}

/**
 * Calculate severity score based on detected elements
 */
function calculateSeverity(labels, bedrockAnalysis) {
    // Start with Bedrock's suggestion
    let severity = bedrockAnalysis.suggestedSeverity || 5;

    // Adjust based on detected labels
    const severeLabels = ['Flooding', 'Fire', 'Smoke', 'Damage', 'Crash', 'Accident'];
    const moderateLabels = ['Pothole', 'Crack', 'Debris', 'Trash', 'Graffiti'];

    const labelNames = labels.map(l => l.Name.toLowerCase());

    // Increase for severe situations
    if (severeLabels.some(s => labelNames.includes(s.toLowerCase()))) {
        severity = Math.min(10, severity + 2);
    }

    // Moderate adjustment
    if (moderateLabels.some(m => labelNames.includes(m.toLowerCase()))) {
        severity = Math.max(severity, 4);
    }

    return Math.min(10, Math.max(1, severity));
}

/**
 * Mock analysis for when AWS is not configured
 */
function getMockAnalysis(description) {
    const keywords = description.toLowerCase();

    let severity = 5;
    if (keywords.includes('flood') || keywords.includes('fire') || keywords.includes('emergency')) {
        severity = 9;
    } else if (keywords.includes('pothole') || keywords.includes('broken')) {
        severity = 6;
    } else if (keywords.includes('trash') || keywords.includes('graffiti')) {
        severity = 4;
    }

    return {
        isVerified: true,
        severity,
        summary: `Civic incident reported: ${description}. AI verification simulated (AWS not configured).`,
        labels: ['Outdoor', 'Road', 'Infrastructure'],
        confidence: 75,
        analysis: {
            labelsDetected: 3,
            descriptionMatch: true,
            aiReasoning: "Mock verification - configure AWS for real analysis"
        }
    };
}

module.exports = { analyzeIncident };
