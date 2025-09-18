// /api/grade.js
import OpenAI from "openai";

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

/** ---------------- Config & Helpers ---------------- **/

// Optional env fallbacks
const ACCESS_CODE_ENV = process.env.ACCESS_CODE || "apex2025";
const EXPECTED_FIRST_ENV = process.env.EXPECTED_FIRST_NAME || "";
const EXPECTED_LAST_ENV  = process.env.EXPECTED_LAST_NAME  || "";

// Keep this in sync with client labels
const STRUCTURE_LABELS = ["Greeting", "Opener", "Solution", "Closer", "Sign-Off"];

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
        required: ["label", "ok", "detail", "score"],
        additionalProperties: false
      }
    },
    structurePct: { type: "number" }
  },
  required: ["checks", "structurePct"],
  additionalProperties: false
};

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
- Use a standard closing phrase on its own line.
- Examples of accepted phrases: "Best regards,", "Kind regards,", "Warm regards,"
- The phrase must include a comma at the end.
- Insert one blank line after the closing phrase.
- Write the agent's first name only on a new line, below the blank line.
- No last name, title, or additional text.
`.trim();

const SIGNOFF_PHRASE_RX = /(Best regards,|Kind regards,|Warm regards,)/;

function clamp0to100(n){ n=Number.isFinite(n)?n:0; return n<0?0:n>100?100:n; }
function normalizeEOL(s){ return String(s || "").replace(/\r\n/g, "\n"); }
function lastLine(s){
  const m = normalizeEOL(s).match(/\n\n([^\n]+)\s*$/); // text after the blank line at end
  return m ? m[1].trim() : "";
}
function hasGreetingBlankLine(s){
  // greeting ends with comma on first line, then exactly one blank line
  const T = normalizeEOL(s);
  // Start-of-text greeting pattern:
  return /^(Hello|Hi|Hey|Good (morning|afternoon|evening)) [^,\n]+,\n\n/.test(T);
}
function hasSignoffBlankLine(s){
  const T = normalizeEOL(s);
  // look for an accepted sign-off followed by exactly one blank line then some name to end
  return new RegExp(`${SIGNOFF_PHRASE_RX.source}\\n\\n[^\\n]+\\s*$`, "m").test(T);
}
function hasAcceptedSignoffPhrase(s){
  return SIGNOFF_PHRASE_RX.test(s);
}
function equalsIgnoreCase(a,b){ return String(a || "").trim().toLowerCase() === String(b || "").trim().toLowerCase(); }
function stripCodeFencesAndLabels(detail){
  let d = String(detail || "");
  // Strip “Example fix:” prefix if present
  d = d.replace(/^\s*Example\s*fix:\s*/i, "");
  // Unwrap triple-backtick blocks
  d = d.replace(/```[\s\S]*?```/g, (blk) => blk.replace(/```/g, "").trim());
  // Remove stray inline backticks
  d = d.replace(/`/g, "");
  return d.trim();
}

/** ---------------- HTTP Handler ---------------- **/

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  try {
    const {
      mode = "structure",      // "structure" | "requirements"
      reply,
      rubric = "",
      // access gate + identity (allow UI to prompt for these alongside the “apex2025” step)
      accessCode,
      agentFirstName,
      agentLastName
    } = req.body || {};

    // Access gate
    const ACCESS_CODE = String(ACCESS_CODE_ENV || "").trim();
    const providedCode = String(accessCode || "").trim();
    if (ACCESS_CODE && providedCode !== ACCESS_CODE) {
      return res.status(403).json({ error: "forbidden", detail: "Invalid or missing access code." });
    }

    const textRaw = String(reply || "");
    if (!textRaw.trim()) return res.status(400).json({ error: "empty_reply" });

    // Agent identity (multi-word first names supported)
    const EXPECTED_FIRST = String(agentFirstName || EXPECTED_FIRST_ENV || "").trim();  // e.g., "Sean Michael"
    const EXPECTED_LAST  = String(agentLastName  || EXPECTED_LAST_ENV  || "").trim();  // e.g., "O'Donoghue"

    const text = normalizeEOL(textRaw);

    // ---------- Hard-rule computations (authoritative) ----------
    const greetingBlank = hasGreetingBlankLine(text);
    const signoffPhraseOK = hasAcceptedSignoffPhrase(text);
    const signoffBlank = hasSignoffBlankLine(text);
    const agentNameLine = lastLine(text); // the name after the blank line

    // If we know expected first/last, enforce "first name only" (multi-word first ok)
    let agentFirstOnlyOK = true;
    if (EXPECTED_FIRST) {
      agentFirstOnlyOK = equalsIgnoreCase(agentNameLine, EXPECTED_FIRST);
    } else {
      // fallback heuristic: disallow obvious last-name patterns (two+ words)
      agentFirstOnlyOK = !/^\s*\S+\s+\S+/.test(agentNameLine); // e.g., "Jane Doe" => false
    }

    // Explicit “COMPUTED FACTS” booleans we’ll feed to the model
    const computedFacts = {
      has_greeting_blank_line: greetingBlank,
      has_signoff_phrase: signoffPhraseOK,
      has_signoff_blank_line: signoffBlank,
      agent_name_line: agentNameLine,
      agent_first_name_only: agentFirstOnlyOK,
      expected_first_name: EXPECTED_FIRST,
      expected_last_name: EXPECTED_LAST
    };

    // Visible newline rendering for the model
    const visibleText = text
      .replace(/\n/g, "\\n\n"); // show literal \n markers on each line break

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
      parsed.detail = stripCodeFencesAndLabels(parsed.detail);

      return res.status(200).json({
        ok: !!parsed.ok,
        score: clamp0to100(parsed.score),
        detail: String(parsed.detail || "")
      });
    }

    // ===== Mode B: Structure grading (public tickets)
    const system =
      "You are a strict, fair QA grader for support tickets. Judge ONLY by the style guide and the ticket-specific requirements. Be concise and deterministic. " +
      "Use the provided COMPUTED FACTS as ground truth for newline/layout and agent-name checks.";

    const labelsList = STRUCTURE_LABELS.map((l, i) => `${i + 1}. ${l}`).join("\n  ");

    const user = `
You are grading a customer support reply for structure and style.

Structure labels to check, in order:
${STRUCTURE_LABELS.join(", ")}

HARD RULES (literal characters only):
- A “blank line” means exactly two consecutive line breaks in the raw text: "\\n\\n".
- Greeting: FAIL if the first greeting line is not "Hello/Hi/Hey/Good <time of day> <Name>," exactly ending with a comma (no extra text on that line), or if there is no blank line after it.
- Sign-Off: FAIL if there is not (1) a standard sign-off line ending with a comma (e.g., "Best regards,"), then (2) one blank line, then (3) the agent's name on its own line.
- Agent name rule: Use COMPUTED FACTS.agent_first_name_only (multi-word first names are allowed).

STYLE GUIDE:
${STYLE_GUIDE}

TICKET-SPECIFIC REQUIREMENTS (if any):
${rubric || "None."}

COMPUTED FACTS (authoritative):
${JSON.stringify(computedFacts, null, 2)}

TRAINEE REPLY (visible newlines):
---BEGIN-VISIBLE---
${visibleText}
---END-VISIBLE---

Return JSON matching the schema:
- "checks": exactly these 5 in order and with these exact labels:
  ${labelsList}
Each item must include { label, ok, detail, score } where score is 0–100 (100 = fully met).

Write "detail" as ACTIONABLE feedback:
- If a label FAILS, identify the specific issue(s) you observed in the trainee text and include ONE example fix.
- Formatting rules for the example fix:
  • Plain text only (no backticks, no fenced code, no “Example fix:” prefix).
  • Put the example on its own line.
  • Show actual line breaks literally (do not describe them). For example:
    Kind regards,

    ${EXPECTED_FIRST || "Sean"}

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

    // Post-process details to guarantee plain text (no code fences/backticks/"Example fix:")
    if (Array.isArray(parsed?.checks)) {
      parsed.checks = parsed.checks.map(it => ({
        ...it,
        detail: stripCodeFencesAndLabels(it.detail)
      }));
    }
    parsed.structurePct = clamp0to100(parsed.structurePct);

    return res.status(200).json(parsed);

  } catch (err) {
    console.error("grading_failed:", err);
    return res.status(500).json({ error: "grading_failed" });
  }
}
