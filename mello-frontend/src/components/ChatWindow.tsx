import React, { useState, useEffect, useRef } from "react";
import AvatarMello3D from "./AvatarMello3D";
import ChatMessage from "./ChatMessage";
import VoiceInput from "./VoiceInput";
import { supabase } from "../utils/supabaseClient";
import { getRelevantMemories } from "../lib/memory/getRelevantMemories";
import { formatMemoryPrompt } from "../lib/memory/formatMemoryPrompt";
import { markMemoriesUsed } from "../lib/memory/markMemoriesUsed";
import type { Session } from "@supabase/supabase-js";

function easeInOutQuad(t: number) {
  return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
}

function smoothScrollToBottom(element: HTMLElement | null, duration = 1500) {
  if (!element) return;
  const start = element.scrollTop;
  const end = element.scrollHeight;
  const distance = end - start;
  const startTime = performance.now();

  function step(currentTime: number) {
    const elapsed = currentTime - startTime;
    const t = Math.min(elapsed / duration, 1);
    const easedT = easeInOutQuad(t);

    const el = element as HTMLElement;
    el.scrollTop = start + distance * easedT;

    if (t < 1) requestAnimationFrame(step);
  }

  requestAnimationFrame(step);
}

function detectCategoryAndJournal(text: string) {
  const lower = text.toLowerCase().trim();
  let category = "jine";
  let journal = false;

  if (/narozeniny|bratr|sestra|rodina|mamka|taťka|syn|dcera/.test(lower))
    category = "rodina";
  else if (/práce|pohovor|zaměstnání|kolega|firma|šéf/.test(lower))
    category = "prace";
  else if (
    /kolo|sport|film|koníček|záliba|vaření|pečení|sbírám|rybaření/.test(lower)
  )
    category = "zajmy";
  else if (/mám rád|preferuji|dávám přednost/.test(lower))
    category = "preference";

  const isStoryLike =
    /pamatuju si|když|jednou jsem|vzpomínám si|v roce|bylo to/.test(lower);
  const isLongEnough =
    text.split(/[.?!]/).length > 1 || text.split(" ").length > 12;

  if (isStoryLike || isLongEnough) {
    journal = true;
    if (category === "jine") category = "denik";
  }

  return { category, journal };
}

