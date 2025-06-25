import { useEffect, useState } from "react";
import { supabase } from "../utils/supabaseClient";

export default function ProfileTest() {
  const [session, setSession] = useState(null);
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const getSession = async () => {
      const { data, error } = await supabase.auth.getSession();
      console.log("🧠 user.id z aplikace:", data?.session?.user?.id);
      setSession(data?.session);
    };

    getSession();
  }, []);

  const handleSave = async () => {
    if (!session) {
      alert("❌ Není přihlášený uživatel.");
      return;
    }

    const userId = session.user.id;

    const dataToSave = {
      id: userId,
      name: "Testovací Uživatel",
      voice: "vera",
      language: "cs",
    };

    console.log("💾 Ukládám:", dataToSave);

    setLoading(true);

    const { error } = await supabase.from("profiles").upsert(dataToSave);

    setLoading(false);

    if (error) {
      console.error("❌ Chyba:", error);
      setResult("❌ " + error.message);
    } else {
      setResult("✅ Uloženo");
    }
  };

  return (
    <div className="p-6 max-w-md mx-auto">
      <h2 className="text-xl font-bold mb-4">Test uložení profilu</h2>
      <button
        className="bg-blue-600 text-white px-4 py-2 rounded"
        onClick={handleSave}
        disabled={loading}
      >
        {loading ? "Ukládám…" : "Uložit testovací profil"}
      </button>
      <p className="mt-4 text-gray-700">{result}</p>
    </div>
  );
}
