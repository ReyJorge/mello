async function searchOnInternet(query: string) {
  try {
    const response = await fetch(
      `http://localhost:5000/api/search?q=${encodeURIComponent(query)}`
    );
    if (!response.ok) {
      throw new Error(`Server error: ${response.status}`);
    }

    const data = await response.json();
    return data.results; // Pole s výsledky [{ title, link, snippet }, ...]
  } catch (error) {
    console.error("❌ Chyba při vyhledávání:", error);
    return [];
  }
}
