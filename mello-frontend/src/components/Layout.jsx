import React from "react";
import { Link } from "react-router-dom";
import { useUser } from "../context/UserContext"; // přidáno
import { supabase } from "../utils/supabaseClient"; // přidáno

export default function Layout({ children }) {
  const { user } = useUser(); // získáme přihlášeného uživatele

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.reload(); // nebo použij router pro redirect
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <nav className="bg-white shadow p-4 flex justify-between items-center">
        <h1 className="text-xl font-bold">Mello</h1>
        <div className="space-x-4 flex items-center">
          <Link to="/" className="hover:underline">
            Domů
          </Link>
          <Link to="/chat" className="hover:underline">
            Mello Chat
          </Link>
          <Link to="/skills" className="hover:underline">
            Dovednosti
          </Link>
          <Link to="/family" className="hover:underline">
            Rodina
          </Link>

          {user ? (
            <>
              <span className="text-sm text-gray-600">{user.email}</span>
              <button
                onClick={handleLogout}
                className="text-sm text-red-600 underline"
              >
                Odhlásit se
              </button>
            </>
          ) : (
            <>
              <Link
                to="/signin"
                className="mt-1 inline-block text-blue-600 hover:underline transition"
              >
                Přihlásit se
              </Link>
              <Link
                to="/onboarding"
                className="mt-1 inline-block text-blue-600 hover:underline transition"
              >
                Registrovat
              </Link>
            </>
          )}
        </div>
      </nav>
      <main className="p-4">{children}</main>
    </div>
  );
}
