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
      <nav className="bg-white shadow px-4 py-3 flex items-center">
        <h1 className="text-xl font-bold">Mello</h1>

        {/* Hamburger / Close Icon */}
        <div className="ml-auto md:hidden">
          <button
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle menu"
            className="focus:outline-none"
          >
            <div className="w-6 h-6 flex flex-col justify-between">
              <span
                className={`block h-0.5 w-full bg-black transform transition duration-300 ${
                  isOpen ? "rotate-45 translate-y-1.5" : ""
                }`}
              />
              <span
                className={`block h-0.5 w-full bg-black transition duration-300 ${
                  isOpen ? "opacity-0" : ""
                }`}
              />
              <span
                className={`block h-0.5 w-full bg-black transform transition duration-300 ${
                  isOpen ? "-rotate-45 -translate-y-1.5" : ""
                }`}
              />
            </div>
          </button>
        </div>

        {/* Desktop menu */}
        <div className="hidden md:flex space-x-4 items-center ml-auto">
          <NavLinks user={user} handleLogout={handleLogout} />
        </div>
      </nav>

      {/* Mobile menu */}
      {isOpen && (
        <div className="md:hidden bg-white shadow px-4 py-4 space-y-3">
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
  const close = () => closeMenu && closeMenu();

  return (
    <>
      <Link to="/" className="block hover:underline" onClick={close}>
        Domů
      </Link>
      <Link to="/chat" className="block hover:underline" onClick={close}>
        Mello Chat
      </Link>
      <Link to="/skills" className="block hover:underline" onClick={close}>
        Dovednosti
      </Link>
      <Link to="/family" className="block hover:underline" onClick={close}>
        Rodina
      </Link>

      {user ? (
        <>
          <span className="block text-sm text-gray-600">{user.email}</span>
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
            className="text-blue-600 hover:underline block"
            onClick={close}
          >
            Přihlásit se
          </Link>
          <Link
            to="/onboarding"
            className="text-blue-600 hover:underline block"
            onClick={close}
          >
            Registrovat
          </Link>
        </>
      )}
    </>
  );
}
