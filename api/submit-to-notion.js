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

    const notionRequest = async (url, init) => {
      const upstream = await fetch(url, {
        ...init,
        headers: {
          Authorization: `Bearer ${notionToken}`,
          "Content-Type": "application/json",
          "Notion-Version": "2022-06-28",
          ...(init?.headers || {}),
        },
      });
      const data = await upstream.json().catch(() => ({}));
      return { upstream, data };
    };

    const ensureRichText = (text) => ({
      rich_text: [{ type: "text", text: { content: String(text || "") } }],
    });
    const ensureTitle = (text) => ({
      title: [{ type: "text", text: { content: String(text || "") } }],
    });

    // Fetch database schema so we can use the real title property name and only write valid props.
    const { upstream: dbResp, data: db } = await notionRequest(
      `https://api.notion.com/v1/databases/${notionDatabaseId}`,
      { method: "GET", headers: { "Content-Type": undefined } }
    );
    if (!dbResp.ok) {
      sendError(
        dbResp.status,
        db?.message || db?.error || "Failed to read Notion database schema",
        db
      );
      return;
    }

    const dbProps = db?.properties || {};
    const titlePropName =
      Object.entries(dbProps).find(([, p]) => p?.type === "title")?.[0] || null;
    if (!titlePropName) {
      sendError(500, "No title property found on Notion database", db);
      return;
    }

    const notionProperties = {
      [titlePropName]: ensureTitle(disposition),
    };

    // Best-effort mapping of provided properties into existing database properties.
    if (properties && typeof properties === "object") {
      for (const [k, v] of Object.entries(properties)) {
        const schema = dbProps?.[k];
        if (!schema) continue;

        if (schema.type === "title") {
          notionProperties[k] = ensureTitle(v);
          continue;
        }
        if (schema.type === "rich_text") {
          notionProperties[k] = ensureRichText(v);
          continue;
        }
        if (schema.type === "select") {
          notionProperties[k] = { select: v ? { name: String(v) } : null };
          continue;
        }
        if (schema.type === "status") {
          notionProperties[k] = { status: v ? { name: String(v) } : null };
          continue;
        }
        if (schema.type === "multi_select") {
          const arr = Array.isArray(v) ? v : String(v || "").split(",").map((s) => s.trim()).filter(Boolean);
          notionProperties[k] = { multi_select: arr.map((name) => ({ name })) };
          continue;
        }
        if (schema.type === "checkbox") {
          notionProperties[k] = { checkbox: Boolean(v) && String(v).toLowerCase() !== "false" };
          continue;
        }

        // Fallback: attempt rich_text if schema type is unsupported by this mapper.
        // (We still avoid writing invalid property shapes.)
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

    const { upstream, data } = await notionRequest("https://api.notion.com/v1/pages", {
      method: "POST",
      body: JSON.stringify({
        parent: { database_id: notionDatabaseId },
        properties: notionProperties,
        children: blocks,
      }),
    });

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

