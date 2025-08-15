// /api/grade.js
import OpenAI from "openai";

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const MAX_REPLY_CHARS = 8000;

// The 5 labels, single source of truth
const STRUCTURE_LABELS = ["Greeting", "Acknowledge", "Solution", "Offer Support", "Closing"];

// Strict JSON schema (now allows an optional numeric `score` per check)
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
          detail: { type: "string" },
          score:  { type: "number" } // 0–100 per check (optional)
        },
        required: ["label", "ok", "detail"],
        additionalProperties: false
      }
    },
    structurePct: { type: "number" } // 0–100 overall (client ignores this for scoring)
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
For each check, also return a numeric "score" from 0–100 reflecting quality for that item, where 100 means fully met and 0 not met.
`.trim();

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
- "checks": exactly these 5 in order and with these exact labels:
  ${STRUCTURE_LABELS.map((l,i)=>`${i+1}. ${l}`).join("\n  ")}
Each item needs { label, ok, detail, score } where score is 0–100 (use whole numbers).
Also return "structurePct" (0–100) as your overall structure score (the client may show it but not rely on it for grading).
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

    const given = Array.isArray(parsed.checks) ? parsed.checks : [];
    const checks = STRUCTURE_LABELS.map((label, i) => {
      const c = given[i];
      const ok = typeof c?.ok === "boolean" ? c.ok : false;
      const detail = typeof c?.detail === "string" && c.detail ? c.detail : (given[i] ? "Not met" : "AI unavailable");
      const score = Math.max(0, Math.min(100, Number(
        typeof c?.score === "number" ? c.score : (ok ? 100 : 0)
      )));
      return { label, ok, detail, score };
    });

    const structurePct = Math.max(0, Math.min(100, Number(parsed.structurePct ?? 0)));

    return res.status(200).json({ checks, structurePct });
  } catch (err) {
    console.error("grading_failed:", err);
    return res.status(500).json({ error: "grading_failed" });
  }
}
