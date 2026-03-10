// api/itunes.js  — Vercel serverless proxy for iTunes Search API
export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET");

  const { term, limit = 8 } = req.query;
  if (!term) return res.status(400).json({ error: "term required" });

  try {
    const url = `https://itunes.apple.com/search?term=${encodeURIComponent(term)}&entity=song&limit=${limit}&media=music`;
    const response = await fetch(url);
    const data = await response.json();
    res.status(200).json(data);
  } catch (e) {
    res.status(500).json({ error: "iTunes fetch failed", results: [] });
  }
}