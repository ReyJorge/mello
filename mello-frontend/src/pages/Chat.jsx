// src/pages/Chat.jsx
import React from "react";
import ChatWindow from "../components/ChatWindow";
import Layout from "../components/Layout";
import Avatar from "../components/Avatar";

export default function Chat() {
  return (
    <Layout>
      {/* Avatar uživatele */}
      {/* <div className="mb-8">
        <Avatar />
      </div> */}
      <ChatWindow />
    </Layout>
  );
}
