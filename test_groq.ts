import Groq from "groq-sdk";
import dotenv from "dotenv";

dotenv.config();

const apiKey = process.env.GROQ_API_KEY;

console.log("Checking GROQ_API_KEY...");

if (!apiKey) {
    console.error("❌ GROQ_API_KEY is missing in .env file");
    process.exit(1);
}

console.log(`🔑 Key found: ${apiKey.substring(0, 10)}... (length: ${apiKey.length})`);

const groq = new Groq({ apiKey });

async function testConnection() {
    try {
        console.log("📡 Sending test request to Groq (llama3-70b-8192)...");
        const chatCompletion = await groq.chat.completions.create({
            messages: [
                {
                    role: "user",
                    content: "Reply with the single word 'Success' if you can read this.",
                },
            ],
            model: "llama-3.3-70b-versatile",
        });

        const output = chatCompletion.choices[0]?.message?.content || "";
        console.log("✅ API Response Received:");
        console.log("------------------------");
        console.log(output);
        console.log("------------------------");
        console.log("🎉 Groq Key is WORKING!");
    } catch (error: any) {
        console.error("❌ Groq Connection Failed:");
        console.error(error.message || error);

        if (error.status === 401) {
            console.error("👉 Error 401: Unauthorized. Your API Key is likely invalid or expired.");
        }
    }
}

testConnection();
