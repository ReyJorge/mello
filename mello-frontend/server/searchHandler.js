// server/searchHandler.js
import express from "express";
import fetch from "node-fetch";

const router = express.Router();

const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;
const GOOGLE_CSE_ID = process.env.GOOGLE_CSE_ID;

router.get("/api/search", async (req, res) => {
  const query = req.query.q;
  if (!query) return res.status(400).json({ error: "Missing search query" });

  try {
    const url = `https://www.googleapis.com/customsearch/v1?key=${GOOGLE_API_KEY}&cx=${GOOGLE_CSE_ID}&q=${encodeURIComponent(
      query
    )}`;
    const response = await fetch(url);
    const data = await response.json();

    const results = (data.items || []).slice(0, 3).map((item) => ({
      title: item.title,
      link: item.link,
      snippet: item.snippet,
    }));

    res.json({ results });
  } catch (err) {
    console.error("Search API error:", err);
    res.status(500).json({ error: "Failed to fetch search results" });
  }
});

export default router;
