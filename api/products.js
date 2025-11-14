// Vercel serverless: Products with filter/search/pagination
import fs from "fs/promises";
import path from "path";

let cache = null;
async function loadData() {
  if (cache) return cache;
  const file = path.join(process.cwd(), "data", "products.json");
  cache = JSON.parse(await fs.readFile(file, "utf-8"));
  return cache;
}
function cors(res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
}

export default async function handler(req, res) {
  cors(res);
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });

  try {
    const data = await loadData();
    const { category, q, page = "1", limit = "24" } = req.query;

    let items = data.products.slice();

    if (category) {
      const c = String(category).toLowerCase();
      items = items.filter(p => p.category.toLowerCase() === c);
    }
    if (q) {
      const s = String(q).toLowerCase();
      items = items.filter(p =>
        p.name.toLowerCase().includes(s) ||
        (p.description || "").toLowerCase().includes(s)
      );
    }

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const lim = Math.max(1, Math.min(100, parseInt(limit, 10) || 24));
    const start = (pageNum - 1) * lim;
    const end = start + lim;

    res.status(200).json({
      storeId: "nofrills",
      storeName: "No Frills",
      total: items.length,
      page: pageNum,
      limit: lim,
      items: items.slice(start, end)
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to load products" });
  }
}
