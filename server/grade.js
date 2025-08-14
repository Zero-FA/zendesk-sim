// api/grade.js
import OpenAI from "openai";

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const schema = {
  type: "object",
  properties: {
    checks: {
      type: "array",
      items: {
        type: "object",
        properties: {
          label: { type: "string" },
          ok: { type: "boolean" },
          detail: { type: "string" }
        },
        required: ["label", "ok", "detail"]
      }
    },
    structurePct: { type: "number" }
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
Non-text checks: Submit As must match expected status; Assignee must match expected assignee.
Scoring: The 5 structure parts share the "sections" weight equally; Status and Assignee use their own weights; pass if total ≥ weights.pass.
`;

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { reply, expectedStatus, expectedAssignee } = req.body || {};

    const system = `You are a strict, fair QA grader for support tickets. Judge ONLY by the style guide. Be concise and deterministic.`;
    const user = `
STYLE GUIDE:
${STYLE_GUIDE}

EXPECTED:
- Submit As: "${expectedStatus}"
- Assignee: "${expectedAssignee}"

TRAINEE REPLY:
"""${reply || ""}"""

Return JSON that matches the provided JSON Schema.
- "checks": exactly 7 items in this order:
  1. Greeting
  2. Acknowledge
  3. Solution
  4. Offer Support
  5. Closing
  6. Submit As is "${expectedStatus}"
  7. Assignee is "${expectedAssignee}"
Set ok=true/false and a short reason in "detail".
Also return "structurePct" from 0–100 for the 5 structure items aggregated.
`;

    const r = await client.chat.completions.create({
      model: "gpt-4.1-mini",
      temperature: 0,
      response_format: { type: "json_schema", json_schema: { name: "Grade", schema } },
      messages: [
        { role: "system", content: system },
        { role: "user", content: user }
      ]
    });

    const content = r.choices?.[0]?.message?.content || "{}";
    const parsed = JSON.parse(content);

    return res.status(200).json(parsed);
  } catch (err) {
    console.error("grading_failed:", err);
    return res.status(500).json({ error: "grading_failed" });
  }
}
