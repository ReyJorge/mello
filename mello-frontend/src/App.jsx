import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";

import Home from "./pages/Home";
import Chat from "./pages/Chat";
import Skills from "./pages/Skills";
import Family from "./pages/Family";
import PhoneAuth from "./pages/PhoneAuth";
import ProfileTest from "./components/ProfileTest";

import SignIn from "./components/SignIn";
import Onboarding from "./components/Onboarding";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/ProfileTest" element={<ProfileTest />} />
        <Route path="/chat" element={<Chat />} />
        <Route path="/skills" element={<Skills />} />
        <Route path="/family" element={<Family />} />

        {/* ➕ Přidané nové routy pro přihlášení a onboarding */}
        <Route path="/signin" element={<SignIn />} />
        <Route path="/onboarding" element={<Onboarding />} />
        <Route path="/phone" element={<PhoneAuth />} />
      </Routes>
    </Router>
  );
}

export default App;
