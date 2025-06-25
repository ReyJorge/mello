// src/utils/searchGoogle.ts

export async function searchGoogle(query: string) {
  const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
  if (!response.ok) throw new Error("Nepodařilo se načíst výsledky z Googlu");

  const data = await response.json();
  return data.items.map((item: any) => ({
    title: item.title,
    link: item.link,
  }));
}