export default function ChatWindow() {
  const [messages, setMessages] = useState<{ from: string; text: string }[]>(
    () => {
      const saved = localStorage.getItem("mello-chat-history");
      return saved
        ? JSON.parse(saved)
        : [{ from: "mello", text: "Dobrý den! Jak vám mohu dnes pomoci?" }];
    }
  );
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const voiceInputRef = useRef<{ startListening: () => void } | null>(null);

  useEffect(() => {
    const fetchSession = async () => {
      const result = await supabase.auth.getSession();
      const session: Session | null = result.data.session;
      if (session?.user?.id) setUserId(session.user.id);
    };

    fetchSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user?.id) setUserId(session.user.id);
      else setUserId(null);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const lastFive = messages.slice(-5);
    localStorage.setItem("mello-chat-history", JSON.stringify(lastFive));
  }, [messages]);

  useEffect(() => {
    if (messagesEndRef.current)
      smoothScrollToBottom(messagesEndRef.current, 1500);
  }, [messages]);

  const handleSearch = async (query: string) => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/search?q=${encodeURIComponent(query)}`
      );

      if (!response.ok) {
        throw new Error(`Chyba: ${response.status}`);
      }

      const data = await response.json();

      if (!data.results || data.results.length === 0) {
        setMessages((prev) => [
          ...prev,
          { from: "mello", text: "Nenašla jsem žádné výsledky. 🤷‍♀️" },
        ]);
        return;
      }

      const resultsText = data.results
        .map((r: any) => `🔍 **${r.title}**\n${r.link}\n_${r.snippet}_`)
        .join("\n\n");

      setMessages((prev) => [...prev, { from: "mello", text: resultsText }]);
    } catch (err) {
      console.error("Chyba při vyhledávání:", err);
      setMessages((prev) => [
        ...prev,
        { from: "mello", text: "Něco se pokazilo při hledání. 😕" },
      ]);
    }
  };

  const sendMessage = async (customText?: string) => {
    const finalInput = customText || input;
    if (finalInput.trim() === "") return;

    if (!userId) {
      setMessages((prev) => [
        ...prev,
        { from: "mello", text: "Nejprve se prosím přihlaste." },
      ]);
      return;
    }

    const userMessage = { from: "user", text: finalInput };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    const shouldSearch = (text: string) => {
      const t = text.toLowerCase();
      return (
        /\bnajdi\b|\bvyhledej\b|\bhledej\b|na internetu|co je|kde najdu/.test(
          t
        ) && !t.includes("nechci")
      );
    };

    if (shouldSearch(finalInput)) {
      console.log("🔍 Spouštím vyhledávání na internetu:", finalInput);
      await handleSearch(finalInput);
      setLoading(false);
      return;
    }

    try {
      const memories = await getRelevantMemories(userId);
      const memoryContext = formatMemoryPrompt(memories);
      const response = await fetch("http://localhost:5000/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: finalInput,
          memory_context: memoryContext,
        }),
      });

      const data = await response.json();
      if (data.reply) {
        setMessages((prev) => [...prev, { from: "mello", text: data.reply }]);

        const utterance = new SpeechSynthesisUtterance(data.reply);
        utterance.onend = () => {
          voiceInputRef.current?.startListening();
        };
        window.speechSynthesis.speak(utterance);

        await markMemoriesUsed(memories.map((m) => m.id));
      } else {
        throw new Error("Odpověď od Mella nebyla přijata.");
      }

      const { category, journal } = detectCategoryAndJournal(finalInput);
      const { error } = await supabase
        .from("mello_memory")
        .insert([{ user_id: userId, category, content: finalInput, journal }]);

      if (error) {
        console.error("Chyba při ukládání vzpomínky:", error);
        setMessages((prev) => [
          ...prev,
          { from: "mello", text: "Vzpomínku se nepodařilo uložit. 😞" },
        ]);
      }
    } catch (err) {
      console.error("Chyba při volání serveru:", err);
      setMessages((prev) => [
        ...prev,
        { from: "mello", text: "Promiňte, momentálně nejsem k dispozici. 😔" },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-gray-50 p-6">
      <header className="w-full max-w-4xl mx-auto mb-6 flex justify-between items-center px-4">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <span role="img" aria-label="brain">
            🧠
          </span>{" "}
          Mello Chat
        </h1>
      </header>

      <div
        className="flex-grow flex items-start justify-center w-full max-w-4xl mx-auto pt-16"
        style={{ minHeight: "60vh" }}
      >
        <div
          className="w-[40rem] h-[60vh] absolute"
          style={{ transform: "translateY(-40%)" }}
        >
          <AvatarMello3D className="w-full h-full" />
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-lg p-4 flex flex-col fixed bottom-0 left-1/2 transform -translate-x-1/2 z-10 w-full max-w-4xl h-[25vh]">
        <div
          className="flex-grow overflow-y-auto p-2 mb-4 bg-gray-100 rounded-lg"
          style={{ scrollbarWidth: "thin" }}
          ref={messagesEndRef}
        >
          {messages.map((msg, i) => (
            <ChatMessage key={i} from={msg.from} text={msg.text} />
          ))}
        </div>

        <div className="flex gap-3">
          <input
            className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-mello shadow-sm"
            type="text"
            placeholder="Napiš zprávu..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
              }
            }}
            disabled={loading}
          />
          <VoiceInput
            ref={voiceInputRef}
            onTranscript={(text) => {
              setInput(text);
              sendMessage(text);
            }}
          />
          <button
            onClick={() => sendMessage()}
            disabled={loading}
            className="bg-mello text-white font-medium px-5 py-3 rounded-xl hover:brightness-110 transition"
          >
            Odeslat
          </button>
        </div>
      </div>
    </div>
  );
}
