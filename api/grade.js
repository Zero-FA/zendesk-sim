// /api/grade.js
import OpenAI from "openai";

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Keep this in sync with client labels
const STRUCTURE_LABELS = ["Greeting", "Opener", "Solution", "Closer", "Sign-Off"];

/* ---------- JSON schema for structure mode ---------- */
const STRUCT_SCHEMA = {
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
          score:  { type: "number" }
        },
        required: ["label", "ok", "detail"],
        additionalProperties: false
      }
    },
    structurePct: { type: "number" }
  },
  required: ["checks", "structurePct"],
  additionalProperties: false
};

/* ---------- JSON schema for requirements-only mode ---------- */
const REQ_SCHEMA = {
  type: "object",
  properties: {
    ok:     { type: "boolean" },
    score:  { type: "number" },
    detail: { type: "string" }
  },
  required: ["ok", "score", "detail"],
  additionalProperties: false
};

const STYLE_GUIDE = `
Support Ticket Style Guide (Apex Trader Funding Training)

1) Greeting
- Use the customer's first name; brief & warm.
- Must be a single line ending with a comma, followed by exactly one blank line.
- Accept: "Hello <Name>,", "Hi <Name>,", "Good morning <Name>,"
- Common issues to flag: missing comma, extra text on the greeting line, no blank line after, missing/incorrect name, wrong casing.
- Feedback should reference the exact issue(s) detected and suggest a corrected line.

2) Opener
- One short opening sentence, polite and professional.
- Do NOT fail purely for sentence length or for using an exclamation mark if it reads naturally.

3) Solution
- Provide a clear cause/explanation AND a specific, actionable step the user can take now.
- If a direct solution is not possible, follow the ticket-specific requirements exactly.

4) Closer
- One concise, professional line (invitation, empathy, thanks, or brief confirmation).
- Prefer an explicit invitation/next step (e.g., “If anything else comes up, reply to this email and we’ll help.”).
- If vague or missing, suggest a 1-sentence improvement in feedback.

5) Sign-Off
- Standard sign-off and agent first name on its own line.
- Examples: "Best regards,", "Kind regards,"
- Leave a blank line before the agent's name.
`.trim();

function clamp0to100(n){ n=Number.isFinite(n)?n:0; return n<0?0:n>100?100:n; }

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const {
      mode = "structure",  // "structure" | "requirements"
      reply,
      rubric = ""
    } = req.body || {};

    const text = String(reply || "");
    if (!text.trim()) return res.status(400).json({ error: "empty_reply" });

    // ===== Mode A: Requirements-only (internal tickets)
    if (String(mode).toLowerCase() === "requirements") {
      const system =
        "You are a strict QA grader for internal support notes. " +
        "Grade ONLY whether the note satisfies the provided Requirements. " +
        "Ignore greeting, opener, closer, and sign-off. Be concise and deterministic.";

      const user = `
REQUIREMENTS (must-have points):
${rubric || "None."}

INTERNAL NOTE (trainee):
"""${text}"""

Return JSON with:
- ok (boolean): true only if all required points are present and correct
- score (0–100): your numeric judgement for the requirements coverage
- detail: a short bullet summary of which required points were met/missed (be specific).
`.trim();

      const r = await client.chat.completions.create({
        model: process.env.OPENAI_GRADE_MODEL || "gpt-4.1-mini",
        temperature: 0,
        response_format: { type: "json_schema", json_schema: { name: "Requirements", schema: REQ_SCHEMA } },
        messages: [
          { role: "system", content: system },
          { role: "user", content: user }
        ]
      });

      const content = r.choices?.[0]?.message?.content || "{}";
      let parsed; try { parsed = JSON.parse(content); } catch { parsed = {}; }

      return res.status(200).json({
        ok: !!parsed.ok,
        score: clamp0to100(parsed.score),
        detail: String(parsed.detail || "")
      });
    }

    // ===== Mode B: Structure grading (public tickets)
    const system =
      "You are a strict, fair QA grader for support tickets. Judge ONLY by the style guide and the ticket-specific requirements. Be concise and deterministic.";

    const labelsList = STRUCTURE_LABELS.map((l, i) => `${i + 1}. ${l}`).join("\n  ");

   const user = `
You are grading a customer support reply for structure and style.

Structure labels to check, in order:
${STRUCTURE_LABELS.join(", ")}

HARD RULES (enforce regardless of tone/context):
- Greeting: FAIL if the first greeting line is not "Hello/Hi/Hey/Good <time of day> <Name>," exactly ending with a comma (no extra text on that line). Also require one blank line after the greeting.
- Sign-Off: FAIL if there is not (1) a standard sign-off line ending with a comma (e.g., "Best regards,"), then (2) one blank line, then (3) the agent's name on its own line.

STYLE GUIDE:
${STYLE_GUIDE}

TICKET-SPECIFIC REQUIREMENTS (if any):
${rubric || "None."}

TRAINEE REPLY:
"""${text}"""

Return JSON matching the schema:
- "checks": exactly these 5 in order and with these exact labels:
  ${labelsList}
Each item must include { label, ok, detail, score } where score is 0–100 (100 = fully met).

Write "detail" as ACTIONABLE feedback:
- If a label FAILS, identify the specific issue(s) you observed in the trainee text and include ONE single-line example fix the trainee could paste (concrete, minimal). If the customer’s name is unknown, use “there” (e.g., "Hello there,").
- If a label PASSES but could be improved, include ONE concise suggestion (max one sentence).

Also return "structurePct" (0–100) as your overall structure score.
`.trim();

    const r = await client.chat.completions.create({
      model: process.env.OPENAI_GRADE_MODEL || "gpt-4.1-mini",
      temperature: 0,
      response_format: { type: "json_schema", json_schema: { name: "Grade", schema: STRUCT_SCHEMA } },
      messages: [
        { role: "system", content: system },
        { role: "user", content: user }
      ]
    });

    const content = r.choices?.[0]?.message?.content || "{}";
    let parsed; try { parsed = JSON.parse(content); } catch { parsed = {}; }

    // pass back what the client expects for structure mode
    return res.status(200).json(parsed);

  } catch (err) {
    console.error("grading_failed:", err);
    return res.status(500).json({ error: "grading_failed" });
  }
}
