import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import OpenAI from "openai";
import searchHandler from "./searchHandler.js";

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(searchHandler);

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

app.post("/api/classify-memory", async (req, res) => {
  const { message } = req.body;
  if (!message) return res.status(400).json({ error: "Missing message" });

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content:
            "Rozhodni, zda zpráva obsahuje osobní vzpomínku vhodnou k uložení do deníku. Odpověz pouze ANO nebo NE.",
        },
        { role: "user", content: message },
      ],
    });

    const answer = completion.choices[0].message.content.trim().toUpperCase();
    res.json({ worthy: answer === "ANO" });
  } catch (error) {
    console.error("OpenAI classify error:", error);
    res.status(500).json({ error: "Failed to classify memory." });
  }
});

app.post("/api/chat", async (req, res) => {
  const userMessage = req.body.message;
  const memoryContext = req.body.memory_context || "";

  if (!userMessage) return res.status(400).json({ error: "Missing message" });

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `Jsi empatický český virtuální společník jménem Mello. Pokud nevíš odpověď, nebo máš pocit, že uživatel chce najít něco online (např. stránku, text písně, aktuální informaci), odpověz pouze jedním znakem "🤔". Nic víc.`,
        },
        { role: "user", content: `${memoryContext}\n${userMessage}` },
      ],
    });

    const reply = completion.choices[0].message.content.trim();

    if (reply === "🤔") {
      // Přesměrování na vyhledávání
      return res.redirect(
        307,
        "/api/search?q=" + encodeURIComponent(userMessage)
      );
    }

    res.json({ reply });
  } catch (error) {
    console.error("OpenAI error:", error);
    res.status(500).json({ error: "Failed to get response from OpenAI." });
  }
});

app.get("/", (req, res) => {
  res.send("✅ Mello backend je online.");
});

app.listen(port, () => {
  console.log(`✅ Server běží na http://localhost:${port}`);
});
