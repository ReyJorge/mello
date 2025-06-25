// 📁 src/lib/memory/gptMemoryClassifier.ts

import { OpenAI } from "openai";
import * as dotenv from "dotenv";
dotenv.config({ path: "../../../server/.env" });

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // <-- použij místo import.meta.env
  dangerouslyAllowBrowser: true, // důležité pro frontend
});

export async function isMemoryWorthy(message: string): Promise<boolean> {
  if (!openai.apiKey) {
    console.error("❌ Chybí OpenAI API klíč (VITE_OPENAI_API_KEY)");
    return false;
  }

  const prompt = `Zvaž, zda následující zpráva od uživatele obsahuje osobní zážitek nebo vzpomínku vhodnou k uložení do deníku.\n\nZpráva: "${message}"\n\nOdpověz pouze "ANO" nebo "NE".`;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content:
            "Jsi chytrý asistent, který rozhoduje, zda je zpráva vhodná pro uložení jako osobní vzpomínka. Odpovídej pouze 'ANO' nebo 'NE'.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    const response = completion.choices[0]?.message.content
      ?.trim()
      .toUpperCase();
    console.log("🧠 GPT rozhodnutí o vzpomínce:", response);

    if (!response) return false;
    return response.startsWith("ANO");
  } catch (error) {
    console.error("❌ Chyba při dotazu na OpenAI:", error);
    return false;
  }
}
