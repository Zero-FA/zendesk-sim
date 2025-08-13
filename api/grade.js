// api/grade.js
export default function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  try {
    const { reply = "", status = "", assignee = "", expected, weights } = req.body || {};
    if (!expected || !weights) {
      return res.status(400).json({ error: 'Missing expected or weights' });
    }

    const w = {
      keywords: Number(weights.keywords || 0),
      sections: Number(weights.sections || 0),
      status:   Number(weights.status   || 0),
      assignee: Number(weights.assignee || 0),
      pass:     Number(weights.pass     || 0)
    };

    const text = String(reply).toLowerCase();

    // 1) Keywords
    const need = (expected.keywords || []).map(k => k.toLowerCase());
    const found = need.filter(k => text.includes(k));
    const kwPct = need.length ? (found.length / need.length) : 1;

    // 2) Sections (presence + order)
    const sections = (expected.sections || []).map(s => s.toLowerCase());
    let orderOk = true, lastIdx = -1, missing = [];
    for (const sec of sections) {
      const idx = text.indexOf(sec);
      if (idx === -1) { missing.push(sec); orderOk = false; continue; }
      if (idx < lastIdx) orderOk = false;
      lastIdx = idx;
    }
    let sectionPct = 1;
    if (sections.length) {
      const present = sections.length - missing.length;
      sectionPct = present / sections.length * (orderOk ? 1 : 0.8);
    }

    // 3) Submit As
    const statusOk = String(status) === String(expected.requiredStatus);

    // 4) Assignee
    const assigneeOk = String(assignee) === String(expected.requiredAssignee);

    // Weighted score
    const sum = Math.max(1, w.keywords + w.sections + w.status + w.assignee);
    const sKeywords = kwPct * 100 * w.keywords / sum;
    const sSections = sectionPct * 100 * w.sections / sum;
    const sStatus   = (statusOk ? 100 : 0) * w.status   / sum;
    const sAssignee = (assigneeOk ? 100 : 0) * w.assignee / sum;
    const score = sKeywords + sSections + sStatus + sAssignee;
    const pass = score >= w.pass;

    return res.status(200).json({
      score,
      pass,
      checks: [
        { label: `Ticket response keywords (${found.length}/${need.length})`, ok: kwPct === 1, detail: need.map(k => `${text.includes(k) ? "✅" : "❌"} ${k}`).join(", ") },
        { label: `Response structure (sections)`, ok: sectionPct === 1, detail: sections.length ? (missing.length ? `Missing: ${missing.join(", ")}` : (orderOk ? "OK" : "Out of order")) : "Not required" },
        { label: `Submit As is "${expected.requiredStatus}"`, ok: statusOk, detail: `Selected: ${status}` },
        { label: `Assignee is "${expected.requiredAssignee}"`, ok: assigneeOk, detail: `Selected: ${assignee}` }
      ]
    });
  } catch (err) {
    return res.status(500).json({ error: 'Grading failed', detail: String(err) });
  }
}
