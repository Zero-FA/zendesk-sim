// server/grade.js
import express from "express";
import OpenAI from "openai";

const app = express();
app.use(express.json({ limit: "1mb" }));
const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// JSON schema the model must follow
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
    structurePct: { type: "number" },  // 0–100 for the 5 parts
  },
  required: ["checks", "structurePct"],
  additionalProperties: false
};

const STYLE_GUIDE = `
[Paste the "Support Ticket Style Guide (Apex Training)" text from above here]
`;

app.post("/grade", async (req, res) => {
  try {
    const { reply, expectedStatus, expectedAssignee } = req.body;

    const system = `You are a strict, fair QA grader for support tickets.
Judge ONLY by the style guide. Be concise and deterministic.`;
    const user = `
STYLE GUIDE:
${STYLE_GUIDE}

EXPECTED:
- Submit As: "${expectedStatus}"
- Assignee: "${expectedAssignee}"

TRAINEE REPLY:
"""${reply || ""}"""

Return JSON that matches the provided JSON Schema:
- "checks": exactly these 7 items in this order:
  1. Greeting
  2. Acknowledge
  3. Solution
  4. Offer Support
  5. Closing
  6. Submit As is "${expectedStatus}"
  7. Assignee is "${expectedAssignee}"
For each check, set ok=true/false and give a short reason in "detail".
Also return "structurePct" from 0–100 for the 5 structure items aggregated.
`;

    // Chat Completions with JSON/structured output
    const r = await client.chat.completions.create({
      model: "gpt-4.1-mini",
      response_format: { type: "json_schema", json_schema: { name: "Grade", schema } },
      messages: [
        { role: "system", content: system },
        { role: "user", content: user }
      ],
      temperature: 0
    });

    const parsed = JSON.parse(r.choices[0].message.content);
    res.json(parsed);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "grading_failed" });
  }
});

app.listen(8787, () => console.log("Grader running on http://localhost:8787/grade"));
