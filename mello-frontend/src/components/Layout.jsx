import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useUser } from "../context/UserContext";
import { supabase } from "../utils/supabaseClient";

export default function Layout({ children }) {
  const { user } = useUser();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <nav className="relative bg-white shadow p-4 flex items-center justify-center">
        {/* Logo uprostřed */}
        <h1 className="text-xl font-bold absolute left-1/2 -translate-x-1/2">
          Mello
        </h1>

        {/* Hamburger vpravo */}
        <button
          className="md:hidden absolute right-4 text-lg text-gray-700"
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Toggle menu"
        >
          ☰
        </button>

        {/* Desktop menu */}
        <div className="hidden md:flex space-x-4 items-center absolute right-4">
          <NavLinks user={user} handleLogout={handleLogout} />
        </div>
      </nav>

      {/* Mobilní menu */}
      {isOpen && (
        <div className="md:hidden bg-white shadow px-4 py-2 space-y-2">
          <NavLinks
            user={user}
            handleLogout={() => {
              setIsOpen(false);
              handleLogout();
            }}
            closeMenu={() => setIsOpen(false)}
          />
        </div>
      )}

      <main className="p-4">{children}</main>
    </div>
  );
}

function NavLinks({ user, handleLogout, closeMenu }) {
  const close = () => closeMenu && closeMenu(); // pokud je funkce definovaná (mobilní menu)

  return (
    <>
      <Link to="/" className="hover:underline block" onClick={close}>
        Domů
      </Link>
      <Link to="/chat" className="hover:underline block" onClick={close}>
        Mello Chat
      </Link>
      <Link to="/skills" className="hover:underline block" onClick={close}>
        Dovednosti
      </Link>
      <Link to="/family" className="hover:underline block" onClick={close}>
        Rodina
      </Link>

      {user ? (
        <>
          <span className="text-sm text-gray-600 block">{user.email}</span>
          <button
            onClick={handleLogout}
            className="text-sm text-red-600 underline block"
          >
            Odhlásit se
          </button>
        </>
      ) : (
        <>
          <Link
            to="/signin"
            className="text-blue-600 hover:underline transition block"
            onClick={close}
          >
            Přihlásit se
          </Link>
          <Link
            to="/onboarding"
            className="text-blue-600 hover:underline transition block"
            onClick={close}
          >
            Registrovat
          </Link>
        </>
      )}
    </>
  );
}
