import React from "react";

export default function ChatMessage({ from, text }) {
  const formatTextWithLinks = (text) => {
    return text
      .replace(
        /(https?:\/\/[^\s]+)/g,
        '<a href="$1" target="_blank" rel="noopener noreferrer" class="text-blue-600 underline">$1</a>'
      )
      .replace(/\n/g, "<br>");
  };

  return (
    <div
      className={`flex items-center gap-4 max-w-[90%] ${
        from === "user" ? "ml-auto flex-row-reverse" : "mr-auto"
      }`}
    >
      {from === "user" ? (
        <div style={{ width: 80, height: 10 }} />
      ) : (
        <div style={{ width: 10, height: 10 }} />
      )}

      <div
        className={`px-5 py-3 rounded-3xl text-sm shadow-lg max-w-[70%] ${
          from === "user"
            ? "bg-blue-200 text-right"
            : "bg-emerald-200 text-left"
        }`}
        dangerouslySetInnerHTML={{ __html: formatTextWithLinks(text) }}
      />
    </div>
  );
}
