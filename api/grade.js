// /api/grade.js
import OpenAI from "openai";

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

/** ---------------- Config & Helpers ---------------- **/

const ACCESS_CODE_ENV = process.env.ACCESS_CODE || "apex2025";
const EXPECTED_FIRST_ENV = process.env.EXPECTED_FIRST_NAME || "";
const EXPECTED_LAST_ENV  = process.env.EXPECTED_LAST_NAME  || "";

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
- One line: Hello/Hi/Good <time> <FirstName>, then one blank line.
- Use the customer's first name if provided.
- Keep feedback short; suggest the corrected line.

2) Opener (short & professional)
- One short sentence (<= 200 chars). Natural “Thanks/Thank you/Happy to help” is fine, punctuation flexible.
- Accept these verbatim too:
  Thank you for reaching out to Apex Trader Funding Support.
  Thank you for contacting us.
  Thank you for the information.
  I’m happy to help.
  Happy to help.
  We can help with that.
- If slightly wordy, pass with a brief suggestion (don’t fail for style).

3) Solution
- Give a clear cause/explanation AND a concrete next step the user can take now.
- If no direct fix, follow ticket-specific requirements.

4) Closer (one concise line)
- E.g., Thank you and have a great day!
- Prefer a next-step invitation.

5) Sign-Off
- Accepted phrases (case-insensitive), each ending with a comma on its own line:
  Best regards, | Kind regards, | Warm regards, | Kindly, | Regards,
  Thank you, | Thanks, | Sincerely, | Respectfully,
