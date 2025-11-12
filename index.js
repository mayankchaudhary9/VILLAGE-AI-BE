import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import authRouters from "./src/routes/authRoutes.js";


dotenv.config();
const app = express();

app.use(cors());
app.use(express.json()); // For JSON body
app.use(express.urlencoded({ extended: false })); 

app.use("/api/auth", authRouters);

app.get("/", (req, res) => {
  res.send("Village AI Connect Backend is Running");
});

// ------------------ FARMING CHATBOT ENDPOINT ------------------
app.post("/api/chat", async (req, res) => {
  const { message } = req.body;
  if (!message) return res.status(400).json({ text: "Message is required." });

  try {
    const model = "gemini-2.5-flash";

    // Farming bias prompt
    const farmingContext = `
    You are an expert AI assistant for Indian farmers.
    95% of your answers must be about farming, crops, soil, fertilizers, weather, irrigation, livestock, etc.
    If asked about unrelated topics (like politics, entertainment, coding, etc.), respond briefly and redirect to farming.
    Keep answers simple, short, and friendly — easy for Indian rural users to understand.
    If user writes in Hindi, reply in simple Hindi or mix of English + Hindi.
    `;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts: [
                { text: `${farmingContext}\n\nUser: ${message}` }, 
              ],
            },
          ],
        }),
      }
    );

    const data = await response.json();
    console.log("Gemini full response:", JSON.stringify(data, null, 2));

    let botText = "No valid response.";

    if (data?.candidates?.length > 0) {
      botText = data.candidates[0]?.content?.parts?.[0]?.text || botText;
    } else if (data?.error) {
      botText = `${data.error.message}`; // e.g., "The model is overloaded..."
    }

    res.json({ text: botText });
  } catch (error) {
    console.error("Gemini Error:", error);
    res.status(500).json({ text: "⚠️ Something went wrong." });
  }
});



// ------------------ SERVER START ------------------
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
