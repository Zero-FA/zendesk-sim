// /api/grade.js
import OpenAI from "openai";

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Keep this in sync with the client UI and weights
const STRUCTURE_LABELS = ["Greeting", "Opener", "Solution", "Closer", "Sign-Off"];

// Strict JSON schema for the model to follow
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
          score:  { type: "number" } // optional, 0–100
        },
        required: ["label", "ok", "detail"],
        additionalProperties: false
      }
    },
    structurePct: { type: "number" } // 0–100
  },
  required: ["checks", "structurePct"],
  additionalProperties: false
};

const STYLE_GUIDE = `
Support Ticket Style Guide (Apex Training)

1) Greeting
- Use customer's first name; brief & warm.
- Examples: "Hello Sara,", "Hi John,", "Hello again, John,"
- Leave one blank line after the greeting.

2) Opener
- One short opening sentence, polite and professional.
- Do NOT fail purely for sentence length or for using an exclamation mark if it reads naturally.
- Examples: "Thank you for reaching out to Apex Trader Funding Support! I hope you're having a great day."
- Keep it concise and on-tone (no fluff).

3) Solution
- Most important part.
- Provide a clear cause/explanation AND a specific, actionable step the user can take now.
- If a direct solution is not possible, follow the ticket-specific requirements exactly.
- Include a link only if required by the SOP or directly needed.

4) Closer
- A single short, professional line that suits the context. It may be ANY ONE of:
  • an invitation to reach out again, OR
  • an empathetic acknowledgement (esp. if user is upset), OR
  • a brief confirmation/encouragement that the path forward is clear, OR
  • a simple gratitude sentence.
- Do NOT require all of the above; one is sufficient if concise and professional.
- Examples (all valid):
  "If you have any other questions, please don’t hesitate to reach out."
  "I understand this isn’t the outcome you hoped for and appreciate your understanding."
  "Thanks for your patience on this."
  "Glad I could help—reach out if anything else comes up."

5) Sign-Off
- Standard sign-off and agent first name on its own line.
- Examples: "Best regards,", "Kind regards,"
- Leave a blank line before the agent's name.
`.trim();

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { reply, rubric = "" } = req.body || {};
    const text = String(reply || "");
    if (!text.trim()) return res.status(400).json({ error: "empty_reply" });

    const system =
      "You are a strict, fair QA grader for support tickets. Judge ONLY by the style guide and the ticket-specific requirements. Be concise and deterministic.";

    const labelsList = STRUCTURE_LABELS.map((l, i) => `${i + 1}. ${l}`).join("\n  ");

    const user = `
You are grading a customer support reply for structure and style.

Structure labels to check, in order:
${STRUCTURE_LABELS.join(", ")}

Important: For the Opener, do NOT penalize for sentence length or the presence of an exclamation mark; judge only tone (polite, professional) and relevance.

STYLE GUIDE:
${STYLE_GUIDE}

TICKET-SPECIFIC REQUIREMENTS (if any):
${rubric || "None."}

TRAINEE REPLY:
"""${text}"""

Return JSON matching the schema:
- "checks": exactly these 5 in order and with these exact labels:
  ${labelsList}
Each item needs { label, ok, detail, score } where score is 0–100 (100 = fully met).
Also return "structurePct" (0–100) as your overall structure score.
`.trim();

    const r = await client.chat.completions.create({
      model: process.env.OPENAI_GRADE_MODEL || "gpt-4.1-mini",
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
      const detail =
        typeof c?.detail === "string" && c.detail ? c.detail : (given[i] ? "Not met" : "AI unavailable");
      const score = clamp0to100(typeof c?.score === "number" ? c.score : (ok ? 100 : 0));
      return { label, ok, detail, score };
    });

    const structurePct = clamp0to100(Number(parsed.structurePct ?? 0));

    return res.status(200).json({ checks, structurePct });
  } catch (err) {
    console.error("grading_failed:", err);
    return res.status(500).json({ error: "grading_failed" });
  }
}

function clamp0to100(n) {
  n = Number.isFinite(n) ? n : 0;
  if (n < 0) return 0;
  if (n > 100) return 100;
  return n;
}
