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
      <nav className="bg-white shadow p-4 flex justify-between items-center relative">
        <h1 className="text-xl font-bold">Mello</h1>

        {/* SVG Hamburger ikonka */}
        <button
          className="md:hidden z-20 focus:outline-none"
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Toggle menu"
        >
          <div className="w-6 h-6 flex flex-col justify-between items-center transform transition-all duration-300 origin-center">
            <span
              className={`block h-0.5 w-full bg-black transform transition duration-300 ease-in-out ${
                isOpen ? "rotate-45 translate-y-2" : ""
              }`}
            />
            <span
              className={`block h-0.5 w-full bg-black transition duration-300 ease-in-out ${
                isOpen ? "opacity-0" : ""
              }`}
            />
            <span
              className={`block h-0.5 w-full bg-black transform transition duration-300 ease-in-out ${
                isOpen ? "-rotate-45 -translate-y-2" : ""
              }`}
            />
          </div>
        </button>

        {/* Navigace pro větší obrazovky */}
        <div className="hidden md:flex space-x-4 items-center">
          <NavLinks user={user} handleLogout={handleLogout} />
        </div>
      </nav>

      {/* Mobilní menu (overlay styl) */}
      <div
        className={`md:hidden absolute top-16 right-0 w-full bg-white shadow-md transition-all duration-300 ease-in-out ${
          isOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
      >
        <div className="p-4 space-y-2">
          <NavLinks
            user={user}
            handleLogout={() => {
              setIsOpen(false);
              handleLogout();
            }}
            closeMenu={() => setIsOpen(false)}
          />
        </div>
      </div>

      <main className="p-4">{children}</main>
    </div>
  );
}

function NavLinks({ user, handleLogout, closeMenu }) {
  const close = () => closeMenu && closeMenu();

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
