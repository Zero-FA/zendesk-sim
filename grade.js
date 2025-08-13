// grader.js
// Exports a single function on window: gradeAttempt(ticket, attempt, weights)
//
// - ticket.expected = { requiredStatus, requiredAssignee, keywords[], sections[] }
// - attempt = { reply, status, assignee }
// - weights = { keywords, sections, status, assignee, pass }

(function () {
  function gradeAttempt(ticket, attempt, weights) {
    const w = Object.assign({ keywords: 40, sections: 20, status: 25, assignee: 15, pass: 80 }, weights || {});
    const reply = String(attempt.reply || "").toLowerCase();
    const result = { checks: [], score: 0, pass: false };

    // Keywords
    const need = (ticket.expected?.keywords || []).map(k => k.toLowerCase());
    const found = need.filter(k => reply.includes(k));
    const kwPct = need.length ? (found.length / need.length) : 1;
    result.checks.push({
      label: `Ticket response keywords (${found.length}/${need.length})`,
      ok: kwPct === 1,
      detail: need.map(k => `${reply.includes(k) ? "✅" : "❌"} ${k}`).join(", ")
    });

    // Sections (presence + order)
    const sections = (ticket.expected?.sections || []).map(s => s.toLowerCase());
    let orderOk = true, lastIdx = -1, missing = [];
    for (const sec of sections) {
      const idx = reply.indexOf(sec);
      if (idx === -1) { missing.push(sec); orderOk = false; continue; }
      if (idx < lastIdx) orderOk = false;
      lastIdx = idx;
    }
    let sectionPct = 1;
    if (sections.length) {
      const present = sections.length - missing.length;
      sectionPct = present / sections.length * (orderOk ? 1 : 0.8);
    }
    result.checks.push({
      label: `Response structure (sections)`,
      ok: sectionPct === 1,
      detail: sections.length ? (missing.length ? `Missing: ${missing.join(", ")}` : (orderOk ? "OK" : "Out of order")) : "Not required"
    });

    // Submit As
    const statusOk = String(attempt.status) === String(ticket.expected?.requiredStatus);
    result.checks.push({
      label: `Submit As is "${ticket.expected?.requiredStatus}"`,
      ok: statusOk,
      detail: `Selected: ${attempt.status}`
    });

    // Assignee
    const assigneeOk = String(attempt.assignee) === String(ticket.expected?.requiredAssignee);
    result.checks.push({
      label: `Assignee is "${ticket.expected?.requiredAssignee}"`,
      ok: assigneeOk,
      detail: `Selected: ${attempt.assignee}`
    });

    // Weighted score (normalize to 1)
    const sum = Math.max(1, (w.keywords || 0) + (w.sections || 0) + (w.status || 0) + (w.assignee || 0));
    const sKeywords = kwPct * 100 * (w.keywords || 0) / sum;
    const sSections = sectionPct * 100 * (w.sections || 0) / sum;
    const sStatus   = (statusOk ? 100 : 0) * (w.status || 0) / sum;
    const sAssignee = (assigneeOk ? 100 : 0) * (w.assignee || 0) / sum;

    result.score = sKeywords + sSections + sStatus + sAssignee;
    result.pass = result.score >= (w.pass || 0);

    return result;
  }

  window.gradeAttempt = gradeAttempt;
})();
