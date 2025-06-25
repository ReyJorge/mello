// 📁 /components/PhoneLogin.tsx
import { useState } from "react";
import { supabase } from "../utils/supabaseClient";

export default function PhoneLogin({
  phone,
  setPhone,
  onSent,
}: {
  phone: string;
  setPhone: (value: string) => void;
  onSent: () => void;
}) {
  const [message, setMessage] = useState("");

  const handleSendCode = async () => {
    setMessage("");
    const { error } = await supabase.auth.signInWithOtp({ phone });
    if (error) {
      setMessage("❌ " + error.message);
    } else {
      setMessage("✅ Kód byl odeslán na vaše telefonní číslo.");
      onSent();
    }
  };

  return (
    <div className="p-4 max-w-md mx-auto">
      <h2 className="text-xl font-bold mb-4">Přihlášení pomocí telefonu</h2>
      <input
        type="tel"
        className="mb-2 w-full border p-2"
        placeholder="Zadejte telefon (např. +420123456789)"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
      />
      <button
        onClick={handleSendCode}
        className="bg-blue-600 text-white px-4 py-2 rounded w-full"
      >
        Odeslat kód
      </button>
      {message && (
        <p className="mt-4 text-sm text-center text-gray-700">{message}</p>
      )}
    </div>
  );
}
