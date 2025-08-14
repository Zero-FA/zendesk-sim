// /api/grade.js
import OpenAI from "openai";

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const MAX_REPLY_CHARS = 8000;

// Strict schema: 5 structure checks only
const schema = {
  type: "object",
  properties: {
    checks: {
      type: "array",
      items: {
        type: "object",
        properties: {
          label:  { type: "string" },
          ok:     { type: "boolean" },
          detail: { type: "string" }
        },
        required: ["label", "ok", "detail"]
      }
    },
    structurePct: { type: "number" } // 0–100
  },
  required: ["checks", "structurePct"],
  additionalProperties: false
};

const STYLE_GUIDE = `
Support Ticket Style Guide (Apex Training)
1) Greeting: use customer's first name; brief & warm; no generic corporate openers.
2) Acknowledge: one-line awareness; one short "sorry" max; no re-stating the whole issue.
3) Solution: clear cause/explanation AND a specific, actionable step; include a link only if directly helpful; avoid long background/filler.
4) Offer Support: one short invite for follow-ups; no unrelated resources.
5) Closing: standard sign-off (e.g., "Best regards,") + agent name; no dramatic closings.

Return exactly 5 checks in the above order. Do not include Submit As or Assignee checks.
`;

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  try {
    const { reply } = req.body || {};
    const text = String(reply || "");
    if (!text.trim()) return res.status(400).json({ error: "empty_reply" });
    if (text.length > MAX_REPLY_CHARS) {
      return res.status(413).json({
        error: "reply_too_long",
        max: MAX_REPLY_CHARS,
        received: text.length,
        message: `Reply exceeds ${MAX_REPLY_CHARS} characters. Please shorten it.`
      });
    }

    const system = "You are a strict, fair QA grader for support tickets. Judge ONLY by the style guide. Be concise and deterministic.";

    const user = `
STYLE GUIDE:
${STYLE_GUIDE}

TRAINEE REPLY:
"""${text}"""

Return JSON matching the schema:
- "checks": exactly these 5 in order:
  1. Greeting
  2. Acknowledge
  3. Solution
  4. Offer Support
  5. Closing
Each item needs { label, ok, detail }.
Also return "structurePct" (0–100) as your overall structure score for the 5 checks.
`.trim();

    const r = await client.chat.completions.create({
      model: "gpt-4.1-mini",
      temperature: 0,
      response_format: { type: "json_schema", json_schema: { name: "Grade", schema } },
      messages: [
        { role: "system", content: system },
        { role: "user", content: user }
      ]
    });

    // Safe parse + sanitize
    const content = r.choices?.[0]?.message?.content || "{}";
    let parsed;
    try { parsed = JSON.parse(content); } catch { parsed = {}; }

    const labels = ["Greeting", "Acknowledge", "Solution", "Offer Support", "Closing"];
    const given = Array.isArray(parsed.checks) ? parsed.checks : [];
    const checks = labels.map((label, i) => {
      const c = given[i];
      return {
        label,
        ok: typeof c?.ok === "boolean" ? c.ok : false,
        detail: typeof c?.detail === "string" && c.detail ? c.detail : (given[i] ? "Not met" : "AI unavailable")
      };
    });
    const structurePct = Math.max(0, Math.min(100, Number(parsed.structurePct ?? 0)));

    return res.status(200).json({ checks, structurePct });
  } catch (err) {
    console.error("grading_failed:", err);
    return res.status(500).json({ error: "grading_failed" });
  }
}
