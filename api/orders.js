// Vercel serverless: Mock order
function cors(res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
}

export default async function handler(req, res) {
  cors(res);
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  try {
    const body = typeof req.body === "string" ? JSON.parse(req.body || "{}") : (req.body || {});
    const { customer, items, total } = body;
    if (!customer || !Array.isArray(items) || !items.length) {
      return res.status(400).json({ error: "Invalid order payload" });
    }
    const orderId = "nf_" + Math.random().toString(36).slice(2, 10);
    res.status(201).json({
      orderId,
      status: "received",
      createdAt: new Date().toISOString(),
      customer,
      items,
      total: Number(total || 0)
    });
  } catch {
    res.status(400).json({ error: "Bad JSON" });
  }
}
