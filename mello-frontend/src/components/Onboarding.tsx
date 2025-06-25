// 📁 /components/Onboarding.tsx
import { useState, useEffect } from "react";
import { supabase } from "../utils/supabaseClient";

export default function Onboarding() {
  const [name, setName] = useState("");
  const [voice, setVoice] = useState("vera");
  const [language, setLanguage] = useState("cs");
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [checkingEmail, setCheckingEmail] = useState(true);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    const loadUserAndProfile = async () => {
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (!session || !session.user) {
        setCheckingEmail(false);
        return;
      }

      const user = session.user;
      setUser(user);

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (profileError && profileError.code !== "PGRST116") {
        setMessage("Chyba při načítání profilu: " + profileError.message);
        return;
      }

      // if (profile) {
      //   setName(profile.name || "");
      //   setVoice(profile.voice || "vera");
      //   setLanguage(profile.language || "cs");

      //   if (profile.name) {
      //     window.location.href = "/";
      //   }
      // }

      setCheckingEmail(false);
    };

    loadUserAndProfile();
  }, []);

  const handleSave = async () => {
    if (!user || !user.id) {
      alert("❌ Uživatelské ID chybí – jste přihlášen?");
      return;
    }

    const dataToSave = {
      id: user.id, // ⬅️ MUSÍ být auth.uid()
      name: name || "",
      voice: voice || "vera",
      language: language || "cs",
    };

    console.log("⬇️ Ukládám profil:", dataToSave);

    setLoading(true);

    const { error } = await supabase.from("profiles").upsert(dataToSave);

    setLoading(false);

    if (error) {
      alert("❌ Chyba při ukládání: " + error.message);
    } else {
      alert("✅ Uloženo!");
      window.location.href = "/";
    }
  };

  if (checkingEmail) {
    return <p className="text-center py-12">Ověřujeme přihlášení…</p>;
  }

  if (!user) {
    return (
      <div className="text-center py-12 px-6 max-w-md mx-auto">
        <p className="text-lg text-gray-700 mb-4">
          Nejste přihlášen(a). Pokud jste se právě zaregistroval(a),
          zkontrolujte prosím svůj e-mail a potvrďte registraci.
        </p>
        <a href="/signin" className="text-blue-600 hover:underline">
          Přihlásit se
        </a>
      </div>
    );
  }

  return (
    <div className="p-4 max-w-md mx-auto">
      <h2 className="text-xl font-bold mb-4">Nastavení profilu</h2>

      {message && (
        <p className="mb-4 text-red-600 text-sm text-center">{message}</p>
      )}

      <input
        className="mb-4 w-full border p-2"
        placeholder="Jméno"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />

      <label htmlFor="voice" className="block text-sm text-gray-700 mb-1">
        Vyber hlas
      </label>
      <select
        id="voice"
        className="mb-4 w-full border p-2"
        value={voice}
        onChange={(e) => setVoice(e.target.value)}
      >
        <option value="vera">Věra</option>
        <option value="eliska">Eliška</option>
      </select>

      <label htmlFor="language" className="block text-sm text-gray-700 mb-1">
        Vyber jazyk
      </label>
      <select
        id="language"
        className="mb-4 w-full border p-2"
        value={language}
        onChange={(e) => setLanguage(e.target.value)}
      >
        <option value="cs">Čeština</option>
        <option value="en">English</option>
      </select>

      <button
        className="bg-green-600 text-white px-4 py-2"
        onClick={handleSave}
        disabled={loading}
      >
        {loading ? "Ukládám…" : "Uložit profil"}
      </button>
    </div>
  );
}
