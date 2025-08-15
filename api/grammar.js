// /api/grammar.js
import OpenAI from "openai";

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// JSON schema the model must return
const schema = {
  type: "object",
  properties: {
    corrected: { type: "string" },
    changes: {
      type: "array",
      items: {
        type: "object",
        properties: {
          before: { type: "string" },
          after: { type: "string" },
          reason: { type: "string" }
        },
        required: ["before", "after", "reason"],
        additionalProperties: false
      }
    },
    warnings: {
      type: "array",
      items: { type: "string" }
    }
  },
  required: ["corrected"],
  additionalProperties: false
};

const SYSTEM = `You are a careful copy editor for customer support emails.
Fix grammar, punctuation, capitalization, and clarity. Keep meaning, facts, names, links,
and placeholders intact. Keep the tone professional and concise. Do not invent content.`;

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  try {
    const { text } = req.body || {};
    const input = String(text || "");
    if (!input.trim()) return res.status(400).json({ error: "empty_text" });

    const user = `
Original:
"""${input}"""

Return JSON with:
- "corrected": the improved text (single complete suggestion).
- "changes": a few key before/after snippets with a short "reason".
- "warnings": optional general notes (e.g., tone).
`.trim();

    const r = await client.chat.completions.create({
      model: process.env.OPENAI_GRADE_MODEL || "gpt-4.1-mini",
      temperature: 0,
      response_format: { type: "json_schema", json_schema: { name: "GrammarResult", schema } },
      messages: [
        { role: "system", content: SYSTEM },
        { role: "user", content: user }
      ]
    });

    const content = r.choices?.[0]?.message?.content || "{}";
    let parsed;
    try { parsed = JSON.parse(content); } catch { parsed = {}; }

    const corrected = String(parsed.corrected || input).trim();
    const changes = Array.isArray(parsed.changes) ? parsed.changes : [];
    const warnings = Array.isArray(parsed.warnings) ? parsed.warnings : [];

    return res.status(200).json({ corrected, changes, warnings });
  } catch (err) {
    console.error("grammar_failed:", err);
    return res.status(500).json({ error: "grammar_failed" });
  }
}
