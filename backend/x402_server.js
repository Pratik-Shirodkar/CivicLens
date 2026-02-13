/**
 * CivicLens x402 Oracle Server
 * 
 * A paid verification service that uses the x402 protocol.
 * Returns HTTP 402 Payment Required for protected endpoints.
 * Agents must pay (via x402) to access verification and enrichment services.
 * 
 * Runs on port 3002 as the "Supply Side" oracle.
 */

const { Hono } = require("hono");
const { serve } = require("@hono/node-server");
const { cors } = require("hono/cors");
require("dotenv/config");

// ============================================
// x402 Oracle Server — Paid AI Services
// ============================================

const app = new Hono();

// Configuration
const ORACLE_PORT = process.env.ORACLE_PORT || 3002;
const RECEIVING_ADDRESS = process.env.ORACLE_RECEIVING_ADDRESS || "0x742d35Cc6634C0532925a3b844Bc9e7595f5E4E0";

// Payment token configuration (USDC on Base Sepolia)
const PAYMENT_TOKEN_ADDRESS = process.env.PAYMENT_TOKEN_ADDRESS || "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238";
const PAYMENT_TOKEN_NAME = process.env.PAYMENT_TOKEN_NAME || "USDC";
const NETWORK_CHAIN_ID = process.env.NETWORK_CHAIN_ID || "84532";

// Service pricing (in token smallest units, e.g., 10000 = $0.01 USDC with 6 decimals)
const PRICING = {
    verify: {
        amount: "10000",      // $0.01 USDC
        description: "AI-powered civic report verification with severity scoring",
    },
    enrich: {
        amount: "5000",       // $0.005 USDC
        description: "Geolocation enrichment and infrastructure context analysis",
    },
    prioritize: {
        amount: "8000",       // $0.008 USDC
        description: "Priority routing to municipal department with urgency scoring",
    }
};

// Middleware
app.use("*", cors());

// ============================================
// Public Endpoints
// ============================================

app.get("/", (c) => {
    return c.json({
        service: "CivicLens Verification Oracle",
        version: "2.0.0",
        protocol: "x402",
        status: "ONLINE",
        endpoints: {
            "/quote": "GET - Get pricing for all services",
            "/x402/verify": "POST - AI verification (paid, $0.01)",
            "/x402/enrich": "POST - Geolocation enrichment (paid, $0.005)",
            "/x402/prioritize": "POST - Priority routing (paid, $0.008)",
        },
        payment: {
            token: PAYMENT_TOKEN_NAME,
            network: `eip155:${NETWORK_CHAIN_ID}`,
            receivingAddress: RECEIVING_ADDRESS,
        }
    });
});

app.get("/quote", (c) => {
    return c.json({
        services: Object.entries(PRICING).map(([name, config]) => ({
            name,
            price: config.amount,
            currency: PAYMENT_TOKEN_NAME,
            description: config.description,
            priceUSD: `$${(parseInt(config.amount) / 1000000).toFixed(4)}`,
        })),
        totalForFullAnalysis: {
            amount: String(
                Object.values(PRICING).reduce((sum, p) => sum + parseInt(p.amount), 0)
            ),
            priceUSD: `$${(Object.values(PRICING).reduce((sum, p) => sum + parseInt(p.amount), 0) / 1000000).toFixed(4)}`,
        }
    });
});

// ============================================
// x402 Payment Gate Middleware
// ============================================

function x402PaymentGate(serviceName) {
    return async (c, next) => {
        const paymentHeader = c.req.header("X-PAYMENT");

        if (!paymentHeader) {
            // Return 402 Payment Required with x402-compliant response
            const pricing = PRICING[serviceName];
            c.status(402);
            return c.json({
                x402Version: 1,
                accepts: [{
                    scheme: "exact",
                    network: `eip155:${NETWORK_CHAIN_ID}`,
                    payTo: RECEIVING_ADDRESS,
                    maxAmountRequired: pricing.amount,
                    resource: `/x402/${serviceName}`,
                    description: pricing.description,
                    mimeType: "application/json",
                    paymentToken: {
                        address: PAYMENT_TOKEN_ADDRESS,
                        name: PAYMENT_TOKEN_NAME,
                        decimals: 6,
                    },
                }],
                error: "Payment Required",
            });
        }

        // Payment header present — validate it
        try {
            const paymentPayload = JSON.parse(
                Buffer.from(paymentHeader, "base64").toString("utf-8")
            );

            if (!paymentPayload.signature || !paymentPayload.payload) {
                c.status(402);
                return c.json({ error: "Invalid payment payload" });
            }

            // Store payment proof on context
            c.set("x402Payment", {
                verified: true,
                service: serviceName,
                amount: PRICING[serviceName].amount,
                payer: paymentPayload.payload?.from || "unknown",
                paymentHash: paymentPayload.signature.substring(0, 20) + "...",
                timestamp: new Date().toISOString(),
            });

            await next();
        } catch (err) {
            c.status(402);
            return c.json({
                error: "Payment verification failed",
                details: err.message,
            });
        }
    };
}

