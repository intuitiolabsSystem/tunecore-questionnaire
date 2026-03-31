export default async function handler(req, res) {
  const sendError = (status, message, details) => {
    res.status(status).json({
      error: {
        status,
        message,
        ...(details ? { details } : {}),
      },
    });
  };

  if (req.method !== "POST") {
    sendError(405, "Method Not Allowed");
    return;
  }

  try {
    const notionToken = (process.env.NOTION_TOKEN || "").trim();
    const notionDatabaseId = (process.env.NOTION_DATABASE_ID || "").trim();
    if (!notionToken) {
      sendError(500, "Missing NOTION_TOKEN");
      return;
    }
    if (!notionDatabaseId) {
      sendError(500, "Missing NOTION_DATABASE_ID");
      return;
    }

    const { disposition, properties, content } = req.body || {};
    if (!disposition || typeof disposition !== "string") {
      sendError(400, "Missing disposition");
      return;
    }

    const notionProperties = {};
    const ensureRichText = (text) => ({
      rich_text: [{ type: "text", text: { content: String(text || "") } }],
    });

    // Most databases have a title property. We don't know its name, so we try "Service" first.
    // If the database's title property is named differently, Notion will return a helpful error
    // telling us which property is the title.
    notionProperties.Service = {
      title: [{ type: "text", text: { content: disposition } }],
    };

    if (properties && typeof properties === "object") {
      for (const [k, v] of Object.entries(properties)) {
        if (k === "Service") continue; // already mapped as title
        notionProperties[k] = ensureRichText(v);
      }
    }

    const blocks = [];
    const parts = String(content || "")
      .split("\n\n")
      .map((s) => s.trim())
      .filter(Boolean);

    for (const part of parts) {
      if (part === "---") {
        blocks.push({ object: "block", type: "divider", divider: {} });
        continue;
      }
      // Notion paragraph text length limit; keep it safe by chunking.
      const max = 1800;
      for (let i = 0; i < part.length; i += max) {
        const chunk = part.slice(i, i + max);
        blocks.push({
          object: "block",
          type: "paragraph",
          paragraph: {
            rich_text: [{ type: "text", text: { content: chunk } }],
          },
        });
      }
    }

    const upstream = await fetch("https://api.notion.com/v1/pages", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${notionToken}`,
        "Content-Type": "application/json",
        "Notion-Version": "2022-06-28",
      },
      body: JSON.stringify({
        parent: { database_id: notionDatabaseId },
        properties: notionProperties,
        children: blocks,
      }),
    });

    const data = await upstream.json();
    if (!upstream.ok) {
      const message =
        data?.message ||
        data?.error ||
        data?.code ||
        "Notion API error";
      sendError(upstream.status, message, data);
      return;
    }

    res.status(200).json({ url: data?.url || null, id: data?.id || null });
  } catch (e) {
    sendError(500, e?.message || "Server error");
  }
}

