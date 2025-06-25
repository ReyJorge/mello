// 📁 src/lib/searchGoogle.ts

export async function searchGoogle(query: string) {
  try {
    const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
    if (!response.ok) throw new Error("Network response was not ok");

    const data = await response.json();
    return data.results;
  } catch (error) {
    console.error("Google Search error:", error);
    return [];
  }
}
