import { Memory } from "./getRelevantMemories";

/**
 * Převádí vzpomínky do textu pro GPT prompt tak, aby byly použity jako kontext při odpovídání.
 */
export function formatMemoryPrompt(memories: Memory[]): string {
  if (memories.length === 0) return "";

  const lines = memories.map((m) => {
    const tags = m.tags?.length ? ` (${m.tags.join(", ")})` : "";
    const type = m.type ? `[${m.type}] ` : "";
    return `– ${type}${m.content}${tags}`;
  });

  return `Uživatel mi v minulosti řekl následující informace:\n\n${lines.join(
    "\n"
  )}\n\nTyto informace považuj za důležité. Využívej je při všech dalších odpovědích – i když se uživatel přímo nezeptá.`;
}