- Then one blank line, then the agent’s FIRST name alone.
`.trim();

// Full accepted sign-off RX (server truth)
const SIGNOFF_PHRASE_RX = /(Best regards,|Kind regards,|Warm regards,|Kindly,|Regards,|Thank you,|Thanks,|Sincerely,|Respectfully,)/i;

const clamp0to100 = n => (Number.isFinite(n) ? Math.max(0, Math.min(100, n)) : 0);
const normalizeEOL = s => String(s || "").replace(/\r\n/g, "\n");
const firstToken   = s => String(s || "").trim().split(/\s+/)[0] || "";

function lastLine(s){
  const m = normalizeEOL(s).match(/\n\n([^\n]+)\s*$/);
  return m ? m[1].trim() : "";
}

function extractGreetingName(s){
  const T = normalizeEOL(s).trimStart();
  const m = T.match(/^(Hello|Hi|Hey|Good (morning|afternoon|evening)) ([^,\n]+),\n/i);
  return m ? m[3].trim() : "";
}

function afterGreetingIndex(text){
  const T = normalizeEOL(text);
  const m = T.match(/^(Hello|Hi|Hey|Good (morning|afternoon|evening)) [^,\n]+,\n\n/i);
  return m ? m[0].length : -1;
}

function firstParagraphAt(T, start){
  if (start < 0) return "";
  const rest = T.slice(start);
  const m = rest.match(/^([^\n]+)(?:\n|$)/);
  return m ? m[1].trim() : "";
}

function isLikelyOpener(p){
  if (!p) return false;
  const allowed = [
    "Thank you for reaching out to Apex Trader Funding Support.",
    "Thank you for contacting us.",
    "Thank you for the information.",
    "I’m happy to help.",
    "I'm happy to help.",
    "Happy to help.",
    "We can help with that."
  ];
  const norm = p.trim().replace(/\s+/g, " ");
  // treat trailing punctuation . ! ? interchangeably
  const normNoPunc = norm.replace(/[.!?]+$/, "");
  if (allowed.some(x => x.replace(/[.!?]+$/,"").toLowerCase() === normNoPunc.toLowerCase())) return true;

  // permissive: one sentence <=200 chars, not instruction-y
  const singleSentenceish = norm.length <= 200 && !/\n/.test(norm);
  const tooSpecific = /\b(screenshot|steps?|click|attach(ed)?|refund|transaction|order|account|price|must|should)\b/i;
  return singleSentenceish && !tooSpecific.test(norm);
}

function hasGreetingBlankLine(s){
  const T = normalizeEOL(s);
  return /^(Hello|Hi|Hey|Good (morning|afternoon|evening)) [^,\n]+,\n\n[^\n]/i.test(T);
}
function hasSignoffBlankLine(s){
  const T = normalizeEOL(s);
  return new RegExp(`${SIGNOFF_PHRASE_RX.source}\\n\\n[^\\n]+\\s*$`, "mi").test(T);
}
const hasAcceptedSignoffPhrase = s => SIGNOFF_PHRASE_RX.test(s);
const equalsIgnoreCase = (a,b) => String(a || "").trim().toLowerCase() === String(b || "").trim().toLowerCase();

function stripCodeFencesAndLabels(detail){
  let d = String(detail || "");
  d = d.replace(/^\s*Example\s*fix:\s*/i, "");
  d = d.replace(/```[\s\S]*?```/g, blk => blk.replace(/```/g, "").trim());
  d = d.replace(/`/g, "");
  return d.trim();
}

/** ---------------- HTTP Handler ---------------- **/

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  try {
    const {
      mode = "structure",
      reply,
      rubric = "",
      accessCode,
      agentFirstName,
      agentLastName,
      customerFirstName
    } = req.body || {};

    // Access gate
    const ACCESS_CODE = String(ACCESS_CODE_ENV || "").trim();
    const providedCode = String(accessCode || "").trim();
    if (ACCESS_CODE && providedCode !== ACCESS_CODE) {
      return res.status(403).json({ error: "forbidden", detail: "Invalid or missing access code." });
    }

    const textRaw = String(reply || "");
    if (!textRaw.trim()) return res.status(400).json({ error: "empty_reply" });

    const EXPECTED_FIRST = String(agentFirstName || EXPECTED_FIRST_ENV || "").trim();
    const EXPECTED_LAST  = String(agentLastName  || EXPECTED_LAST_ENV  || "").trim();
    const EXPECTED_CUSTOMER_FIRST = String(customerFirstName || "").trim();
    const text = normalizeEOL(textRaw);

    // Hard facts
    const greetingBlank     = hasGreetingBlankLine(text);
    const greetingNameFound = extractGreetingName(text);
    const greetingNameOK = EXPECTED_CUSTOMER_FIRST
      ? equalsIgnoreCase(firstToken(greetingNameFound), firstToken(EXPECTED_CUSTOMER_FIRST))
      : true;

    const signoffPhraseOK = hasAcceptedSignoffPhrase(text);
    const signoffBlank    = hasSignoffBlankLine(text);
    const agentNameLine   = lastLine(text);

    let agentFirstOnlyOK = true;
    if (EXPECTED_FIRST) {
      agentFirstOnlyOK = equalsIgnoreCase(agentNameLine, EXPECTED_FIRST);
    } else {
      agentFirstOnlyOK = /^[A-Za-z][A-Za-z .,'-]{0,60}[A-Za-z]$/.test(agentNameLine);
    }

    const computedFacts = {
      has_greeting_blank_line: greetingBlank,
      greeting_name: greetingNameFound,
      expected_customer_first: EXPECTED_CUSTOMER_FIRST,
      greeting_uses_customer_first: greetingNameOK,
      has_signoff_phrase: signoffPhraseOK,
      has_signoff_blank_line: signoffBlank,
      agent_name_line: agentNameLine,
      agent_first_name_only: agentFirstOnlyOK,
      expected_first_name: EXPECTED_FIRST,
      expected_last_name: EXPECTED_LAST
    };

    const visibleText = text.replace(/\n/g, "\\n\n");

    // ===== Requirements-only mode =====
    if (String(mode).toLowerCase() === "requirements") {
      const system =
        "You are a strict QA grader for internal support notes. " +
        "Grade ONLY against the provided Requirements. Ignore greeting/opener/closer/sign-off. Be concise.";

      const user = `
REQUIREMENTS (must-have points):
${rubric || "None."}

INTERNAL NOTE (trainee):
"""${text}"""

Return JSON:
- ok (boolean): true only if all required points are present/correct
- score (0–100)
- detail: short bullets of met/missed items (be specific)
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

    // ===== Structure mode =====
    const system =
      "You are a fair QA grader for support tickets. Judge ONLY by the style guide and ticket-specific requirements. " +
      "Prefer passing with a short suggestion over failing for minor style. Use COMPUTED FACTS for newline/name checks.";

    const labelsList = STRUCTURE_LABELS.map((l, i) => `${i + 1}. ${l}`).join("\n  ");

    const user = `
You are grading a customer support reply.

Structure labels:
${STRUCTURE_LABELS.join(", ")}

HARD RULES:
- “Blank line” means exactly "\\n\\n".
- Greeting: fail if not "Hello/Hi/Hey/Good <time> <Name>," on its own line followed by one blank line; if expected name is provided, first token must match (case-insensitive).
- Sign-Off: fail if not (1) accepted sign-off phrase ending with comma, (2) one blank line, (3) agent first name alone.
- Prefer short, professional feedback.

STYLE GUIDE:
${STYLE_GUIDE}

TICKET-SPECIFIC REQUIREMENTS:
${rubric || "None."}

COMPUTED FACTS:
${JSON.stringify(computedFacts, null, 2)}

TRAINEE REPLY (visible newlines):
---BEGIN-VISIBLE---
${visibleText}
---END-VISIBLE---

Return JSON with:
- "checks": exactly these 5 labels in order:
  ${labelsList}
  Each = { label, ok, detail, score(0–100) }.
- "structurePct": overall structure score (0–100).

Feedback rules:
- If FAIL: name the issue briefly and include ONE example line (plain text; show literal line breaks if needed).
- If PASS but improvable: give ONE short suggestion.
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

    if (Array.isArray(parsed?.checks)) {
      parsed.checks = parsed.checks.map(it => ({ ...it, detail: stripCodeFencesAndLabels(it.detail) }));
    }
    parsed.structurePct = clamp0to100(parsed.structurePct);

    // ---- Deterministic Greeting (short feedback) ----
    try {
      const greetIdx = STRUCTURE_LABELS.indexOf("Greeting");
      if (Array.isArray(parsed?.checks) && greetIdx !== -1) {
        if (!greetingBlank || !greetingNameOK) {
          const expected = firstToken(EXPECTED_CUSTOMER_FIRST || "Name");
          parsed.checks[greetIdx] = {
            label: "Greeting",
            ok: false,
            score: 0,
            detail: `Format or name issue. Use: Hi ${expected},`
          };
        }
      }
    } catch {}

    // ---- Deterministic Opener (lenient) ----
    try {
      const openerIdx = STRUCTURE_LABELS.indexOf("Opener");
      if (Array.isArray(parsed?.checks) && openerIdx !== -1) {
        const start = afterGreetingIndex(text);
        const opener = firstParagraphAt(text, start);
        const afterOpener = start >= 0 ? text.slice(start + (opener ? opener.length : 0)) : "";
        const hasBlankAfter = /^\n\n/.test(afterOpener);
        const likely = isLikelyOpener(opener);

        // If it looks like a normal opener, PASS; suggest a blank line if missing.
        if (likely) {
          parsed.checks[openerIdx] = {
            label: "Opener",
            ok: true,
            score: hasBlankAfter ? 100 : 95,
            detail: hasBlankAfter ? "Looks good." : "Looks good. Consider adding a blank line after the opener."
          };
        } else {
          const exampleName = firstToken(EXPECTED_CUSTOMER_FIRST || "John");
          parsed.checks[openerIdx] = {
            label: "Opener",
            ok: false,
            score: 0,
            detail: `Add a short one-line opener before the solution.\nHi ${exampleName},\n\nThanks for reaching out—happy to help.`
          };
        }
      }
    } catch {}

    // ---- Deterministic Sign-Off (accept full set including Kindly,) ----
    try {
      const signIdx = STRUCTURE_LABELS.indexOf("Sign-Off");
      if (Array.isArray(parsed?.checks) && signIdx !== -1) {
        const phraseOK = hasAcceptedSignoffPhrase(text);
        const blankOK  = hasSignoffBlankLine(text);
        const nameOK   = !!(EXPECTED_FIRST ? equalsIgnoreCase(lastLine(text), EXPECTED_FIRST) : lastLine(text));

        if (!phraseOK || !blankOK || !nameOK) {
          const expectedAgent = EXPECTED_FIRST || "[Your Name]";
          const parts = [];
          if (!phraseOK) parts.push("use an accepted sign-off (e.g., Kindly,)");
          if (!blankOK)  parts.push("add one blank line after the sign-off");
          if (!nameOK)   parts.push("put your first name on its own line");

          parsed.checks[signIdx] = {
            label: "Sign-Off",
            ok: false,
            score: 0,
            detail: `Fix sign-off: ${parts.join("; ")}.\nKind regards,\n\n${expectedAgent}`
          };
        } else {
          // tighten feedback text if model was nitpicky
          parsed.checks[signIdx] = {
            label: "Sign-Off",
            ok: true,
            score: 100,
            detail: "Looks good."
          };
        }
      }
    } catch {}

    return res.status(200).json(parsed);

  } catch (err) {
    console.error("grading_failed:", err);
    return res.status(500).json({ error: "grading_failed" });
  }
}