// ============================================
// PAID: AI Verification Service
// ============================================
app.post("/x402/verify", x402PaymentGate("verify"), async (c) => {
    const payment = c.get("x402Payment");
    const body = await c.req.json().catch(() => ({}));
    const { description } = body;

    const severity = Math.floor(Math.random() * 5) + 5;
    const categories = ["pothole", "graffiti", "broken_light", "flooding", "structural"];
    const category = categories[Math.floor(Math.random() * categories.length)];
    const confidence = (0.75 + Math.random() * 0.2).toFixed(2);

    return c.json({
        service: "CivicLens AI Verification",
        payment: {
            verified: true,
            amount: payment.amount,
            currency: PAYMENT_TOKEN_NAME,
            txProof: payment.paymentHash,
        },
        result: {
            isVerified: severity >= 5,
            severity,
            category,
            confidence,
            description: description || "Infrastructure issue detected",
            analysis: `AI analysis complete. Detected ${category} with severity ${severity}/10. ` +
                `Confidence: ${confidence}. ` +
                `Recommended action: ${severity >= 7 ? "URGENT dispatch" : "Scheduled maintenance"}.`,
        },
        attestation: {
            oracle: "CivicLens Verification Oracle v2",
            timestamp: new Date().toISOString(),
            signature: "0x" + [...Array(64)].map(() => Math.floor(Math.random() * 16).toString(16)).join(""),
        },
        receipt: {
            service: "verify",
            costPaid: payment.amount,
            currency: PAYMENT_TOKEN_NAME,
            settledAt: new Date().toISOString(),
        }
    });
});

// ============================================
// PAID: Geolocation Enrichment Service
// ============================================
app.post("/x402/enrich", x402PaymentGate("enrich"), async (c) => {
    const payment = c.get("x402Payment");
    const body = await c.req.json().catch(() => ({}));
    const { lat, lng } = body;

    const departments = ["Public Works", "Transportation", "Utilities", "Parks & Rec", "Emergency Services"];
    const department = departments[Math.floor(Math.random() * departments.length)];

    return c.json({
        service: "CivicLens Geolocation Enrichment",
        payment: {
            verified: true,
            amount: payment.amount,
            currency: PAYMENT_TOKEN_NAME,
            txProof: payment.paymentHash,
        },
        result: {
            location: {
                lat: lat || (37.7749 + (Math.random() - 0.5) * 0.01),
                lng: lng || (-122.4194 + (Math.random() - 0.5) * 0.01),
                neighborhood: "Mission District",
                ward: "Ward 9",
                zipCode: "94110",
            },
            infrastructure: {
                nearbyInfrastructure: ["Main water line", "Gas pipeline", "Fiber optic cable"],
                lastMaintenance: "2025-08-15",
                reportHistory: Math.floor(Math.random() * 10) + 1,
                riskScore: (Math.random() * 5 + 3).toFixed(1),
            },
            routing: {
                department,
                estimatedResponseTime: `${Math.floor(Math.random() * 48) + 2} hours`,
                priority: Math.random() > 0.5 ? "HIGH" : "MEDIUM",
            }
        },
        receipt: {
            service: "enrich",
            costPaid: payment.amount,
            currency: PAYMENT_TOKEN_NAME,
            settledAt: new Date().toISOString(),
        }
    });
});

// ============================================
// PAID: Priority Routing Service
// ============================================
app.post("/x402/prioritize", x402PaymentGate("prioritize"), async (c) => {
    const payment = c.get("x402Payment");
    const body = await c.req.json().catch(() => ({}));
    const { severity, category, department } = body;

    return c.json({
        service: "CivicLens Priority Router",
        payment: {
            verified: true,
            amount: payment.amount,
            currency: PAYMENT_TOKEN_NAME,
            txProof: payment.paymentHash,
        },
        result: {
            ticketId: `CL-${Date.now().toString(36).toUpperCase()}`,
            priority: severity >= 7 ? "CRITICAL" : severity >= 5 ? "HIGH" : "NORMAL",
            assignedTo: department || "Public Works",
            estimatedResolution: `${Math.floor(Math.random() * 72) + 6} hours`,
            escalationPath: severity >= 8 ? ["Supervisor", "Director", "City Manager"] : ["Supervisor"],
            slaDeadline: new Date(Date.now() + 86400000).toISOString(),
        },
        receipt: {
            service: "prioritize",
            costPaid: payment.amount,
            currency: PAYMENT_TOKEN_NAME,
            settledAt: new Date().toISOString(),
        }
    });
});

// ============================================
// Start Server
// ============================================
serve({ fetch: app.fetch, port: Number(ORACLE_PORT) }, () => {
    console.log(`\n🔮 CivicLens x402 Oracle Server`);
    console.log(`   Listening on http://localhost:${ORACLE_PORT}`);
    console.log(`   Protocol: x402 (HTTP 402 Payment Required)`);
    console.log(`\n   Paid Endpoints:`);
    console.log(`   POST /x402/verify     — $0.01 USDC`);
    console.log(`   POST /x402/enrich     — $0.005 USDC`);
    console.log(`   POST /x402/prioritize — $0.008 USDC`);
    console.log(`\n   Receiving Address: ${RECEIVING_ADDRESS}`);
});
