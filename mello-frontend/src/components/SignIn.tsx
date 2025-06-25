import { useState } from "react";
import { supabase } from "../utils/supabaseClient";

export default function SignIn() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);
  const [message, setMessage] = useState("");

  const handleAuth = async () => {
    setMessage("");
    if (isRegistering) {
      // REGISTRACE
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) {
        setMessage("❌ " + error.message);
      } else {
        setMessage(
          "✅ Účet vytvořen! Zkontrolujte e-mail a poté se přihlaste."
        );
      }
    } else {
      // PŘIHLÁŠENÍ
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) {
        setMessage("❌ " + error.message);
      } else {
        window.location.href = "/onboarding";
      }
    }
  };

  return (
    <div className="p-4 max-w-md mx-auto">
      <h2 className="text-xl font-bold mb-4">
        {isRegistering ? "Registrace" : "Přihlášení"} do Mello
      </h2>

      <input
        className="mb-2 w-full border p-2"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        className="mb-4 w-full border p-2"
        type="password"
        placeholder="Heslo"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <button
        className="bg-blue-600 text-white px-4 py-2 w-full"
        onClick={handleAuth}
      >
        {isRegistering ? "Registrovat" : "Přihlásit se"}
      </button>

      <button
        className="mt-2 text-sm text-blue-700 underline"
        onClick={() => {
          setIsRegistering(!isRegistering);
          setMessage("");
        }}
      >
        {isRegistering
          ? "Máte účet? Přihlaste se"
          : "Nemáte účet? Zaregistrujte se"}
      </button>

      {message && (
        <p className="mt-4 text-center text-sm text-gray-700">{message}</p>
      )}
    </div>
  );
}
